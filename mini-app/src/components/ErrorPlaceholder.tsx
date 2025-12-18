import { Placeholder } from '@telegram-apps/telegram-ui';

export const ErrorPlaceholder = () => (
  <Placeholder header="Oops, something went wrong" description="Reload app or try later">
    <img
      alt="Telegram sticker"
      src="https://xelene.me/telegram.gif"
      style={{ display: 'block', width: '144px', height: '144px' }}
    />
  </Placeholder>
);
