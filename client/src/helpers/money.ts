export function formatMoney(amount: number | bigint, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
