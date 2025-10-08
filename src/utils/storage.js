/**
 * Utility functions for localStorage operations with error handling
 */

const STORAGE_KEYS = {
  SELL_COIN: 'monadscore_sell_coin',
  BUY_COIN: 'monadscore_buy_coin',
  SLIPPAGE: 'monadscore_slippage',
  SELL_AMOUNT: 'monadscore_sell_amount'
};

/**
 * Safely get an item from localStorage
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {any} The parsed value or default value
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    if (typeof window === 'undefined') return defaultValue;
    
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to get storage item ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Safely set an item in localStorage
 * @param {string} key - The localStorage key
 * @param {any} value - The value to store
 * @returns {boolean} True if successful, false otherwise
 */
export const setStorageItem = (key, value) => {
  try {
    if (typeof window === 'undefined') return false;
    
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to set storage item ${key}:`, error);
    return false;
  }
};

/**
 * Safely remove an item from localStorage
 * @param {string} key - The localStorage key
 * @returns {boolean} True if successful, false otherwise
 */
export const removeStorageItem = (key) => {
  try {
    if (typeof window === 'undefined') return false;
    
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove storage item ${key}:`, error);
    return false;
  }
};

/**
 * Clear all app-specific storage items
 * @returns {boolean} True if successful, false otherwise
 */
export const clearAppStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      removeStorageItem(key);
    });
    return true;
  } catch (error) {
    console.warn('Failed to clear app storage:', error);
    return false;
  }
};

// Specific storage functions for app state
export const storage = {
  // Coin selections
  getSellCoin: () => getStorageItem(STORAGE_KEYS.SELL_COIN),
  setSellCoin: (coin) => setStorageItem(STORAGE_KEYS.SELL_COIN, coin),
  
  getBuyCoin: () => getStorageItem(STORAGE_KEYS.BUY_COIN),
  setBuyCoin: (coin) => setStorageItem(STORAGE_KEYS.BUY_COIN, coin),
  
  // Slippage settings
  getSlippage: () => getStorageItem(STORAGE_KEYS.SLIPPAGE, 0.5),
  setSlippage: (slippage) => setStorageItem(STORAGE_KEYS.SLIPPAGE, slippage),
  
  // Sell amount
  getSellAmount: () => getStorageItem(STORAGE_KEYS.SELL_AMOUNT, ""),
  setSellAmount: (amount) => setStorageItem(STORAGE_KEYS.SELL_AMOUNT, amount),
  
  // Clear all
  clearAll: clearAppStorage
};

export { STORAGE_KEYS };
