import {
  action,
  atom,
  computed,
  sleep,
  withAsyncData,
  withLocalStorage,
  withConnectHook,
  wrap,
} from '@reatom/core';
import { fetcher } from '../../api';
import { isProgressVisibleAtom } from '@/features/ProgressBar/model';

interface ITargetCurrency {
  currency: string;
  rate: number;
}

export const amountInputAtom = atom('1', 'amountInputAtom').extend(withLocalStorage('amount'));

export const amountAtom = computed(() => {
  const input = amountInputAtom();
  const parsed = parseInt(input);
  return isNaN(parsed) || parsed < 1 ? 1 : parsed;
}, 'amountAtom');

export const primaryCurrencyAtom = atom('USD', 'primaryCurrencyAtom').extend(
  withLocalStorage('primaryCurrency')
);

export const targetCurrencyIdsAtom = atom<string[]>([], 'targetCurrencyIdsAtom');

export const targetCurrenciesAtom = atom<ITargetCurrency[]>([], 'targetCurrenciesAtom').extend(
  withLocalStorage('targetCurrencies'),
  withConnectHook(() => {
    const targetCurrencies = targetCurrenciesAtom();

    if (!targetCurrencies.length) {
      return;
    }

    targetCurrencyIdsAtom.set(targetCurrencies.map((q) => q.currency));
    getNewExchangeRates();
  })
);

export const onChangeAmountAction = action((event: React.ChangeEvent<HTMLInputElement>) => {
  amountInputAtom.set(event.currentTarget.value);
}, 'onChangeAmountAction');

export const onResetAmountAction = action(() => {
  amountInputAtom.set('1');
}, 'onResetAmountAction');

export const onChangePrimaryCurrencyAction = action((currency: string) => {
  primaryCurrencyAtom.set(currency);
}, 'onChangePrimaryCurrencyAction');

export const getNewExchangeRates = action(() => {
  const primaryCurrency = primaryCurrencyAtom();
  const targetCurrencyIds = targetCurrencyIdsAtom();

  if (
    targetCurrencyIds.length === 0 ||
    (targetCurrencyIds.length === 1 && targetCurrencyIds[0] === primaryCurrency)
  ) {
    return;
  }

  fetchExchangeRates(primaryCurrency, targetCurrencyIds);
}, 'getNewExchangeRates');

export const onChangeTargetCurrencyAction = action((currency: string) => {
  const targetCurrencyIds = targetCurrencyIdsAtom();

  if (!targetCurrencyIds.includes(currency)) {
    targetCurrencyIdsAtom.set([...targetCurrencyIds, currency]);
    getNewExchangeRates();
  }
}, 'onChangeTargetCurrencyAction');

export const onDeleteTargetCurrencyAction = action((currency: string) => {
  const targetCurrencyIds = targetCurrencyIdsAtom();
  const targetCurrencies = targetCurrenciesAtom();

  if (targetCurrencyIds.includes(currency)) {
    targetCurrencyIdsAtom.set(targetCurrencyIds.filter((c) => c !== currency));
    targetCurrenciesAtom.set(targetCurrencies.filter((c) => c.currency !== currency));
  }
}, 'onDeleteTargetCurrencyAction');

export const fetchExchangeRates = action(
  async (primaryCurrency: string, targetCurrencies: string[]) => {
    isProgressVisibleAtom.set(true);

    try {
      await wrap(sleep(400));

      const { rates } = await wrap(
        fetcher<'/live'>('/live', { source: primaryCurrency, currencies: targetCurrencies })
      );

      const result = Object.entries(rates).map(([currency, rate]) => ({
        currency,
        rate: rate > 0 ? rate : 1,
      }));

      targetCurrenciesAtom.set(result);
      return result;
    } finally {
      isProgressVisibleAtom.set(false);
    }
  },
  'fetchExchangeRates'
).extend(withAsyncData({ initState: [] as ITargetCurrency[] }));

export const exchangeRatesErrorAtom = computed(
  () => fetchExchangeRates.error(),
  'exchangeRatesErrorAtom'
);
