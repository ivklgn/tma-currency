import { tmaCurrencyMiniAppError } from '../errors';

export const getLocalStorageValue = <T>(keyName: string, defaultValue: T) => {
  try {
    const value = localStorage.getItem(keyName);

    if (value === null) {
      return defaultValue;
    }

    return JSON.parse(value);
  } catch (err) {
    tmaCurrencyMiniAppError('StorageError', 'Failed to read from localStorage', {
      originalError: err,
    }).emit({ extendedParams: { keyName } });
    return defaultValue;
  }
};

export const setLocalStorageValue = (keyName: string, value: unknown) => {
  try {
    localStorage.setItem(keyName, JSON.stringify(value));
  } catch (err) {
    tmaCurrencyMiniAppError('StorageError', 'Failed to write to localStorage', {
      originalError: err,
    }).emit({ extendedParams: { keyName } });
  }
};
