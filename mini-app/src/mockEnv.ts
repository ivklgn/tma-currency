import { mockTelegramEnv, isTMA, retrieveLaunchParams } from '@telegram-apps/sdk-react';

// It is important, to mock the environment only for development purposes.
// When building the application the import.meta.env.DEV will value become
// `false` and the code inside will be tree-shaken (removed), so you will not
// see it in your final bundle.
if (import.meta.env.DEV) {
  await (async () => {
    if (await isTMA()) {
      return;
    }

    // Determine which launch params should be applied. We could already
    // apply them previously, or they may be specified on purpose using the
    // default launch parameters transmission method.
    try {
      retrieveLaunchParams();
    } catch {
      // In v3, mockTelegramEnv expects launchParams as a query string or object with tgWebApp* keys
      const initDataRaw = new URLSearchParams([
        [
          'user',
          JSON.stringify({
            id: 99281932,
            first_name: 'Andrew',
            last_name: 'Rogue',
            username: 'rogue',
            language_code: 'en',
            is_premium: true,
            allows_write_to_pm: true,
          }),
        ],
        ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
        [
          'signature',
          'zL-ucjNyREiHDE8aihFwpfR9aggP2xiAo3NSpfe-p7IbCisNlDKlo7Kb6iDpNit0Lp49TLRJB0TIbRBLkUiyAQ',
        ],
        ['auth_date', '1716922846'],
        ['start_param', 'debug'],
        ['chat_type', 'sender'],
        ['chat_instance', '8428209589180549439'],
      ]).toString();

      const themeParams = JSON.stringify({
        accent_text_color: '#6ab2f2',
        bg_color: '#17212b',
        button_color: '#5288c1',
        button_text_color: '#ffffff',
        destructive_text_color: '#ec3942',
        header_bg_color: '#17212b',
        hint_color: '#708499',
        link_color: '#6ab3f3',
        secondary_bg_color: '#232e3c',
        section_bg_color: '#17212b',
        section_header_text_color: '#6ab3f3',
        subtitle_text_color: '#708499',
        text_color: '#f5f5f5',
      });

      const launchParams = new URLSearchParams([
        ['tgWebAppData', initDataRaw],
        ['tgWebAppVersion', '8'],
        ['tgWebAppPlatform', 'tdesktop'],
        ['tgWebAppThemeParams', themeParams],
      ]).toString();

      mockTelegramEnv({ launchParams });
      console.warn(
        '⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram.'
      );
    }
  })();
}
