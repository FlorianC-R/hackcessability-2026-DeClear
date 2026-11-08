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

describe('App — three-stage navigation', () => {
  it('starts on the Message stage (step 1 of 3)', () => {
    render(<App />)
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument()
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
    await screen.findByText(/step 1 of 3/i)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('')
    // No "continue" button, because there is no preserved result anymore.
    expect(
      screen.queryByRole('button', { name: /continue to your actions/i }),
    ).toBeNull()
  })
})

describe('App — settings remain accessible across stages', () => {
  it('shows the settings toggle on the actions stage', async () => {
    const user = userEvent.setup()
    render(<App />)
    await explainSample(user, photosSample.title)
    await screen.findByText(/step 2 of 3/i)
    // SettingsPanel renders its toggle on every stage.
    expect(
      screen.getByRole('button', { name: /change settings/i }),
    ).toBeInTheDocument()
  })
})
