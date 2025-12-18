import { action, atom, computed, sleep, withAsyncData, withConnectHook, wrap } from '@reatom/core';
import { fetcher } from '../../api';
import { isProgressVisibleAtom } from '@/features/ProgressBar/model';
import { currencies } from '../exchange/currencies';
import { formatDate } from '../../helpers/date';
import { primaryCurrencyAtom, amountAtom } from '../exchange/model';
import { ICurrencyRate } from '@/types/currency';
import { transformRates } from '@/helpers/rates';

export { primaryCurrencyAtom, amountAtom };

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
};

export const yesterdayDate = formatDate(getYesterday());

export const selectedDateAtom = atom(yesterdayDate, 'selectedDateAtom');

export const allCurrenciesAtom = atom<ICurrencyRate[]>([], 'allCurrenciesAtom').extend(
  withConnectHook(() => {
    fetchAllExchangeRates();
  })
);

export const onChangeDateAction = action((event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.currentTarget.value;

  if (value > yesterdayDate) {
    selectedDateAtom.set(yesterdayDate);
  } else {
    selectedDateAtom.set(value);
  }

  fetchAllExchangeRates();
}, 'onChangeDateAction');

export const fetchAllExchangeRates = action(async () => {
  isProgressVisibleAtom.set(true);

  try {
    const selectedDate = selectedDateAtom();
    const primaryCurrency = primaryCurrencyAtom();

    await wrap(sleep(400));

    const { rates } = await wrap(
      fetcher<'/historical'>('/historical', {
        date: selectedDate,
        source: primaryCurrency,
      })
    );

    const result = transformRates(
      rates,
      (currency) => currency in currencies && currency !== primaryCurrency
    );

    allCurrenciesAtom.set(result);
    return result;
  } finally {
    isProgressVisibleAtom.set(false);
  }
}, 'fetchAllExchangeRates').extend(withAsyncData({ initState: [] as ICurrencyRate[] }));

export const allExchangeRatesErrorAtom = computed(
  () => fetchAllExchangeRates.error(),
  'allExchangeRatesErrorAtom'
);
