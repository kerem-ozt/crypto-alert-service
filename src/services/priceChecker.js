const cron = require('node-cron');
const axios = require('axios');
const redis = require('./redisClient'); 
const logger = require('../utils/logger');
const { Alert, User, AlertHistory } = require('../models');
const { sendNotification } = require('./notificationService');
const { getOldPrice } = require('./getOldPrice');

const symbolToCoinId = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  DOGE: 'dogecoin',
};

const PRICE_CACHE_KEY_PREFIX = 'COIN_PRICE_';

async function checkPrices() {
  try {
    const allAlerts = await Alert.findAll({
      where: { isActive: true },
      attributes: ['symbol'], 
      group: ['symbol']
    });

    if (!allAlerts.length) {
      logger.info('No active alerts found');
      return;
    }

    const uniqueSymbols = allAlerts.map(a => a.symbol);
    const coinIds = uniqueSymbols
      .map(sym => symbolToCoinId[sym])
      .filter(Boolean); 
    if (!coinIds.length) {
      logger.info('No valid coin IDs to fetch from CoinGecko');
      return;
    }

    const coinIdsParam = coinIds.join(',');

    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIdsParam}&vs_currencies=usd`
    );

    for (const coinId of coinIds) {
      const price = data[coinId]?.usd;
      if (price) {
        await redis.set(`${PRICE_CACHE_KEY_PREFIX}${coinId}`, price, 'EX', 60);
        logger.info(`Fetched new price for ${coinId}: ${price}`);
      }
    }

    const activeAlerts = await Alert.findAll({ where: { isActive: true } });

    for (let alert of activeAlerts) {
      const coinId = symbolToCoinId[alert.symbol];
      if (!coinId) {
        continue;
      }

      let coinPrice = await redis.get(`${PRICE_CACHE_KEY_PREFIX}${coinId}`);

      if (!coinPrice) {
        coinPrice = data[coinId]?.usd;
      }
      if (!coinPrice) {
        logger.warn(`Price not found for symbol: ${alert.symbol}`);
        continue;
      }

      const currentPrice = parseFloat(coinPrice);

      let meetsCondition = false;
      if (alert.dataValues.conditionType === 'above') {
        meetsCondition = currentPrice > alert.dataValues.threshold;
      } else if (alert.dataValues.conditionType === 'below') {
        meetsCondition = currentPrice < alert.dataValues.threshold;
      } else if (alert.dataValues.conditionType === 'range') {
        meetsCondition = currentPrice >= alert.dataValues.rangeLow && currentPrice <= alert.dataValues.rangeHigh;
      } else if (alert.conditionType === 'percentage_drop') {
        const oldPrice = await getOldPrice(alert.dataValues.symbol, alert.dataValues.timeWindow);
        const difference = ((currentPrice - oldPrice) / oldPrice) * 100;
        meetsCondition = difference <= -alert.dataValues.percentChange;
      } 

      if (meetsCondition) {
        const user = await User.findByPk(alert.dataValues.userId);
        logger.info(`Triggering alert for user ${user.email}, symbol=${alert.dataValues.symbol}, price=${currentPrice}`);

        alert.isActive = false;
        await alert.save();

        await AlertHistory.create({
          alertId: alert.id,
          triggeredAt: new Date(),
          notificationSent: true,
          message: `Triggered at price=${currentPrice} for symbol=${alert.symbol}`
        });

        const message = `Alert triggered for ${alert.symbol} at price=${currentPrice}`;
        sendNotification(user, message);
      }
    }
  } catch (error) {
    logger.error('Error checking prices:', error);
  }
}

function startCronJob() {
    cron.schedule('*/30 * * * * *', checkPrices);
}

module.exports = {
  checkPrices,
  startCronJob
};
