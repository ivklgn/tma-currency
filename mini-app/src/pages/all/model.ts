import { action, atom, computed, sleep, withAsyncData, withConnectHook, wrap } from '@reatom/core';
import { fetcher } from '../../api';
import { isProgressVisibleAtom } from '@/features/ProgressBar/model';
import { currencies } from '../exchange/currencies';
import { formatDate } from '../../helpers/date';

const BASE_CURRENCY = 'USD';

interface IAllCurrency {
  currency: string;
  rate: number;
}

export const selectedDateAtom = atom(formatDate(new Date()), 'selectedDateAtom');

export const allCurrenciesAtom = atom<IAllCurrency[]>([], 'allCurrenciesAtom').extend(
  withConnectHook(() => {
    fetchAllExchangeRates();
  })
);

export const onChangeDateAction = action((event: React.ChangeEvent<HTMLInputElement>) => {
  selectedDateAtom.set(event.currentTarget.value);
  fetchAllExchangeRates();
}, 'onChangeDateAction');

export const fetchAllExchangeRates = action(async () => {
  isProgressVisibleAtom.set(true);

  try {
    const selectedDate = selectedDateAtom();

    await wrap(sleep(400));

    const { rates } = await wrap(
      fetcher<'/historical'>('/historical', {
        date: selectedDate,
        source: BASE_CURRENCY,
      })
    );

    const result = Object.entries(rates)
      .filter(([currency]) => currency in currencies && currency !== BASE_CURRENCY)
      .map(([currency, rate]) => ({
        currency,
        rate: rate > 0 ? rate : 1,
      }));

    allCurrenciesAtom.set(result);
    return result;
  } finally {
    isProgressVisibleAtom.set(false);
  }
}, 'fetchAllExchangeRates').extend(withAsyncData({ initState: [] as IAllCurrency[] }));

export const allExchangeRatesErrorAtom = computed(
  () => fetchAllExchangeRates.error(),
  'allExchangeRatesErrorAtom'
);
