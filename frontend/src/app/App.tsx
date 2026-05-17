import AppRoutes from '@/routes/AppRoutes';
import { OfflineStatus } from '@/components/OfflineStatus';

export default function App() {
  return (
    <>
      <OfflineStatus />
      <AppRoutes />
    </>
  );
}
