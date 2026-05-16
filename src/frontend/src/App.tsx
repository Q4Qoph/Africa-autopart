import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { router } from '@/router'
import { ExternalCartProvider } from './context/ExternalCartContext';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
            <ExternalCartProvider>
            <RouterProvider router={router} />
            </ExternalCartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}