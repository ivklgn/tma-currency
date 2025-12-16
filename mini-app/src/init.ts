import {
  backButton,
  viewport,
  themeParams,
  miniApp,
  initData,
  setDebug,
  init as initSDK,
} from '@telegram-apps/sdk-react';
import { setBackgroundAsSecondary } from './helpers/set-background';
import { tmaCurrencyMiniAppError } from './errors';

export function init(debug: boolean): void {
  setDebug(debug);
  initSDK();

  if (!backButton.isSupported() || !miniApp.isSupported()) {
    throw tmaCurrencyMiniAppError(
      'TelegramError',
      'Required Telegram components are not supported'
    );
  }

  backButton.mount();
  miniApp.mountSync();
  themeParams.mountSync();
  initData.restore();
  void viewport
    .mount()
    .catch((e) => {
      tmaCurrencyMiniAppError('TelegramError', 'Failed to mount viewport', {
        originalError: e,
      }).emit();
    })
    .then(() => {
      viewport.bindCssVars();
    });

  miniApp.bindCssVars();
  themeParams.bindCssVars();

  setBackgroundAsSecondary();
}
