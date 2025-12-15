import { ProgressBar } from '@/features/ProgressBar';
import { Outlet } from 'react-router-dom';

export function BaseLayout() {
  return (
    <div style={{ position: 'relative' }}>
      <ProgressBar />
      <Outlet />
    </div>
  );
}
