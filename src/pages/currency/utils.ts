// TODO research: иногда withCache ломается и отдает { date: string, rate: undefined }
export function isRatesValid(rates: { date: string; rate: number }[]) {
  return !rates.find((rateObj) => Object.values(rateObj).some((v) => !v));
}

export function withChartData(list: { date: string; rate: number }[]) {
  return [['date', 'rate'], ...list.map((hr) => [hr.date, hr.rate])];
}

export function getHistoricalRatesCache() {
  const data = localStorage.getItem('historicalRatesCache');

  if (data) {
    const parsedData = JSON.parse(data);

    if (Array.isArray(parsedData)) {
      return parsedData;
    }
  }

  return [];
}
