import {
  action,
  atom,
  batch,
  onConnect,
  reatomResource,
  sleep,
  withErrorAtom,
} from '@reatom/framework';
import { withLocalStorage } from '@reatom/persist-web-storage';
import { fetcher } from '../../api';

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
export const isSynchronisationActiveAtom = atom(true, 'isSynchronisationActive');

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

export const onChangeTargetCurrencyAction = action((ctx, currency: string) => {
  const targetCurrencyIds = ctx.get(targetCurrencyIdsAtom);

  if (!targetCurrencyIds.includes(currency)) {
    const newCurrencies = [...targetCurrencyIds, currency];

    targetCurrencyIdsAtom(ctx, newCurrencies);
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

export const currenciesResources = reatomResource(async (ctx) => {
  const primaryCurrency = ctx.spy(primaryCurrencyAtom);
  const targetCurrencyIds = ctx.spy(targetCurrencyIdsAtom);

  if (
    targetCurrencyIds.length === 0 ||
    (targetCurrencyIds.length === 1 && targetCurrencyIds[0] === primaryCurrency)
  ) {
    return [];
  }

  // mock
  // return await ctx.schedule(async () => {
  //   const quotes = {
  //     USDAED: 3.672955,
  //   };

  //   const rates = Object.entries(quotes).map(([currency, rate]) => ({
  //     currency: currency.slice(3),
  //     rate: rate > 0 ? rate : 1,
  //   }));
  //   return rates;
  // });

  await ctx.schedule(() => sleep(400));

  // await ctx.schedule(() => {
  //   throw new Error("Network error");
  // });
  const { signal } = ctx.controller;
  const { quotes } = await fetcher(
    '/live',
    { source: primaryCurrency, currencies: targetCurrencyIds },
    { signal }
  );

  return Object.entries(quotes).map(([currency, rate]) => ({
    currency: currency.slice(3),
    rate: rate > 0 ? rate : 1,
  }));
}, 'currenciesResources').pipe(withErrorAtom());

currenciesResources.onFulfill.onCall((ctx, data) => {
  const isSynchronisationActive = ctx.get(isSynchronisationActiveAtom);

  if (isSynchronisationActive) {
    isSynchronisationActiveAtom(ctx, false);
  }

  targetCurrenciesAtom(ctx, data);
});

onConnect(targetCurrenciesAtom, (ctx) => {
  const targetCurrencies = ctx.get(targetCurrenciesAtom);

  if (!targetCurrencies.length) {
    return;
  }

  targetCurrencyIdsAtom(
    ctx,
    targetCurrencies.map((q) => q.currency)
  );
});
