import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// EN
import enCommon from './locales/en/common'
import enNav from './locales/en/nav'
import enHome from './locales/en/home'
import enAuth from './locales/en/auth'
import enRequests from './locales/en/requests'
import enOrders from './locales/en/orders'
import enDashboard from './locales/en/dashboard'
import enSuppliers from './locales/en/suppliers'
import enAdmin from './locales/en/admin'
import enPages from './locales/en/pages'

// FR
import frCommon from './locales/fr/common'
import frNav from './locales/fr/nav'
import frHome from './locales/fr/home'
import frAuth from './locales/fr/auth'
import frRequests from './locales/fr/requests'
import frOrders from './locales/fr/orders'
import frDashboard from './locales/fr/dashboard'
import frSuppliers from './locales/fr/suppliers'
import frAdmin from './locales/fr/admin'
import frPages from './locales/fr/pages'

const STORAGE_KEY = 'aa-language'
const savedLang = localStorage.getItem(STORAGE_KEY) ?? 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        nav: enNav,
        home: enHome,
        auth: enAuth,
        requests: enRequests,
        orders: enOrders,
        dashboard: enDashboard,
        suppliers: enSuppliers,
        admin: enAdmin,
        pages: enPages,
      },
      fr: {
        common: frCommon,
        nav: frNav,
        home: frHome,
        auth: frAuth,
        requests: frRequests,
        orders: frOrders,
        dashboard: frDashboard,
        suppliers: frSuppliers,
        admin: frAdmin,
        pages: frPages,
      },
    },
    lng: savedLang,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
