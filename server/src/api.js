import { API_KEY, API_URL } from './contants.js';

export async function fetchLiveCurrencies({ source, currencies }) {
  const url = new URL(`${API_URL}/live`);

  if (source) {
    url.searchParams.set('source', source);
  }

  if (currencies) {
    url.searchParams.set('currencies', currencies);
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      apikey: API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to receive data from external API');
  }

  return await response.json();
}

export async function fetchTimeframe({ start_date, end_date, source, currencies }) {
  const url = new URL(`${API_URL}/timeframe`);

  url.searchParams.set('start_date', start_date);
  url.searchParams.set('end_date', end_date);

  if (source) {
    url.searchParams.set('source', source);
  }

  if (currencies) {
    url.searchParams.set('currencies', currencies);
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      apikey: API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to receive data from external API');
  }

  return await response.json();
}
