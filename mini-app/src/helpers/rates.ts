import { ICurrencyRate } from '@/types/currency';

export function transformRates(
  rates: Record<string, number>,
  filter?: (currency: string) => boolean
): ICurrencyRate[] {
  return Object.entries(rates)
    .filter(([currency]) => (filter ? filter(currency) : true))
    .map(([currency, rate]) => ({
      currency,
      rate: rate > 0 ? rate : 1,
    }));
}
