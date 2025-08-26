/**
 * Utility functions for stock price generation and manipulation
 */

/**
 * Generates a random number within a given range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number between min and max
 */
export const getRandom = (min, max) => Math.random() * (max - min) + min;

/**
 * Generates a more realistic, volatile sequence of candles towards a target price
 * This function creates price action that moves towards a target with realistic volatility
 * @param {Object} startData - Starting candle data with date, open, high, low, close
 * @param {number} targetPrice - The price we want to reach
 * @param {number} periodInDays - Number of days to reach the target
 * @returns {Array} Array of candle data points
 */
export const generatePriceAction = (startData, targetPrice, periodInDays) => {
  const priceActionData = [];
  let currentData = { ...startData };
  const totalPriceChange = targetPrice - startData.close;
  const direction = totalPriceChange > 0 ? "up" : "down";

  for (let i = 0; i < periodInDays; i++) {
    // Add one day to current date
    const newDate = new Date(currentData.date.getTime() + 86400000);
    const open = currentData.close;
    let close;

    // Introduce randomness with a bias towards the target direction to create volatility
    const randomMove = getRandom(-8, 8); // A random daily fluctuation
    const drift = (totalPriceChange / periodInDays) * 1.5; // A stronger push towards the target

    if (direction === "up") {
      // More likely to have a positive move
      close = open + Math.abs(drift) + randomMove;
    } else {
      // More likely to have a negative move
      close = open - Math.abs(drift) + randomMove;
    }

    // On the final day, ensure we hit the target price exactly
    if (i === periodInDays - 1) {
      close = targetPrice;
    }

    // Ensure close is not the same as open to avoid zero-height candles
    if (close.toFixed(2) === open.toFixed(2)) {
      close += getRandom(0.1, 0.5) * (Math.random() > 0.5 ? 1 : -1);
    }

    // Calculate high and low based on open and close
    const high = Math.max(open, close) + getRandom(0, 5);
    const low = Math.min(open, close) - getRandom(0, 5);

    // Create new data point ensuring all values are positive
    const newDataPoint = {
      date: newDate,
      open: Math.max(0.01, open),
      high: Math.max(0.01, high),
      low: Math.max(0.01, low),
      close: Math.max(0.01, close),
    };

    priceActionData.push(newDataPoint);
    currentData = newDataPoint;
  }

  return priceActionData;
};

/**
 * Generates initial historical stock data
 * @param {number} days - Number of days of historical data to generate
 * @param {number} startingPrice - Starting price for the stock
 * @returns {Array} Array of historical candle data
 */
export const generateInitialData = (days = 60, startingPrice = 100) => {
  const initialData = [];
  let lastClose = startingPrice;
  const today = new Date();

  // Generate historical data going backwards from today
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - i));

    const open = lastClose;
    const close = open + getRandom(-5, 5);
    const high = Math.max(open, close) + getRandom(0, 5);
    const low = Math.min(open, close) - getRandom(0, 5);

    initialData.push({
      date,
      open,
      high,
      low,
      close,
    });

    // Ensure price doesn't go too low initially
    lastClose = Math.max(10, close);
  }

  return initialData;
};
