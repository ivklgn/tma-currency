import { createError } from 'conway-errors';

const createErrorContext = createError(
  [
    { errorType: 'StartupError' },
    { errorType: 'UnexpectedError' },
    { errorType: 'DataHandlingError' },
    { errorType: 'NetworkError' },
    { errorType: 'NetworkResponseError' },
  ],
  {
    handleEmit: (err) => {
      console.error(err);
    },
  }
);

const tmaCurrencyServerContext = createErrorContext('TMA-Currency-Server');

export const tmaCurrencyMiniAppError = tmaCurrencyServerContext.feature('ServerError');
