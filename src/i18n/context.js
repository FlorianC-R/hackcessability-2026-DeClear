// The React context object and the useTranslation hook live here (not in the
// provider component file) so that the provider file only exports a component,
// satisfying react-refresh.
import { createContext, useContext } from 'react'

export const LanguageContext = createContext({
  language: 'en',
  locale: 'en-US',
  t: (key) => key,
})

// Hook: const { t, language, locale } = useTranslation()
export function useTranslation() {
  return useContext(LanguageContext)
}
