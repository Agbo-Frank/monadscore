import { twMerge } from "tailwind-merge"
import { clsx } from "clsx"
import { mutate } from "swr"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const compareString = (str1 = "", str2 = "") => {
  return str1?.toLowerCase() === str2?.toLowerCase()
}

export const isEmpty = (mixedVar) => {
  let undef;
  let key;
  let i;
  let len;
  const emptyValues = [undef, null, false, 0, "", "0", "null", "undefined"];

  for (i = 0, len = emptyValues.length; i < len; i++) {
    if (mixedVar === emptyValues[i] || typeof mixedVar === "undefined") {
      return true;
    }
  }

  if (Array.isArray(mixedVar)) {
    return mixedVar.length === 0;
  }

  if (typeof mixedVar === "object" && !(mixedVar instanceof Date)) {
    for (key in mixedVar) {
      if (Object.prototype.hasOwnProperty.call(mixedVar, key)) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export const clearCache = () => mutate(() => true, undefined, { revalidate: false });

export const formatCurrency = (amount, prefix = "$", decimals = 5) => {
  if(Number(amount) <= 0) {
    return `${prefix || ''}${amount}`;
  };

  const numericString = String(amount).replace(/,/g, '').replace(/[^\d.]/g, '');

  if (String(numericString).includes('.')) {
    let [integerPart, decimalPart] = numericString.split('.');
    const formattedInteger = integerPart ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

    if (decimalPart) {
      decimalPart = decimalPart.slice(0, decimals || 6);
    }

    return `${prefix || ''}${formattedInteger || ''}.${decimalPart || ''}`;
  }

  // Split integer and decimal parts if a decimal exists
  let [integerPart, decimalPart] = numericString.split('.');

  // Limit the decimal part to 5 places, if it exists
  if (decimalPart) {
    decimalPart = decimalPart.slice(0, decimals || 6);
  }

  // Format the integer part with commas
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Reassemble the number with the truncated decimal part, if it exists
  const result = decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  return prefix && !isEmpty(result) ? `${prefix}${result}` : result;
};

export const truncateAddress = (address, startChars = 4, endChars = 4) => {
  try {
    if (!address || typeof address !== 'string') {
      return '';
    }

    // Remove 0x prefix if present
    const cleanAddress = address.replace(/^0x/, '');

    if (cleanAddress.length <= startChars + endChars) {
      return address; // Return original if too short to truncate
    }

    const start = cleanAddress.slice(0, startChars);
    const end = cleanAddress.slice(-endChars);

    return `0x${start}...${end}`;
  } catch (error) {
    return address || '';
  }
};

export const delay = (seconds = 10) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

export const formatTokenBalance = (balance) => {
  if (!balance || balance === 0) return "0";

  const numBalance = parseFloat(balance);
  if (isNaN(numBalance)) return "0";

  // Handle zero
  if (numBalance === 0) return "0";

  // For very small numbers (less than 0.000001), show as "< 0.000001"
  if (numBalance > 0 && numBalance < 0.000001) {
    return "0.00";
  }

  // For negative very small numbers
  if (numBalance < 0 && numBalance > -0.000001) {
    return "0.00";
  }

  // For numbers that can be displayed normally, format with up to 8 decimal places
  // Use toFixed to ensure we never get scientific notation, then remove trailing zeros
  let decimalPlaces = 18;
  
  // For larger numbers, reduce decimal places
  if (Math.abs(numBalance) >= 1) {
    decimalPlaces = 6;
  }
  if (Math.abs(numBalance) >= 1000) {
    decimalPlaces = 4;
  }
  if (Math.abs(numBalance) >= 1000000) {
    decimalPlaces = 2;
  }
  
  const formatted = numBalance.toFixed(decimalPlaces);
  // Convert back to number and then to string to remove trailing zeros
  // But ensure we never get scientific notation by using toFixed again if needed
  const result = parseFloat(formatted);
  
  // Check if the result would be in scientific notation when converted to string
  const resultStr = result.toString();
  if (resultStr.includes('e') || resultStr.includes('E')) {
    // If it would be scientific notation, use toFixed with appropriate decimal places
    return numBalance.toFixed(Math.max(18, decimalPlaces));
  }
  
  return resultStr;
};


// returns a clean number which in string
export const cleanNumber = (value) => {
  // Remove any characters that aren't digits, decimal point, or minus sign
  let cleanValue = value.replace(/[^\d.-]/g, '');

  // Handle minus sign - only allow at the beginning
  if (cleanValue.includes('-')) {
    const minusCount = (cleanValue.match(/-/g) || []).length;
    if (minusCount > 1) {
      // Remove extra minus signs
      cleanValue = cleanValue.replace(/-/g, '');
      if (value.startsWith('-')) {
        cleanValue = '-' + cleanValue;
      }
    } else if (!cleanValue.startsWith('-')) {
      // Move minus to beginning if it's not already there
      cleanValue = '-' + cleanValue.replace('-', '');
    }
  }

  // Handle decimal points - only allow one
  const decimalCount = (cleanValue.match(/\./g) || []).length;
  if (decimalCount > 1) {
    const parts = cleanValue.split('.');
    // Keep first part and first decimal part, ignore the rest
    cleanValue = parts[0] + '.' + parts.slice(1).join('');
  }

  // Prevent multiple zeros at the beginning (except for 0.xxx format)
  cleanValue = cleanValue.replace(/^(-?)0+(\d)/, '$1$2');

  // Handle edge cases
  if (cleanValue === '-') return cleanValue; // Allow typing minus
  if (cleanValue === '-.') return cleanValue; // Allow typing -0.
  if (cleanValue === '.') return '0.'; // Convert . to 0.
  if (cleanValue === '-.') return '-0.'; // Convert -. to -0.

  return cleanValue;
};


// returns a number 
export const parseNumber = (value) => {
  // Handle empty/null/undefined values
  if (isEmpty(value)) return 0;

  // Convert to string and clean
  let stringValue = String(value).trim();
  if (stringValue === '') {
    return 0;
  }

  stringValue = cleanNumber(stringValue)
  // Parse the cleaned value
  const num = parseFloat(stringValue);

  // Return 0 if parsing fails (but allow negative numbers)
  if (isNaN(num)) {
    return 0;
  }
  return num;
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

export const isNativeCoin = (address) => {
  return address === ZERO_ADDRESS
}

export const isEthereumAddress = (str) => {
  return /^0x[a-fA-F0-9]{40}$/.test(str);
}

// Compare two decimal amounts with proper precision handling
export const compareAmountsWithPrecision = (amount1, amount2, decimals = 18) => {
  const decimalPlaces = Math.min(decimals, 18);
  // Use a more generous epsilon to handle formatting precision issues
  const epsilon = Math.pow(10, -(Math.max(6, decimalPlaces - 4)));
  
  const normalizedAmount1 = parseFloat(parseFloat(amount1).toFixed(decimalPlaces));
  const normalizedAmount2 = parseFloat(parseFloat(amount2).toFixed(decimalPlaces));
  
  // Returns: -1 if amount1 < amount2, 0 if equal (within precision), 1 if amount1 > amount2
  const diff = normalizedAmount1 - normalizedAmount2;
  
  if (Math.abs(diff) <= epsilon) return 0; // Equal within precision
  return diff > 0 ? 1 : -1;
}

// Check if amount1 is greater than amount2 with precision handling
export const isAmountGreater = (amount1, amount2, decimals = 18) => {
  return compareAmountsWithPrecision(amount1, amount2, decimals) > 0;
}

// Export storage utilities
export * from './storage';