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

export const formatCurrency = (value, prefix = "$") => {
  value = parseNumber(value)
  return `${prefix}${value
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

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

  // Handle very small numbers that would display in scientific notation
  if (numBalance === 0) return "0";

  // For very small numbers (less than 0.000001), show as "< 0.000001"
  if (numBalance > 0 && numBalance < 0.000001) {
    return "< 0.000001";
  }

  // For negative very small numbers
  if (numBalance < 0 && numBalance > -0.000001) {
    return "> -0.000001";
  }

  // For numbers that can be displayed normally, format with up to 6 decimal places
  // Remove trailing zeros
  const formatted = numBalance.toFixed(6);
  return parseFloat(formatted).toString();
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