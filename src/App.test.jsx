import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'
import { sampleNotifications } from './data/sampleNotifications.js'

// These are navigation/state-preservation regression tests for the three-stage
// UI. They run entirely in Demo mode (the default), so no network/AI is used
// and behaviour is deterministic.

const photosSample = sampleNotifications.find((s) => s.id === 'grandchild-photos')

// Helper: pick a sample card by its title and press "Explain this message".
async function explainSample(user, title) {
  const card = screen.getByText(title).closest('button')
  await user.click(card)
  await user.click(screen.getByRole('button', { name: /explain this message/i }))
}

const billSample = sampleNotifications.find((s) => s.id === 'electricity-bill')
const familySample = sampleNotifications.find((s) => s.id === 'family-message')

describe('App — example cards', () => {
  it('shows six example cards, each with a title and a choose label only', () => {
    render(<App />)
    const chooseButtons = screen.getAllByText(/choose this example/i)
    expect(chooseButtons).toHaveLength(6)
    // Cards carry no sub-description element anymore.
    expect(document.querySelector('.dc-sample-card__summary')).toBeNull()
  })
})

describe('App — example cards toggle', () => {
  it('clicking a selected example again clears the box', async () => {
    const user = userEvent.setup()
    render(<App />)
    const card = screen.getByText(billSample.title).closest('button')

    await user.click(card) // select -> fills the box
    expect(screen.getByRole('textbox')).not.toHaveValue('')

    await user.click(card) // click again -> clears
    expect(screen.getByRole('textbox')).toHaveValue('')
  })
})

describe('App — three-stage navigation', () => {
  it('starts on the Message stage (step 1; guidance step not yet shown)', () => {
    render(<App />)
    // No result yet, so the progress shows the two base steps only.
    expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /explain this message/i }),
    ).toBeInTheDocument()
  })

  it('advances to the Actions stage after explaining a sample', async () => {
    const user = userEvent.setup()
    render(<App />)
    await explainSample(user, photosSample.title)

    await waitFor(() =>
      expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument(),
    )
    // The actions stage shows the "what you need to do" heading.
    expect(screen.getByText(/what you need to do/i)).toBeInTheDocument()
    // The input textarea is no longer on screen (one stage at a time).
    expect(screen.queryByLabelText(/paste your own message/i)).toBeNull()
  })

  it('advances to the Guidance stage via "Help me do this"', async () => {
    const user = userEvent.setup()
    render(<App />)
    await explainSample(user, photosSample.title)
    await screen.findByText(/step 2 of 3/i)

    await user.click(screen.getByRole('button', { name: /help me do this/i }))

    await waitFor(() =>
      expect(screen.getByText(/step 3 of 3/i)).toBeInTheDocument(),
    )
    // Guidance shows a step counter from GuidanceFlow.
    expect(screen.getByText(/step 1 of/i)).toBeInTheDocument()
  })
})

describe('App — state preservation when navigating backward', () => {
  it('keeps the message and result when going Actions -> Message -> Actions', async () => {
    const user = userEvent.setup()
    render(<App />)
    await explainSample(user, photosSample.title)
    await screen.findByText(/step 2 of 3/i)

    // Back to the message stage.
    await user.click(screen.getByRole('button', { name: /back to message/i }))
    await screen.findByText(/step 1 of 3/i)

    // The message text is preserved in the textarea.
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue(photosSample.text)

    // And the previous result is still available: a "Continue" button appears
    // without re-processing.
    const continueBtn = screen.getByRole('button', {
      name: /continue to your actions/i,
    })
    await user.click(continueBtn)
    await waitFor(() =>
      expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument(),
    )
    expect(screen.getByText(/what you need to do/i)).toBeInTheDocument()
  })

  it('keeps the guidance when going Guide -> Actions -> Guide', async () => {
    const user = userEvent.setup()
    render(<App />)
    await explainSample(user, photosSample.title)
    await screen.findByText(/step 2 of 3/i)
    await user.click(screen.getByRole('button', { name: /help me do this/i }))
    await screen.findByText(/step 3 of 3/i)

    // Back to actions.
    await user.click(screen.getByRole('button', { name: /back to your actions/i }))
    await screen.findByText(/step 2 of 3/i)

    // Re-open the guide: the "Help me do this" button is still there and works.
    await user.click(screen.getByRole('button', { name: /help me do this/i }))
    await waitFor(() =>
      expect(screen.getByText(/step 3 of 3/i)).toBeInTheDocument(),
    )
  })
})

describe('App — start a new message resets everything', () => {
  it('clears the message and returns to stage 1', async () => {
    const user = userEvent.setup()
    render(<App />)
    await explainSample(user, photosSample.title)
    await screen.findByText(/step 2 of 3/i)

    await user.click(screen.getByRole('button', { name: /start a new message/i }))
    // Back to a fresh message stage: no result, so the guidance step is gone.
    await screen.findByText(/step 1 of 2/i)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('')
    // No "continue" button, because there is no preserved result anymore.
    expect(
      screen.queryByRole('button', { name: /continue to your actions/i }),
    ).toBeNull()
  })
})

describe('App — settings are only on the message stage', () => {
  it('shows the settings toggle on the message stage', () => {
    render(<App />)
    expect(
      screen.getByRole('button', { name: /change settings/i }),
    ).toBeInTheDocument()
  })

  it('hides the settings toggle once a message is being processed (actions stage)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await explainSample(user, photosSample.title)
    await screen.findByText(/step 2 of 3/i)
    // Settings must NOT be reachable while treating a message, so changing the
    // language cannot leave already-generated guidance in an old language.
    expect(
      screen.queryByRole('button', { name: /change settings/i }),
    ).toBeNull()
  })
})

describe('App — language switching translates the whole interface', () => {
  it('switches the UI to French immediately and sets <html lang>', async () => {
    const user = userEvent.setup()
    render(<App />)

    // English to start.
    expect(
      screen.getByRole('button', { name: /explain this message/i }),
    ).toBeInTheDocument()

    // Open settings and choose French.
    await user.click(screen.getByRole('button', { name: /change settings/i }))
    await user.click(screen.getByRole('radio', { name: /français/i }))

    // The primary button is now French, with no page reload.
    expect(
      screen.getByRole('button', { name: /expliquer ce message/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /explain this message/i }),
    ).toBeNull()
    // The document language is updated for assistive tech.
    expect(document.documentElement.lang).toBe('fr-FR')
  })

  it('switches to Simplified Chinese and sets <html lang>', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /change settings/i }))
    await user.click(screen.getByRole('radio', { name: /简体中文/ }))

    expect(document.documentElement.lang).toBe('zh-CN')
    // A known Chinese UI string is now shown (the Explain button).
    expect(
      screen.getByRole('button', { name: /解释这条信息/ }),
    ).toBeInTheDocument()
  })
})

describe('App — conditional guidance stage (outcomes)', () => {
  it('no-action message (Sarah) ends at a completion state, no guidance step', async () => {
    const user = userEvent.setup()
    render(<App />)
    await explainSample(user, familySample.title)
    await screen.findByText(/step 2 of 2/i) // two-step flow, not three

    // Clear, positive completion — no invented task. (The phrase may also appear
    // in the explanation text, so allow more than one match.)
    expect(
      screen.getByText('Nothing you need to do right now.'),
    ).toBeInTheDocument()
    // The explanation content is still shown (tentative visit, will call). The
    // phrase appears in the explanation and the uncertainty note, so allow many.
    expect(screen.getAllByText(/will call/i).length).toBeGreaterThan(0)
    // No guidance affordance and no false "step 3".
    expect(
      screen.queryByRole('button', { name: /help me do this/i }),
    ).toBeNull()
    expect(screen.queryByText(/of 3/i)).toBeNull()
    // Can start over.
    expect(
      screen.getByRole('button', { name: /start a new message/i }),
    ).toBeInTheDocument()
  })

  it('non-digital action is shown without implying a walkthrough exists', async () => {
    const user = userEvent.setup()
    render(<App />)
    await explainSample(user, billSample.title)
    await screen.findByText(/step 2 of 2/i) // no guidable task -> two steps

    // The extracted action appears (match the amount, which is unique to the
    // action text, not the date label).
    expect(screen.getByText(/\$84\.60/)).toBeInTheDocument()
    // ...but there is no "Help me do this" button (not a supported digital task).
    expect(
      screen.queryByRole('button', { name: /help me do this/i }),
    ).toBeNull()
  })

  it('supported digital task keeps the guidance step and walkthrough', async () => {
    const user = userEvent.setup()
    render(<App />)
    await explainSample(user, photosSample.title)
    // Guidable -> three-step flow is shown.
    await screen.findByText(/step 2 of 3/i)
    expect(
      screen.getByRole('button', { name: /help me do this/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /help me do this/i }))
    await waitFor(() =>
      expect(screen.getByText(/step 3 of 3/i)).toBeInTheDocument(),
    )
  })
})
