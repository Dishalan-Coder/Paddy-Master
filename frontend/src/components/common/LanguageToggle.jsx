import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Globe } from 'lucide-react';

export default function LanguageToggle({ className = '', compact = false }) {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || 'en').split(
    '-',
  )[0];
  const nextLanguage = language === 'ta' ? 'en' : 'ta';

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(nextLanguage)}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100',
        className,
      )}
      aria-label={t('language.switch_to', {
        language: t(`language.${nextLanguage}`),
      })}
      title={t('language.switch_to', {
        language: t(`language.${nextLanguage}`),
      })}
    >
      <Globe className="h-4 w-4" />
      {compact ? t(`language.short_${nextLanguage}`) : t(`language.${nextLanguage}`)}
    </button>
  );
}
