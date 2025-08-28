import { useState, memo } from "react";
import React from "react";
import { isEmpty } from "../utils";

const RateImpactConfig = memo(function RateImpactConfig({
  sellCoin,
  buyCoin,
  rate,
  impact = 0,
  slippage = 0,
  onSlippageSettingClick,
  isLoading = false,
  error = null
}) {
  const [isReversed, setIsReversed] = useState(false);

  const switchRate = () => {
    setIsReversed(!isReversed);
  };

  // Calculate display values based on reversal state
  const displayFrom = isReversed ? buyCoin : sellCoin;
  const displayTo = isReversed ? sellCoin : buyCoin;
  const displayRatio = isReversed && rate ? 1 / rate : rate;

  return (
    <div className="flex h-[50px] items-center justify-between rounded-[10px] bg-[#F9F9F9E5] p-2.5 text-sm font-medium text-[#181818]">
      <button
        className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={switchRate}
        aria-label="Switch exchange rate direction"
        disabled={isLoading}
      >
        {
          isLoading && isEmpty(rate) ? (
            <div className="bg-gray-300 rounded-md h-3 w-20 animate-pulse" />
          ) : error ? (
            <span className="text-red-500 text-xs">Error loading rate</span>
          ) : !rate ? (
            <div className="bg-gray-300 rounded-md h-3 w-20" />
          ) : (
            <React.Fragment>
              <span>
                Rate: 1 {displayFrom?.code} = {displayRatio ? displayRatio.toFixed(6) : "..."} {displayTo?.code}
              </span>
              {isLoading ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <polyline points="17 1 21 5 17 9" />
                  <line x1="21" y1="5" x2="3" y2="5" />
                  <polyline points="7 23 3 19 7 15" />
                  <line x1="3" y1="19" x2="21" y2="19" />
                </svg>
              )}
            </React.Fragment>
          )
        }
      </button>

      <div className="flex items-center gap-2">
        {isLoading && (isEmpty(impact) || isEmpty(slippage)) ? (
          <div className="bg-gray-300 rounded-md h-3 w-16 animate-pulse" />
        ) : error ? (
          <span className="text-red-500 text-xs">Error</span>
        ) : (
          <span>{impact}% Impact | {slippage} Slippage</span>
        )}
        <div onClick={onSlippageSettingClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>
      </div>
    </div>
  );
});

export default RateImpactConfig;