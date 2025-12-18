import { tmaCurrencyMiniAppError } from './errors.js';

export async function fetchHistorical({ date, source, currencies }) {
  const url = new URL(`${process.env.API_URL}/historical`);

  url.searchParams.set('date', date);

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
        apikey: process.env.API_KEY,
      },
    });
  } catch (err) {
    throw tmaCurrencyMiniAppError('NetworkError', 'Network request failed', {
      originalError: err,
    });
  }

  const json = await response.json();

  if (!response.ok) {
    throw tmaCurrencyMiniAppError(
      'NetworkResponseError',
      'Failed to receive data from external API',
      {
        extendedParams: {
          status: response.status,
          statusText: response.statusText,
          date,
          error: json,
        },
      }
    );
  }

  const rates = json.data?.[date] || {};

  return {
    success: true,
    date,
    base: source || 'USD',
    rates,
  };
}

export async function fetchLiveCurrencies({ source, currencies }) {
  const url = new URL(`${process.env.API_URL}/latest`);

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
        apikey: process.env.API_KEY,
      },
    });
  } catch (err) {
    throw tmaCurrencyMiniAppError('NetworkError', 'Network request failed', {
      originalError: err,
    });
  }

  const json = await response.json();

  if (!response.ok) {
    throw tmaCurrencyMiniAppError(
      'NetworkResponseError',
      'Failed to receive data from external API',
      {
        extendedParams: {
          status: response.status,
          statusText: response.statusText,
          error: json,
        },
      }
    );
  }

  return {
    success: true,
    timestamp: json.meta?.last_updated_at
      ? new Date(json.meta.last_updated_at).getTime() / 1000
      : Date.now() / 1000,
    base: source || 'USD',
    rates: json.data,
  };
}
