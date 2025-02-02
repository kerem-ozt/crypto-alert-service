const axios = require('axios');

const symbolToCoinId = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  DOGE: 'dogecoin',
};

function getYesterdayDateString() {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }


async function getOldPrice(symbol, timeWindow) {
  const coinId = symbolToCoinId[symbol];
  if (!coinId) {
    throw new Error(`Unknown symbol: ${symbol}`);
  }

// timeWindow format for api => "30-12-2024"
let date; 
if (timeWindow !== null && timeWindow !== 'string'){
    date = timeWindow;
} else {
    date = getYesterdayDateString();
}

const url = `https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${date}&localization=false`;
  
  const { data } = await axios.get(url);

  if (!data.market_data || !data.market_data.current_price || !data.market_data.current_price.usd) {
    throw new Error(`No historical price data from CoinGecko for ${symbol} on date ${timeWindow}`);
  }

  const oldPrice = data.market_data.current_price.usd;
  return oldPrice; 
}

module.exports = {
  getOldPrice
};
