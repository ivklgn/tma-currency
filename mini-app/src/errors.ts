import { createError } from 'conway-errors';

const createErrorContext = createError(
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

const tmaCurrencyMiniAppContext = createErrorContext('TMA-Currency-Mini-App');

export const tmaCurrencyMiniAppError = tmaCurrencyMiniAppContext.feature('ClientError');
