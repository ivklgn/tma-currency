import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { clearStack, context, connectLogger } from '@reatom/core';
import { reatomContext } from '@reatom/react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';
import { tmaCurrencyMiniAppError } from '@/errors.ts';

import '@telegram-apps/telegram-ui/dist/styles.css';

import './index.css';

import './mockEnv.ts';

clearStack();

const rootFrame = context.start();

if (import.meta.env.DEV) {
  rootFrame.run(connectLogger);
}

const root = createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    tmaCurrencyMiniAppError('FrontendLogicError', 'React caught error', {
      originalError: error,
    }).emit({ extendedParams: { componentStack: errorInfo.componentStack } });
  },
  onUncaughtError: (error, errorInfo) => {
    tmaCurrencyMiniAppError('FrontendLogicError', 'React uncaught error', {
      originalError: error,
    }).emit({ extendedParams: { componentStack: errorInfo.componentStack } });
  },
  onRecoverableError: (error, errorInfo) => {
    tmaCurrencyMiniAppError('FrontendLogicError', 'React recoverable error', {
      originalError: error,
    }).emit({ extendedParams: { componentStack: errorInfo.componentStack } });
  },
});

try {
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
