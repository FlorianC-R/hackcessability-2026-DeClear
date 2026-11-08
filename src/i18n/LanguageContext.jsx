// Provider component that supplies the active language and `t()` helper, and
// keeps <html lang> in sync. The context object and useTranslation hook live
// in ./context.js so this file only exports a component (react-refresh rule).
import { useEffect, useMemo } from 'react'
import { translate, LOCALE_TAGS } from './index.js'
import { LanguageContext } from './context.js'

export function LanguageProvider({ language, children }) {
  useEffect(() => {
    const tag = LOCALE_TAGS[language] ?? 'en-US'
    if (typeof document !== 'undefined') {
      document.documentElement.lang = tag
    }
  }, [language])

  const value = useMemo(
    () => ({
      language,
      locale: LOCALE_TAGS[language] ?? 'en-US',
      t: (key, vars) => translate(language, key, vars),
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export default LanguageProvider
