import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PartsSearchPage from '@/pages/parts/PartsSearchPage'

export default function ShopPage() {
  const { t } = useTranslation('search')
  return (
    <div className="flex flex-grow flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h1 className="text-xl font-bold">{t('catalogShop')}</h1>
        <Link to="/shop" className="text-sm font-semibold text-emerald-700 underline dark:text-emerald-300">{t('browseAll')}</Link>
      </header>
      <PartsSearchPage browseAll />
    </div>
  )
}
