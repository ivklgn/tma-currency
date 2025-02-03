import {
  action,
  atom,
  reatomResource,
  sleep,
  withCache,
  withDataAtom,
  withErrorAtom,
} from '@reatom/framework';
import { withLocalStorage } from '@reatom/persist-web-storage';
import { fetcher } from '../../api';
import { searchParamsAtom } from '@reatom/url';
import { formatDate } from '../../helpers/date';
import { withProgress } from '@/helpers/progress.ts';

type HistoricalFilter = '3d' | '1w' | '1m' | '1y';

export const historicalFilterAtom = atom<HistoricalFilter>('3d', 'historicalFilterAtom');
export const primaryCurrencyAtom = atom('USD', 'primaryCurrencyAtom').pipe(
  withLocalStorage('primaryCurrency')
);
export const currentCurrencyAtom = searchParamsAtom.lens('currency', { path: '/exchange-rate' });

export const onChangeHistoricalFilterAction = action(
  (ctx, filter: HistoricalFilter) => historicalFilterAtom(ctx, filter),
  'onChangeHistoricalFilterAction'
);

function convertFilterToEndDate(historicalFilter: HistoricalFilter) {
  const date = new Date();

  if (historicalFilter === '1w') {
    date.setDate(date.getDate() - 7);
    return date;
  }

  if (historicalFilter === '1m') {
    date.setDate(date.getMonth() - 1);
    return date;
  }

  if (historicalFilter === '1y') {
    date.setDate(date.getDate() - 354);
    return date;
  }

  date.setDate(date.getDate() - 3);
  return date;
}

export const historicalRatesAtom = reatomResource(async (ctx) => {
  const primaryCurrency = ctx.spy(primaryCurrencyAtom);
  const currentCurrency = ctx.spy(currentCurrencyAtom);
  const historicalFilter = ctx.spy(historicalFilterAtom);

  await ctx.schedule(() => sleep(400));

  const startDate = convertFilterToEndDate(historicalFilter);

  const { signal } = ctx.controller;
  const { quotes } = await fetcher(
    '/timeframe',
    {
      currencies: [currentCurrency],
      start_date: formatDate(startDate),
      end_date: formatDate(new Date()),
      source: primaryCurrency,
    },
    { signal }
  );

  return Object.entries(quotes).map(([date, rate]) => {
    return { date, rate: rate[`${primaryCurrency}${currentCurrency}`] };
  });
}, 'historicalRatesAtom').pipe(
  withDataAtom([]),
  withCache({ length: 10, swr: false }),
  withErrorAtom(),
  withProgress()
);
