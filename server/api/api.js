export async function fetchLiveCurrencies({ source, currencies }) {
  const url = new URL(`${process.env.API_URL}/latest`);

  if (source) {
    url.searchParams.set("base", source);
  }

  if (currencies) {
    url.searchParams.set("symbols", currencies);
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to receive data from external API");
  }

  return await response.json();
}

export async function fetchTimeframe({ start_date, end_date, source, currencies }) {
  const url = new URL(`${process.env.API_URL}/timeseries`);

  url.searchParams.set("start_date", start_date);
  url.searchParams.set("end_date", end_date);

  if (source) {
    url.searchParams.set("base", source);
  }

  if (currencies) {
    url.searchParams.set("symbols", currencies);
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to receive data from external API");
  }

  return await response.json();
}
