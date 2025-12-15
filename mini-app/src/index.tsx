import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { createCtx, connectLogger } from '@reatom/framework';
import { reatomContext } from '@reatom/npm-react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';

import '@telegram-apps/telegram-ui/dist/styles.css';

import './index.css';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

const ctx = createCtx();

connectLogger(ctx);

const root = createRoot(document.getElementById('root')!);

try {
  // Configure all application dependencies.
  init(retrieveLaunchParams().tgWebAppStartParam === 'debug' || import.meta.env.DEV);

  root.render(
    <StrictMode>
      <reatomContext.Provider value={ctx}>
        <Root />
      </reatomContext.Provider>
    </StrictMode>
  );
} catch {
  root.render(<EnvUnsupported />);
}
