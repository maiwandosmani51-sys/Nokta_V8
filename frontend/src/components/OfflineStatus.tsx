import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function OfflineStatus() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[100] border-b border-amber-400/30 bg-amber-950/95 px-4 py-2 text-amber-100 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center text-sm font-medium">
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{t('common.offline_mode')}</span>
      </div>
    </div>
  );
}
