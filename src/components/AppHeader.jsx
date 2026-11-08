import { useTranslation } from '../i18n/context.js'

// Branded header for DeClear. Simple and quiet by design: the product name
// and a one-line plain-language description of what the app does.
function AppHeader() {
  const { t } = useTranslation()
  return (
    <header className="dc-header">
      <p className="dc-brand">{t('app.brand')}</p>
      <h1 className="dc-tagline">{t('app.tagline')}</h1>
    </header>
  )
}

export default AppHeader
