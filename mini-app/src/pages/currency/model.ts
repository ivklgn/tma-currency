import { action, atom, computed, sleep, withAsyncData, withLocalStorage, wrap } from '@reatom/core';
import { fetcher } from '../../api';
import { formatDate } from '../../helpers/date';
import { prepareRates } from '@/pages/currency/utils.ts';
import { isProgressVisibleAtom } from '@/features/ProgressBar/model';

type HistoricalFilter = '3d' | '1w' | '1m' | '1y';

export interface IHistoricalRate {
  date: string;
  rate: number;
}

export const historicalFilterAtom = atom<HistoricalFilter>('3d', 'historicalFilterAtom');

export const primaryCurrencyAtom = atom('USD', 'primaryCurrencyAtom').extend(
  withLocalStorage('primaryCurrency')
);

export const currentCurrencyAtom = atom('', 'currentCurrencyAtom');

export const historicalRatesCacheAtom = atom<IHistoricalRate[]>(
  [],
  'historicalRatesCacheAtom'
).extend(withLocalStorage('historicalRatesCache'));

export const onChangeHistoricalFilterAction = action(
  (filter: HistoricalFilter) => historicalFilterAtom.set(filter),
  'onChangeHistoricalFilterAction'
);

export const setCurrentCurrencyFromUrl = action((searchParams: URLSearchParams) => {
  const currency = searchParams.get('currency') || '';
  currentCurrencyAtom.set(currency);
}, 'setCurrentCurrencyFromUrl');

function convertFilterToEndDate(historicalFilter: HistoricalFilter) {
  const date = new Date();

  if (historicalFilter === '1w') {
    date.setDate(date.getDate() - 7);
    return date;
  }

  if (historicalFilter === '1m') {
    date.setMonth(date.getMonth() - 1);
    return date;
  }

  if (historicalFilter === '1y') {
    date.setDate(date.getDate() - 354);
    return date;
  }

  date.setDate(date.getDate() - 3);
  return date;
}

export const fetchHistoricalRates = action(async () => {
  const primaryCurrency = primaryCurrencyAtom();
  const currentCurrency = currentCurrencyAtom();
  const historicalFilter = historicalFilterAtom();

  if (!currentCurrency || !primaryCurrency) {
    return [];
  }

  isProgressVisibleAtom.set(true);

  try {
    await wrap(sleep(400));

    const startDate = convertFilterToEndDate(historicalFilter);

    const { rates } = await wrap(
      fetcher('/timeframe', {
        currencies: [currentCurrency],
        start_date: formatDate(startDate),
        end_date: formatDate(new Date()),
        source: primaryCurrency,
      })
    );

    const result = Object.entries(rates).map(([date, rate]) => {
      return { date, rate: rate[currentCurrency] };
    });

    if (historicalFilter === '3d') {
      historicalRatesCacheAtom.set(prepareRates(result));
    }

    return result;
  } finally {
    isProgressVisibleAtom.set(false);
  }
}, 'fetchHistoricalRates').extend(withAsyncData({ initState: [] as IHistoricalRate[] }));

export const historicalRatesAtom = computed(
  () => fetchHistoricalRates.data(),
  'historicalRatesAtom'
);

export const isLoadingHistoricalRatesAtom = computed(
  () => fetchHistoricalRates.pending() > 0,
  'isLoadingHistoricalRatesAtom'
);

export const historicalRatesErrorAtom = computed(
  () => fetchHistoricalRates.error(),
  'historicalRatesErrorAtom'
);
