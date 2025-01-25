import {
  action,
  atom,
  onConnect,
  reatomAsync,
  sleep, withAbort,
  withDataAtom,
  withErrorAtom
} from "@reatom/framework";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { fetcher } from "../../api";

interface IExchangeCurrency {
  currency: string,
  rate: number
}

interface IExchangeRateCache {
  quotes: IExchangeCurrency[]
}

export const amountAtom = atom(1, "amountAtom").pipe(withLocalStorage("amount"));
export const primaryCurrencyAtom = atom("USD", "primaryCurrencyAtom").pipe(withLocalStorage("primaryCurrency"));
export const targetExchangeCurrenciesIdsAtom = atom<string[]>([], "targetExchangeCurrencies")

export const targetExchangeCurrenciesAtom = atom<IExchangeRateCache>({ quotes: [] }, 'targetExchangeCurrencies').pipe(withLocalStorage('targetExchangeCurrencies'))

export const isSynchronisationActiveAtom = atom(true, 'isSynchronisationActive')

// TODO:
// 1) Добавить спиннер
// 2) Добавить оптимистик удаление

// TODO: refactor
// function updateTargetExchangeCurrencies(currency: string) {
//   const key = "targetExchangeCurrencies";
//
//   // Получаем текущие данные из localStorage
//   const storedData = localStorage.getItem(key);
//
//   if (!storedData) {
//     console.warn("No data found in localStorage.");
//     return;
//   }
//
//   try {
//     // Парсим данные
//     const parsedData = JSON.parse(storedData);
//
//     // Убеждаемся, что структура корректная
//     if (!parsedData || !Array.isArray(parsedData.data)) {
//       console.error("Unexpected data format in localStorage.");
//       return;
//     }
//
//     // Фильтруем массив, удаляя указанный элемент
//     parsedData.data = parsedData.data.filter((r: unknown) => r !== currency);
//
//     // Сохраняем изменённые данные обратно
//     localStorage.setItem(key, JSON.stringify(parsedData));
//   } catch (error) {
//     console.error("Failed to parse or update localStorage data:", error);
//   }
// }

export const onChangeAmountAction = action(
  (ctx, event: React.ChangeEvent<HTMLInputElement>) => amountAtom(ctx, parseInt(event.currentTarget.value)),
  "onChangeAmountAction"
);

export const onResetAmountAction = action((ctx) => amountAtom(ctx, 1), "onResetAmountAction");

export const onChangePrimaryCurrencyAction = action(
  (ctx, currency: string) => primaryCurrencyAtom(ctx, currency),
  "onChangePrimaryCurrencyAction"
);

export const getNewExchangeRates = action((ctx) => {
  const primaryCurrency = ctx.get(primaryCurrencyAtom)
  const targetExchangeCurrencies = ctx.get(targetExchangeCurrenciesIdsAtom);

  if (targetExchangeCurrencies.length === 0 || (targetExchangeCurrencies.length === 1 && targetExchangeCurrencies[0] === primaryCurrency)) {
    return
  }

  fetchExchangeRates(ctx, primaryCurrency, targetExchangeCurrencies)
})

export const onChangeTargetCurrencyAction = action((ctx, currency: string) => {
  const targetExchangeCurrencies = ctx.get(targetExchangeCurrenciesIdsAtom);

  if (!targetExchangeCurrencies.includes(currency)) {
    const newQuotes = [...targetExchangeCurrencies, currency]

    targetExchangeCurrenciesIdsAtom(ctx, newQuotes)
    getNewExchangeRates(ctx)
  }
}, "onChangePrimaryCurrencyAction");

export const onDeleteTargetCurrencyAction = action((ctx, currency: string) => {
  const targetExchangeCurrencies = ctx.get(targetExchangeCurrenciesIdsAtom);

  if (targetExchangeCurrencies.includes(currency)) {
    const newQuotes = targetExchangeCurrencies.filter((c) => c !== currency)

    targetExchangeCurrenciesIdsAtom(ctx, newQuotes);
    getNewExchangeRates(ctx)
  }

  // const exchangeRates = ctx.get(exchangeRatesResources.dataAtom);
  //
  // if (targetExchangeCurrencies.includes(currency)) {
  //   exchangeRatesResources.dataAtom(
  //     ctx,
  //     exchangeRates.filter((r) => r.currency !== currency)
  //   );

    // updateTargetExchangeCurrencies(currency);
  // }
}, "onDeleteTargetCurrencyAction");

export const fetchExchangeRates = reatomAsync(
    async (ctx, primaryCurrency: string, targetCurrencies: string[]) => {
      await ctx.schedule(() => sleep(400));

      const { quotes } = await fetcher<'/live'>(
          "/live",
          { source: primaryCurrency, currencies: targetCurrencies },
          { signal: ctx.controller.signal }
      )

      return Object.entries(quotes).map(([currency, rate]) => ({
        currency: currency.slice(3),
        rate: rate > 0 ? rate : 1,
      }));
    },
    'fetchExchangeRates'
).pipe(withDataAtom([]), withErrorAtom(), withAbort())

onConnect(targetExchangeCurrenciesAtom, (ctx) => {
  console.log('onConnect(exchangeRatesCacheAtom')
  const exchangeRatesCache = ctx.get(targetExchangeCurrenciesAtom)

  targetExchangeCurrenciesIdsAtom(ctx, exchangeRatesCache.quotes.map((q) => q.currency))

  return getNewExchangeRates(ctx)
})

fetchExchangeRates.onFulfill.onCall((ctx, payload) => {
  const exchangeRatesCache = ctx.get(targetExchangeCurrenciesAtom)
  const isSynchronisationActive = ctx.get(isSynchronisationActiveAtom)

  if (isSynchronisationActive) {
    isSynchronisationActiveAtom(ctx, false)
  }

  console.log('>> fetchExchangeRates payload', payload)

  targetExchangeCurrenciesAtom(ctx, {...exchangeRatesCache, quotes: payload })
})

// export const exchangeRatesResources = reatomResource(async (ctx) => {
//   const primaryCurrency = ctx.spy(primaryCurrencyAtom);
//   const targetExchangeCurrencies = ctx.spy(targetExchangeCurrenciesAtom);
//
//   if (
//     targetExchangeCurrencies.length === 0 ||
//     (targetExchangeCurrencies.length === 1 && targetExchangeCurrencies[0] === primaryCurrency)
//   ) {
//     return [];
//   }
//
//   // mock
//   // return await ctx.schedule(async () => {
//   //   const quotes = {
//   //     USDAED: 3.672955,
//   //   };
//
//   //   const rates = Object.entries(quotes).map(([currency, rate]) => ({
//   //     currency: currency.slice(3),
//   //     rate: rate > 0 ? rate : 1,
//   //   }));
//   //   return rates;
//   // });
//
//   await ctx.schedule(() => sleep(400));
//
//   // await ctx.schedule(() => {
//   //   throw new Error("Network error");
//   // });
//   const { signal } = ctx.controller;
//   const { quotes } = await fetcher(
//     "/live",
//     { source: primaryCurrency, currencies: targetExchangeCurrencies },
//     { signal }
//   );
//
//   const rates = Object.entries(quotes).map(([currency, rate]) => ({
//     currency: currency.slice(3),
//     rate: rate > 0 ? rate : 1,
//   }));
//
//   return rates;
// }, "exchangeRates").pipe(withDataAtom([]), withErrorAtom());

// exchangeRatesResources.onFulfill.onCall((ctx, data) => {
//   console.log('exchangeRatesResources.onFulfill.onChange', data)
//   const exchangeRatesCache = ctx.get(exchangeRatesCacheAtom)
//   const isSynchronisationActive = ctx.get(isSynchronisationActiveAtom)
//
//   if (isSynchronisationActive) {
//     isSynchronisationActiveAtom(ctx, false)
//   }
//
//   exchangeRatesCacheAtom(ctx, {...exchangeRatesCache, quotes: data})
// })
//
// exchangeRatesCacheAtom.onChange((_ctx, newState) => {
//   if (!newState.quotes.length) {
//     return
//   }
//
//   const newTargetCurrencies = newState.quotes.map((q) => q.currency)
//
//   console.log('update targetExchangeCurrenciesAtom', newTargetCurrencies)
//   // targetExchangeCurrenciesAtom(ctx, newTargetCurrencies)
// })