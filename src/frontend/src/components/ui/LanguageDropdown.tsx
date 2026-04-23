//src/frontend/src/components/ui/LanguageDropdown.tsx
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage, type Language } from '@/context/LanguageContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const LANGUAGES: { code: Language; native: string; flag: string }[] = [
  { code: 'en', native: 'English', flag: '🇬🇧' },
  { code: 'fr', native: 'Français', flag: '🇫🇷' },
  { code: 'am', native: 'አማርኛ', flag: '🇪🇹' }
  // { code: 'ar', native: 'العربية', flag: '🇸🇦' }, // uncomment when Arabic is added
]

interface Props {
  /** 'topbar' = dark bg context; 'drawer' = light/dark card context */
  variant?: 'topbar' | 'drawer'  
}

export function LanguageDropdown({ variant = 'topbar' }: Props) {
  const { language, setLanguage } = useLanguage()
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]

  const triggerCls =
    variant === 'topbar'
      ? 'flex items-center gap-1 text-[#4A6B50] dark:text-[rgba(255,255,255,0.45)] hover:text-[#07110A] dark:hover:text-[rgba(255,255,255,0.8)] text-[11px] transition-colors cursor-pointer'
      : 'flex items-center gap-1.5 text-[rgba(0,0,0,0.5)] dark:text-[rgba(255,255,255,0.5)] text-xs hover:text-[#07110A] dark:hover:text-white transition-colors cursor-pointer'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerCls} aria-label="Select language">
  <Globe className={variant === 'topbar' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
  <span>{current.flag} {current.native}</span>
</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-40 bg-[#111C14] border-[rgba(0,200,83,0.2)] text-white shadow-lg"
      >
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              'cursor-pointer gap-2 focus:bg-[rgba(0,200,83,0.1)] focus:text-white',
              language === lang.code && 'text-[#00C853]',
            )}
          >
            <span>{lang.flag}</span>
            <span>{lang.native}</span>
            {language === lang.code && (
              <span className="ml-auto text-[10px] text-[#00C853]">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
