import { tmaCurrencyMiniAppError } from './errors.js';

export async function fetchLiveCurrencies({ source, currencies }) {
  const url = new URL(`${process.env.API_URL}/latest`);

  url.searchParams.set('apikey', process.env.API_KEY);

  if (source) {
    url.searchParams.set('base_currency', source);
  }

  if (currencies) {
    url.searchParams.set('currencies', currencies);
  }

  let response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    throw tmaCurrencyMiniAppError('NetworkError', 'Network request failed', {
      originalError: err,
    });
  }

  if (!response.ok) {
    throw tmaCurrencyMiniAppError(
      'NetworkResponseError',
      'Failed to receive data from external API',
      {
        extendedParams: { status: response.status, statusText: response.statusText },
      }
    );
  }

  const json = await response.json();

  return {
    success: true,
    timestamp: json.meta?.last_updated_at
      ? new Date(json.meta.last_updated_at).getTime() / 1000
      : Date.now() / 1000,
    base: source || 'USD',
    rates: json.data,
  };
}

function getDatesBetween(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

async function fetchHistoricalForDate({ date, source, currencies }) {
  const url = new URL(`${process.env.API_URL}/historical`);

  url.searchParams.set('apikey', process.env.API_KEY);
  url.searchParams.set('date', date);

  if (source) {
    url.searchParams.set('base_currency', source);
  }

  if (currencies) {
    url.searchParams.set('currencies', currencies);
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw tmaCurrencyMiniAppError(
      'NetworkResponseError',
      'Failed to receive data from external API',
      {
        extendedParams: { status: response.status, statusText: response.statusText, date },
      }
    );
  }

  return response.json();
}

export async function fetchTimeframe({ start_date, end_date, source, currencies }) {
  const dates = getDatesBetween(start_date, end_date);

  let results;
  try {
    results = await Promise.all(
      dates.map((date) => fetchHistoricalForDate({ date, source, currencies }))
    );
  } catch (err) {
    if (err.name?.includes('tmaCurrencyMiniAppError')) {
      throw err;
    }
    throw tmaCurrencyMiniAppError('NetworkError', 'Network request failed', {
      originalError: err,
    });
  }

  const rates = {};
  for (const result of results) {
    for (const [date, ratesForDate] of Object.entries(result.data)) {
      rates[date] = ratesForDate;
    }
  }

  return {
    success: true,
    timeseries: true,
    start_date,
    end_date,
    base: source || 'USD',
    rates,
  };
}
