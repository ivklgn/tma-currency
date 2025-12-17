import { atom, computed, sleep, withAsyncData, withLocalStorage, wrap } from '@reatom/core';
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

export const fetchHistoricalRates = computed(async () => {
  const primaryCurrency = primaryCurrencyAtom();
  const currentCurrency = currentCurrencyAtom();

  if (!currentCurrency || !primaryCurrency) {
    return [];
  }

  isProgressVisibleAtom.set(true);

  try {
    await wrap(sleep(400));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 3);

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

    const preparedResult = prepareRates(result);
    historicalRatesCacheAtom.set(preparedResult);

    return preparedResult;
  } finally {
    isProgressVisibleAtom.set(false);
  }
}, 'fetchHistoricalRates').extend(withAsyncData({ initState: [] as IHistoricalRate[] }));
