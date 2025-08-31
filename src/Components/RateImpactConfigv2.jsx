import React, { useState } from "react";
import { FaRotateRight } from "react-icons/fa6";
import Loader from "./Loader";
import { formatTokenBalance, isEmpty } from "../utils";

export default function RateImpactConfigV2({
  buyCoin,
  rate,
  sellCoin,
  isLoading,
  onRefreshRate,
  tiggerSlippageConfig
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
    <div className="flex mt-6 items-center justify-between text-sm font-medium text-[#181818]">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={switchRate}
        disabled={isLoading}
      >
        {
          isLoading && isEmpty(rate) ?
            <div className="bg-gray-300 rounded-md h-3 w-20 animate-pulse" /> :
            <React.Fragment>
              <span>
                Rate: 1 {displayFrom?.code} = {displayRatio !== null ? formatTokenBalance(displayRatio) : "..."}{" "}
                {displayTo?.code}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="17 1 21 5 17 9" />
                <line x1="21" y1="5" x2="3" y2="5" />
                <polyline points="7 23 3 19 7 15" />
                <line x1="3" y1="19" x2="21" y2="19" />
              </svg>
            </React.Fragment>
        }
      </div>
      <div className="flex items-center gap-2">
        {/* Refresh button for rate/impact */}
        <button
          onClick={() => onRefreshRate()}
          className="p-2 rounded-full bg-[#D9D9D9] hover:bg-[#D9D9D9] transition flex items-center justify-center"
          aria-label="Refresh impact"
          disabled={isLoading}
        >
          {
            isLoading ?
              <Loader /> :
              <FaRotateRight className="w-5 h-5" />
          }
        </button>

        {/* Settings button for slippage */}
        <button
          onClick={() => tiggerSlippageConfig()}
          className="p-2 rounded-full bg-[#D9D9D9] hover:bg-[#D9D9D9] transition flex items-center justify-center"
          aria-label="Slippage settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  )
}