// Vitest setup: adds jest-dom matchers (toBeInTheDocument, etc.) and clears the
// DOM/localStorage between tests so each test starts clean.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  try {
    window.localStorage.clear()
  } catch {
    // ignore — some environments disallow storage access
  }
})
