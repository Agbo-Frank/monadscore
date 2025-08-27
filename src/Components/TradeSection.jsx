import { useMemo, memo } from "react";
import { FaWallet } from "react-icons/fa";
import { cleanNumber, compareString, formatCurrency, formatTokenBalance, isEmpty } from "../utils";
import numeral from "numeral";

const TradeSection = memo(function TradeSection({
  type = "buy", // "buy" or "sell"
  coin,
  amount,
  onAmountChange,
  onSelect,
  balance = []
}) {
  const tokenBalance = useMemo(() => {
    if (isEmpty(balance)) return {
      balance: 0,
      balance_usd: 0
    };
    const _tokenBalance = balance.find(b => compareString(b.address, coin?.address))
    if (isEmpty(_tokenBalance)) {
      return {
        balance: 0,
        balance_usd: 0
      };
    }
    return _tokenBalance;
  }, [type, coin, balance])

  let approxValue = useMemo(() => {
    if (isEmpty(amount) || isEmpty(coin?.price)) return 0;
    return numeral(amount).multiply(coin?.price).value()
  }, [amount, coin?.price]);

  const isSell = type === "sell";

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

  const handlePercentageClick = (percentage = 100) => {
    const balance = parseFloat(tokenBalance?.balance);
    const calculatedAmount = balance * (percentage / 100);
    const formattedAmount = cleanNumber(calculatedAmount.toString());
    onAmountChange(formattedAmount);
  };

  return (
    <div className="group flex flex-col gap-1 rounded-[0.938rem] bg-[#FAFAFAE5] p-5 ring-1 ring-[#D9D9D9] transition-all mb-6">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-[#18181899] capitalize">{type}</span>
        <div className="flex items-center gap-2 text-[#18181899] text-sm font-medium">
          <FaWallet />
          <span>
            {formatTokenBalance(tokenBalance?.balance)} {coin?.code || ""}
          </span>
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
                onClick={() => handlePercentageClick()}
              >
                Max
              </button>
            </>
          )}
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
            value={amount}
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
    </div>
  )
});

export default TradeSection;