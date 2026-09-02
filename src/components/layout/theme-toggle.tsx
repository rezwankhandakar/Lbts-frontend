import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/stores/use-theme-store'
import { HEADER_ICON_BUTTON } from '@/components/layout/header-styles'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className={cn(HEADER_ICON_BUTTON, 'relative')}
    >
      {/* Both icons stay mounted and cross-fade, so the button never reflows. */}
      <Sun
        className="size-4 scale-100 rotate-0 text-brand-amber transition-all duration-200 dark:scale-0 dark:-rotate-90"
        aria-hidden
      />
      <Moon
        className="absolute size-4 scale-0 rotate-90 transition-all duration-200 dark:scale-100 dark:rotate-0"
        aria-hidden
      />
    </Button>
  )
}
