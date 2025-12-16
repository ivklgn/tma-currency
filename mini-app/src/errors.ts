import { createError } from 'conway-errors';

const createErrorCtx = createError(
  [
    { errorType: 'FrontendLogicError' },
    { errorType: 'BackendInteractionError' },
    { errorType: 'TelegramError' },
    { errorType: 'StorageError' },
  ] as const,
  {
    handleEmit: (err) => {
      console.error(err);
    },
  }
);

const tmaCurrencyMiniAppContext = createErrorCtx('TMA-Currency-Mini-App');

export const tmaCurrencyMiniAppError = tmaCurrencyMiniAppContext.feature('TMA-Currency-Mini-App');
