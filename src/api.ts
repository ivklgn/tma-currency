import { APILayerError } from './errors';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

type EndpointsResponse = {
  '/list': {
    params: undefined;
    response: {
      success: true;
      currencies: Record<string, string>;
    };
  };
  '/live': {
    params: {
      source: string;
      currencies: string[];
    };
    response: {
      quotes: Record<string, number>;
      source: string;
      success: true;
      timestamp: number;
    };
  };
  '/timeframe': {
    params: {
      start_date: string;
      end_date: string;
      currencies: string[];
      source: string;
    };
    response: {
      quotes: Record<string, Record<string, number>>;
      source: string;
      success: true;
      timeframe: true;
      timestamp: number;
      start_date: string;
      end_date: string;
    };
  };
};

function getAPIUrl(endpoint: keyof EndpointsResponse): string {
  return `${import.meta.env.VITE_API_URL}${endpoint}`;
}

export async function fetcher<K extends keyof EndpointsResponse>(
  endpoint: K,
  params: EndpointsResponse[K]['params'],
  options?: { signal?: AbortSignal }
) {
  const url = getAPIUrl(endpoint);
  const { initDataRaw } = retrieveLaunchParams();

  const queryString = params
    ? '?' +
      new URLSearchParams(
        Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = Array.isArray(value) ? value.join(',') : String(value);
          return acc;
        }, {})
      ).toString()
    : '';

  const response = await fetch(url + queryString, {
    signal: options?.signal,
    headers: {
      'Content-Type': 'application/json',
      init_data: JSON.stringify(initDataRaw),
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw APILayerError(
      'BackendInteractionError',
      `Error fetching data from ${endpoint}: ${response.status} ${response.statusText}, Details: ${JSON.stringify(
        errorData
      )}`,
      {
        extendedParams: {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          errorData,
        },
      }
    );
  }

  const data = await response.json();

  return data as EndpointsResponse[K]['response'];
}
