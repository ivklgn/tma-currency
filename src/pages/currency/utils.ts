import { getLocalStorageValue } from '@/helpers/localStorage.ts';
import { IHistoricalRate } from '@/pages/currency/model.ts';

export function isRatesValid(rates: IHistoricalRate[]) {
  return !rates.find((rateObj) => Object.values(rateObj).some((v) => !v));
}

export function prepareRates(rates: IHistoricalRate[]) {
  // empty value check for chart
  if (!isRatesValid(rates)) {
    return rates.map((rateObj) => ({
      date: rateObj.date ?? new Date().toISOString().split('T')[0],
      rate: rateObj.rate ?? 0,
    }));
  }

  return rates;
}

export function withChartData(list: IHistoricalRate[]) {
  return [['date', 'rate'], ...list.map((hr) => [hr.date, hr.rate])];
}

export function getHistoricalRatesCache() {
  const defaultData: unknown[] = [];
  const data = getLocalStorageValue('historicalRatesCache', defaultData);

  if (Array.isArray(data)) {
    return data;
  }

  return defaultData;
}
