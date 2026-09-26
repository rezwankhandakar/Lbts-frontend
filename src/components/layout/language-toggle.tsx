import { LOCALE_ORDER, LOCALES, useTranslation } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * The language switch, in the header beside the theme toggle.
 *
 * **A segmented control rather than a single-icon toggle**, and the reason is
 * the one ambiguity a two-state language button always has: a button reading
 * "বাংলা" says nothing about whether that is the language you are in or the
 * language you would get. Somebody who reads neither label confidently is left
 * pressing it to find out, which on a shared gate PC means the screen changing
 * language under whoever walks up next.
 *
 * Both options are therefore drawn at once, with the active one filled. There
 * is nothing to infer: the state and the affordance are the same object, the
 * way a two-item segmented control has always worked.
 *
 * Each label is written in **its own script** — `EN` and `বাং` — and never
 * translated. A switch that said "ইংরেজি" while you were in Bangla would be
 * asking somebody who cannot read Bangla to find the way out in Bangla, which
 * is exactly the person the control is for.
 */
export function LanguageToggle() {
  const { t, locale, setLocale } = useTranslation()

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={cn(
        'relative hidden h-8 items-center gap-0.5 rounded-lg border border-border/70 bg-muted/40 p-0.5',
        // Below sm the header is already tight; the control keeps its place in
        // the mobile drawer's footer instead. See `sidebar-account.tsx`.
        'sm:inline-flex',
      )}
    >
      {LOCALE_ORDER.map((code) => (
        <LanguageOption
          key={code}
          code={code}
          active={code === locale}
          label={t('language.switchTo', { language: LOCALES[code].nativeLabel })}
          onSelect={setLocale}
        />
      ))}
    </div>
  )
}

interface LanguageOptionProps {
  code: Locale
  active: boolean
  label: string
  onSelect: (locale: Locale) => void
}

function LanguageOption({ code, active, label, onSelect }: LanguageOptionProps) {
  const meta = LOCALES[code]

  return (
    <button
      type="button"
      /**
       * `aria-pressed` rather than `aria-current`: this is a pair of toggle
       * buttons, not navigation. A screen reader then announces "বাং, pressed"
       * on the active one, which is the state a sighted reader gets from the
       * fill.
       */
      aria-pressed={active}
      aria-label={label}
      title={label}
      /**
       * `lang` on the button itself, so the label is announced in its own
       * language whatever the page is set to — the same reason `<html lang>`
       * is written at all. Without it a screen reader reads বাং with an
       * English voice, which is unintelligible.
       */
      lang={meta.code}
      onClick={() => onSelect(code)}
      className={cn(
        'relative inline-flex h-7 min-w-8 items-center justify-center rounded-[7px] px-2',
        'text-[11px] leading-none font-semibold transition-colors duration-150 outline-none',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1',
        'focus-visible:ring-offset-background',
        active
          ? 'bg-background text-primary shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {meta.short}
    </button>
  )
}

/**
 * The same control, stacked for the sidebar footer.
 *
 * It exists because the header hides the switch below `sm` — the bar there is
 * already carrying a menu button, a bell, a theme toggle and an avatar — and a
 * language switch a phone cannot reach is a language switch that does not
 * exist for the half of this office that works from one.
 */
export function LanguageToggleRow() {
  const { t, locale, setLocale } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">{t('language.label')}</span>

      <div
        role="group"
        aria-label={t('language.label')}
        className="inline-flex h-8 items-center gap-0.5 rounded-lg border border-border/70 bg-muted/40 p-0.5"
      >
        {LOCALE_ORDER.map((code) => (
          <LanguageOption
            key={code}
            code={code}
            active={code === locale}
            label={t('language.switchTo', { language: LOCALES[code].nativeLabel })}
            onSelect={setLocale}
          />
        ))}
      </div>
    </div>
  )
}
