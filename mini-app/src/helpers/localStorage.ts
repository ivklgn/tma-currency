export const getLocalStorageValue = <T>(keyName: string, defaultValue: T) => {
  try {
    const value = localStorage.getItem(keyName);

    if (value === null) {
      return defaultValue;
    }

    return JSON.parse(value);
  } catch (err) {
    console.error('localStorage read error', err);
    return defaultValue;
  }
};

export const setLocalStorageValue = (keyName: string, value: unknown) => {
  try {
    localStorage.setItem(keyName, JSON.stringify(value));
  } catch (err) {
    console.error('localStorage write error', err);
  }
};
