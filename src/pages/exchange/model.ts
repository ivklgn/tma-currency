import { action, atom, reatomResource, sleep, withDataAtom, withErrorAtom } from "@reatom/framework";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { fetcher } from "../../api";

export const amountAtom = atom(1, "amountAtom").pipe(withLocalStorage("amount"));
export const primaryCurrencyAtom = atom("USD", "primaryCurrencyAtom").pipe(withLocalStorage("primaryCurrency"));
export const targetExchangeCurrenciesAtom = atom<string[]>([], "targetExchangeCurrencies").pipe(
  withLocalStorage("targetExchangeCurrencies")
);

// TODO: refactor
function updateTargetExchangeCurrencies(currency: string) {
  const key = "targetExchangeCurrencies";

  // Получаем текущие данные из localStorage
  const storedData = localStorage.getItem(key);

  if (!storedData) {
    console.warn("No data found in localStorage.");
    return;
  }

  try {
    // Парсим данные
    const parsedData = JSON.parse(storedData);

    // Убеждаемся, что структура корректная
    if (!parsedData || !Array.isArray(parsedData.data)) {
      console.error("Unexpected data format in localStorage.");
      return;
    }

    // Фильтруем массив, удаляя указанный элемент
    parsedData.data = parsedData.data.filter((r: unknown) => r !== currency);

    // Сохраняем изменённые данные обратно
    localStorage.setItem(key, JSON.stringify(parsedData));
  } catch (error) {
    console.error("Failed to parse or update localStorage data:", error);
  }
}

export const onChangeAmountAction = action(
  (ctx, event: React.ChangeEvent<HTMLInputElement>) => amountAtom(ctx, parseInt(event.currentTarget.value)),
  "onChangeAmountAction"
);

export const onResetAmountAction = action((ctx) => amountAtom(ctx, 1), "onResetAmountAction");

export const onChangePrimaryCurrencyAction = action(
  (ctx, currency: string) => primaryCurrencyAtom(ctx, currency),
  "onChangePrimaryCurrencyAction"
);

export const onChangeTargetCurrencyAction = action((ctx, currency: string) => {
  const targetExchangeCurrencies = ctx.get(targetExchangeCurrenciesAtom);
  if (!targetExchangeCurrencies.includes(currency)) {
    targetExchangeCurrenciesAtom(ctx, [...targetExchangeCurrencies, currency]);
  }
}, "onChangePrimaryCurrencyAction");

export const onDeleteTargetCurrencyAction = action((ctx, currency: string) => {
  const targetExchangeCurrencies = ctx.get(targetExchangeCurrenciesAtom);
  const exchangeRates = ctx.get(exchangeRatesResources.dataAtom);

  if (targetExchangeCurrencies.includes(currency)) {
    exchangeRatesResources.dataAtom(
      ctx,
      exchangeRates.filter((r) => r.currency !== currency)
    );

    updateTargetExchangeCurrencies(currency);
  }
}, "onChangePrimaryCurrencyAction");

export const exchangeRatesResources = reatomResource(async (ctx) => {
  const primaryCurrency = ctx.spy(primaryCurrencyAtom);
  const targetExchangeCurrencies = ctx.spy(targetExchangeCurrenciesAtom);

  if (
    targetExchangeCurrencies.length === 0 ||
    (targetExchangeCurrencies.length === 1 && targetExchangeCurrencies[0] === primaryCurrency)
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
    "/live",
    { source: primaryCurrency, currencies: targetExchangeCurrencies },
    { signal }
  );

  const rates = Object.entries(quotes).map(([currency, rate]) => ({
    currency: currency.slice(3),
    rate: rate > 0 ? rate : 1,
  }));

  return rates;
}, "exchangeRates").pipe(withDataAtom([]), withErrorAtom());
