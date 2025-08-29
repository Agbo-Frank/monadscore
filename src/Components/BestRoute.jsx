import React, { useState } from "react";

const BestRoute = ({ impact, networkFee, dexName, maxSlippage }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full overflow-hidden mt-4 border border-[#D9D9D9] rounded-lg  backdrop-blur-md">
      {/* Accordion Header */}
      <button
        className="w-full flex items-center justify-between p-4 text-sm font-medium bg-[#FAFAFA] text-[#181818] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span>{dexName}</span>
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded">
            Best Route
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
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
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 text-sm text-[#181818] bg-gray-200/40">
          {/* Row 1 */}
          <div className="flex justify-between items-center gap-2 mb-1">
            <span>Price Impact</span>
            <span className={impact < 0 ? "text-red-500" : "text-green-500"}>{impact}%</span>
          </div>
          <hr className="border-t border-black/5" />
          <div className="flex justify-between items-center gap-2 my-1">
            <span>Max Slippage</span>
            <span>{maxSlippage ? maxSlippage + "%" : "N/A"}</span>
          </div>
          <hr className="border-t border-black/5" />
          {/* Row 2 */}
          <div className="flex justify-between items-center gap-2 my-1">
            <span>Network Fee</span>
            <span>{networkFee}</span>
          </div>
          <hr className="border-t border-black/5" />
        </div>
      )}
    </div>
  );
};

export default BestRoute;