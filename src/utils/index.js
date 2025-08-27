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

export const parseNumber = (value) => {
  // Handle empty/null/undefined values
  if (isEmpty(value)) return 0;

  // Convert to string and clean
  let stringValue = String(value).trim();
  if (stringValue === '') {
    return 0;
  }

  // Remove any non-numeric characters except decimal point and minus sign
  stringValue = stringValue.replace(/[^0-9.-]/g, '');

  // Prevent multiple decimal points
  const decimalCount = (stringValue.match(/\./g) || []).length;
  if (decimalCount > 1) {
    const parts = stringValue.split('.');
    stringValue = parts[0] + '.' + parts.slice(1).join('');
  }

  // Prevent multiple minus signs (keep only the first one at the beginning)
  const minusCount = (stringValue.match(/-/g) || []).length;
  if (minusCount > 1) {
    stringValue = stringValue.replace(/-/g, '');
    if (minusCount > 0) {
      stringValue = '-' + stringValue;
    }
  }

  // Prevent leading zeros (except for decimal numbers like 0.5)
  if (stringValue.startsWith('0') && stringValue.length > 1 && !stringValue.startsWith('0.')) {
    stringValue = stringValue.replace(/^0+/, '0');
    if (stringValue === '0' && !stringValue.includes('.')) {
      stringValue = '';
    }
  }

  // Parse the cleaned value
  const num = parseFloat(stringValue);

  // Return 0 if parsing fails (but allow negative numbers)
  if (isNaN(num)) {
    return 0;
  }
  return num;
};

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