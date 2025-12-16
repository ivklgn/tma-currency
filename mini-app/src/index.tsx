import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { clearStack, context, connectLogger } from '@reatom/core';
import { reatomContext } from '@reatom/react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';

import '@telegram-apps/telegram-ui/dist/styles.css';

import './index.css';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

// Disable default context for predictability
clearStack();

const rootFrame = context.start();

if (import.meta.env.DEV) {
  rootFrame.run(connectLogger);
}

const root = createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    console.error('Caught error:', error, errorInfo.componentStack);
  },
  onUncaughtError: (error, errorInfo) => {
    console.error('Uncaught error:', error, errorInfo.componentStack);
  },
  onRecoverableError: (error, errorInfo) => {
    console.error('Recoverable error:', error, errorInfo.componentStack);
  },
});

try {
  // Configure all application dependencies.
  init(retrieveLaunchParams().tgWebAppStartParam === 'debug' || import.meta.env.DEV);

  root.render(
    <StrictMode>
      <reatomContext.Provider value={rootFrame}>
        <Root />
      </reatomContext.Provider>
    </StrictMode>
  );
} catch {
  root.render(<EnvUnsupported />);
}
