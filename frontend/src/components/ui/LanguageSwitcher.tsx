import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from './Button';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fa', name: 'دری', flag: '🇦🇫' },
  { code: 'ps', name: 'پښتو', flag: '🇦🇫' }
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    localStorage.setItem('lang', lng);
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = lng;
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-slate-400" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={i18n.language === lang.code ? 'default' : 'ghost'}
            size="sm"
            onClick={() => changeLanguage(lang.code)}
            className="px-2 py-1 text-xs"
          >
            {lang.flag} {lang.name}
          </Button>
        ))}
      </div>
    </div>
  );
}