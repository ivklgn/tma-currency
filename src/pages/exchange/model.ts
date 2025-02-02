import {
  action,
  atom,
  batch,
  onConnect,
  reatomAsync,
  sleep,
  withAbort,
  withDataAtom,
  withErrorAtom,
} from '@reatom/framework';
import { withLocalStorage } from '@reatom/persist-web-storage';
import { fetcher } from '../../api';
import { withProgress } from '@/helpers/progress';

interface ITargetCurrency {
  currency: string;
  rate: number;
}

export const amountAtom = atom(1, 'amountAtom').pipe(withLocalStorage('amount'));
export const primaryCurrencyAtom = atom('USD', 'primaryCurrencyAtom').pipe(
  withLocalStorage('primaryCurrency')
);
export const targetCurrencyIdsAtom = atom<string[]>([], 'targetCurrencyIds');
export const targetCurrenciesAtom = atom<ITargetCurrency[]>([], 'targetCurrencies').pipe(
  withLocalStorage('targetCurrencies')
);
export const onChangeAmountAction = action(
  (ctx, event: React.ChangeEvent<HTMLInputElement>) =>
    amountAtom(ctx, parseInt(event.currentTarget.value)),
  'onChangeAmountAction'
);

export const onResetAmountAction = action((ctx) => amountAtom(ctx, 1), 'onResetAmountAction');

export const onChangePrimaryCurrencyAction = action(
  (ctx, currency: string) => primaryCurrencyAtom(ctx, currency),
  'onChangePrimaryCurrencyAction'
);

export const getNewExchangeRates = action((ctx) => {
  const primaryCurrency = ctx.get(primaryCurrencyAtom);
  const targetCurrencyIds = ctx.get(targetCurrencyIdsAtom);

  if (
    targetCurrencyIds.length === 0 ||
    (targetCurrencyIds.length === 1 && targetCurrencyIds[0] === primaryCurrency)
  ) {
    return;
  }

  fetchExchangeRates(ctx, primaryCurrency, targetCurrencyIds);
});

export const onChangeTargetCurrencyAction = action((ctx, currency: string) => {
  const targetCurrencyIds = ctx.get(targetCurrencyIdsAtom);

  if (!targetCurrencyIds.includes(currency)) {
    const newCurrencies = [...targetCurrencyIds, currency];

    targetCurrencyIdsAtom(ctx, newCurrencies);
    getNewExchangeRates(ctx);
  }
}, 'onChangePrimaryCurrencyAction');

export const onDeleteTargetCurrencyAction = action((ctx, currency: string) => {
  const targetCurrencyIds = ctx.get(targetCurrencyIdsAtom);
  const targetCurrencies = ctx.get(targetCurrenciesAtom);

  if (targetCurrencyIds.includes(currency)) {
    const newCurrencies = targetCurrencyIds.filter((c) => c !== currency);

    batch(ctx, () => {
      targetCurrencyIdsAtom(ctx, newCurrencies);
      targetCurrenciesAtom(
        ctx,
        targetCurrencies.filter((c) => c.currency !== currency)
      );
    });
  }
}, 'onDeleteTargetCurrencyAction');

export const fetchExchangeRates = reatomAsync(
  async (ctx, primaryCurrency: string, targetCurrencies: string[]) => {
    await ctx.schedule(() => sleep(400));

    const { quotes } = await fetcher<'/live'>(
      '/live',
      { source: primaryCurrency, currencies: targetCurrencies },
      { signal: ctx.controller.signal }
    );

    return Object.entries(quotes).map(([currency, rate]) => ({
      currency: currency.slice(3),
      rate: rate > 0 ? rate : 1,
    }));
  },
  'fetchExchangeRates'
).pipe(withDataAtom([]), withErrorAtom(), withAbort(), withProgress());

fetchExchangeRates.onFulfill.onCall((ctx, payload) => {
  targetCurrenciesAtom(ctx, payload);
});

onConnect(targetCurrenciesAtom, (ctx) => {
  const targetCurrencies = ctx.get(targetCurrenciesAtom);

  targetCurrencyIdsAtom(
    ctx,
    targetCurrencies.map((q) => q.currency)
  );

  return getNewExchangeRates(ctx);
});
