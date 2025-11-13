import fetch from 'node-fetch';

/**
 * Fetches the current price for a given stock ticker from the Finnhub API.
 * @param {string} ticker The stock ticker symbol (e.g., "INTC").
 * @returns {Promise<number|null>} The current price, or null if fetching fails or the price is invalid.
 */
export async function getPriceV2(ticker) {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    console.error('FINNHUB_API_KEY is not set. Cannot fetch price.');
    return null;
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;
    console.log(`Fetching price for ${ticker} from Finnhub...`);
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Finnhub API returned status ${response.status} for ${ticker}`);
      return null;
    }

    const data = await response.json();

    if (data && typeof data.c === 'number' && data.c > 0) {
      console.log(`Successfully fetched price for ${ticker}: ${data.c}`);
      return data.c;
    } else {
      console.warn(`Invalid price data received for ${ticker}: ${JSON.stringify(data)}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching price for ${ticker}:`, error);
    return null;
  }
}
