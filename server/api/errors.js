import { createError } from 'conway-errors';

const createServerErrorContext = createError(
  [{ errortype: 'RunError' }, { errorType: 'DataHandlingError' }],
  {
    handleEmit: (err) => {
      console.error(err);
    },
  }
);

const createAPIErrorContext = createError([{ errorType: 'ResponseNotOk' }], {
  handleEmit: (err) => {
    console.error(err);
  },
});

export const serverError = createServerErrorContext('ServerError');
export const apiError = createAPIErrorContext('APIError');
