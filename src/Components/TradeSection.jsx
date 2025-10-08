import { useMemo, memo, useImperativeHandle, forwardRef } from "react";
import { FaWallet } from "react-icons/fa";
import { cleanNumber, compareString, formatCurrency, isEmpty } from "../utils";
import numeral from "numeral";
import useTokenBalance from "../hooks/use-token-balance";

const TradeSection = memo(forwardRef(function TradeSection({
  type = "buy", // "buy" or "sell"
  coin,
  amount,
  onAmountChange,
  onSelect,
  balance = [],
  children = null
}, ref) {
  // Get the specific token balance for this coin using RPC
  const {
    balance: rpcBalance,
    decimals: tokenDecimals,
    refetch: refetchBalance
  } = useTokenBalance(coin?.address, {
    enabled: !!coin?.address,
    refetchInterval: 30000
  });

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refreshBalance: async () => {
      if (refetchBalance) {
        return await refetchBalance();
      }
    }
  }), [refetchBalance]);

  // Get the specific token balance for this coin (prioritize RPC over API)
  const tokenBalance = useMemo(() => {
    const defaultBalance = { balance: 0, balance_usd: 0, decimals: 18 }
    if (!coin?.address) {
      return defaultBalance;
    }

    // Always prioritize RPC balance when available
    if (rpcBalance !== undefined && rpcBalance !== null) {
      return {
        balance: rpcBalance,
        balance_usd: rpcBalance * (coin?.price || 0),
        decimals: tokenDecimals || coin?.decimals || 18
      };
    }

    // Fallback to API balance only if RPC is not available
    const apiBalance = balance.find(b => compareString(b.address, coin?.address));
    if (apiBalance) {
      return {
        ...apiBalance,
        decimals: coin?.decimals || 18
      };
    }

    return defaultBalance;
  }, [coin?.address, coin?.decimals, coin?.price, balance, rpcBalance, tokenDecimals]);

  let approxValue = useMemo(() => {
    if (isEmpty(amount) || isEmpty(coin?.price)) return 0;
    return numeral(amount).multiply(coin?.price).value()
  }, [amount, coin?.price]);

  const isSell = type === "sell";

  // Format amount based on token decimals
  const formatAmountByDecimals = (value, decimals) => {
    if (!value || value === 0) return "0";

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue === 0) return "0";

    // For very small numbers (less than 0.000001), show as "< 0.000001"
    if (numValue > 0 && numValue < 0.000001) {
      return "0.00";
    }

    // For negative very small numbers
    if (numValue < 0 && numValue > -0.000001) {
      return "0.00";
    }

    // For tokens with fewer decimals, show fewer decimal places
    let decimalPlaces = 6; // default
    if (decimals && decimals <= 6) {
      decimalPlaces = Math.max(2, decimals);
    } else if (decimals && decimals <= 8) {
      decimalPlaces = 6;
    } else {
      decimalPlaces = 8;
    }

    // For very small numbers, show more precision
    if (numValue > 0 && numValue < 0.000001) {
      decimalPlaces = Math.max(decimalPlaces, 8);
    }

    const formatted = numValue.toFixed(decimalPlaces);
    const result = parseFloat(formatted);

    // Check if the result would be in scientific notation when converted to string
    const resultStr = result.toString();
    if (resultStr.includes('e') || resultStr.includes('E')) {
      // If it would be scientific notation, use toFixed with appropriate decimal places
      return numValue.toFixed(Math.max(8, decimalPlaces));
    }

    return resultStr;
  };

  // Get the effective decimals (use the same source as tokenBalance)
  const effectiveDecimals = tokenBalance?.decimals || tokenDecimals || coin?.decimals || 18;

  const handleAmountChange = (value) => {
    const formattedValue = cleanNumber(value);
    onAmountChange(formattedValue);
  };

  const handleInputChange = (e) => {
    handleAmountChange(e.target.value);
  };

  // Handle key press to prevent invalid characters from being entered
  const handleKeyPress = (e) => {
    const char = e.key;
    const currentValue = e.target.value;

    // Allow control keys (backspace, delete, arrow keys, etc.)
    if (e.ctrlKey || e.metaKey ||
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(char)) {
      return;
    }

    // Allow digits
    if (/\d/.test(char)) {
      return;
    }

    // Allow decimal point if there isn't one already
    if (char === '.' && !currentValue.includes('.')) {
      return;
    }

    // Allow minus sign only at the beginning and if there isn't one already
    if (char === '-' && !currentValue.includes('-') && e.target.selectionStart === 0) {
      return;
    }

    // Prevent all other characters
    e.preventDefault();
  };

  const handlePercentageClick = (percentage) => {
    const balance = parseFloat(tokenBalance?.balance);
    let calculatedAmount = balance * (percentage / 100);

    // If balance is a decimals value use 99.99999, else use 100
    if (percentage === 100 && String(balance).includes('.')) {
      calculatedAmount = balance * (99.99999 / 100);
    }

    const formattedAmount = formatAmountByDecimals(calculatedAmount, effectiveDecimals);
    onAmountChange(formattedAmount);
  };

  return (
    <div className="group flex flex-col gap-1 rounded-[0.938rem] bg-[#FAFAFAE5] p-5 ring-1 ring-[#D9D9D9] transition-all mb-6">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-[#18181899] capitalize">{type}</span>
        <div className="flex items-center gap-2 text-[#18181899] text-sm font-medium">
          {isSell && (
            <>
              <button
                className="py-2 px-3 rounded bg-[#E5E5E5] text-[#181818] font-medium hover:bg-[#D9D9D9] transition"
                onClick={() => handlePercentageClick(50)}
              >
                50%
              </button>
              <button
                className="py-2 px-3 rounded bg-[#E5E5E5] text-[#181818] font-medium hover:bg-[#D9D9D9] transition"
                onClick={() => handlePercentageClick(100)}
              >
                Max
              </button>
            </>
          )}

          <div className="flex gap-2">
            <FaWallet />
            <span>
              {formatAmountByDecimals(tokenBalance?.balance, effectiveDecimals)} {coin?.code || ""}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-4 mt-2">
        <div
          className="flex h-10 items-center gap-2.5 rounded-[0.625rem] border border-[#E5E5E5] bg-[#F3F3F3] px-4 cursor-pointer"
          onClick={onSelect}
        >
          <span className="text-[#181818] font-medium text-sm">
            {
              coin?.code ||
              <div className="bg-gray-200 rounded-md h-3 w-12" />
            }
          </span>
          <div className="pointer-events-none text-[#939393]">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col w-full">
          <input
            type="text"
            inputMode="decimal"
            className="w-full bg-transparent text-right font-medium outline-none placeholder:text-[#939393] text-[1.5rem]"
            placeholder="0.00"
            value={amount || ""}
            disabled={!isSell}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            style={{
              MozAppearance: "textfield",
              appearance: "textfield",
              scrollbarWidth: "none",
              WebkitAppearance: "none",
              WebkitInnerSpinButton: "none",
              WebkitOuterSpinButton: "none",
            }}
          />
          <span className="block text-right text-sm text-[#939393] mt-1">
            ~{formatCurrency(approxValue)}
          </span>
        </div>
      </div>
      {children}
    </div>
  )
}));

export default TradeSection;
