import type { ComponentType, JSX } from 'react';

import { ExchangePage } from '@/pages/exchange';
import { CurrencyPage } from '@/pages/currency';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: ExchangePage },
  { path: '/exchange-rate', Component: CurrencyPage },
];
