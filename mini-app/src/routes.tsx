import type { ComponentType, JSX } from 'react';

import { ExchangePage } from '@/pages/exchange';
import { AllPage } from '@/pages/all';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: ExchangePage },
  { path: '/all', Component: AllPage },
];
