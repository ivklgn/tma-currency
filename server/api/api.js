import { tmaCurrencyMiniAppError } from './errors.js';

export async function fetchLiveCurrencies({ source, currencies }) {
  const url = new URL(`${process.env.API_URL}/latest`);

  if (source) {
    url.searchParams.set('base', source);
  }

  if (currencies) {
    url.searchParams.set('symbols', currencies);
  }

  let response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.API_KEY,
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
      'Failed to receive data from external API'
    );
  }

  return await response.json();
}

export async function fetchTimeframe({ start_date, end_date, source, currencies }) {
  const url = new URL(`${process.env.API_URL}/timeseries`);

  url.searchParams.set('start_date', start_date);
  url.searchParams.set('end_date', end_date);

  if (source) {
    url.searchParams.set('base', source);
  }

  if (currencies) {
    url.searchParams.set('symbols', currencies);
  }

  let response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.API_KEY,
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
      'Failed to receive data from external API'
    );
  }

  return await response.json();
}
