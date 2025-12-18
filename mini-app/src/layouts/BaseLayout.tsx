import { ProgressBar } from '@/features/ProgressBar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Tabbar } from '@telegram-apps/telegram-ui';
import { Icon28Heart } from '@telegram-apps/telegram-ui/dist/icons/28/heart';
import { Icon28Stats } from '@telegram-apps/telegram-ui/dist/icons/28/stats';

export function BaseLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isMyPage = location.pathname === '/';
  const isAllPage = location.pathname === '/all';

  return (
    <div style={{ position: 'relative', paddingBottom: '80px' }}>
      <ProgressBar />
      <Outlet />
      <Tabbar>
        <Tabbar.Item selected={isMyPage} text="My" onClick={() => navigate('/')}>
          <Icon28Heart />
        </Tabbar.Item>
        <Tabbar.Item selected={isAllPage} text="All" onClick={() => navigate('/all')}>
          <Icon28Stats />
        </Tabbar.Item>
      </Tabbar>
    </div>
  );
}
