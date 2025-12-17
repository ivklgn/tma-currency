import { action, atom, computed, sleep, withAsyncData, withLocalStorage, wrap } from '@reatom/core';
import { fetcher } from '../../api';
import { formatDate } from '../../helpers/date';
import { prepareRates } from '@/pages/currency/utils.ts';
import { isProgressVisibleAtom } from '@/features/ProgressBar/model';

export interface IHistoricalRate {
  date: string;
  rate: number;
}

export const primaryCurrencyAtom = atom('USD', 'primaryCurrencyAtom').extend(
  withLocalStorage('primaryCurrency')
);

export const currentCurrencyAtom = atom('', 'currentCurrencyAtom');

export const historicalRatesCacheAtom = atom<IHistoricalRate[]>(
  [],
  'historicalRatesCacheAtom'
).extend(withLocalStorage('historicalRatesCache'));

export const setCurrentCurrencyFromUrl = action((searchParams: URLSearchParams) => {
  const currency = searchParams.get('currency') || '';
  currentCurrencyAtom.set(currency);
}, 'setCurrentCurrencyFromUrl');

function getStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 3);
  return date;
}

export const fetchHistoricalRates = action(async () => {
  const primaryCurrency = primaryCurrencyAtom();
  const currentCurrency = currentCurrencyAtom();

  if (!currentCurrency || !primaryCurrency) {
    return [];
  }

  isProgressVisibleAtom.set(true);

  try {
    await wrap(sleep(400));

    const startDate = getStartDate();

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

    historicalRatesCacheAtom.set(prepareRates(result));

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
