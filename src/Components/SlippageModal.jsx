import React, { useState } from "react";
import { cleanNumber, isEmpty, parseNumber } from "../utils";

/**
 * SlippageModal component for adjusting slippage tolerance.
 *
 * Props:
 * - isOpen: boolean, controls modal visibility
 * - onClose: function, called when modal is closed
 * - onSelectSlippage: function, called with slippage value (number, percent)
 * - currentSlippage: number, current slippage value (percent)
 */
const PRESET_SLIPPAGES = [0.1, 0.5, 1];

function SlippageModal({ isOpen, onClose, onSelectSlippage, currentSlippage }) {
  const [customValue, setCustomValue] = useState(
    !PRESET_SLIPPAGES.includes(Number(currentSlippage))
      ? currentSlippage
      : ""
  );

  React.useEffect(() => {
    // Sync input if currentSlippage is changed externally
    if (!PRESET_SLIPPAGES.includes(Number(currentSlippage))) {
      setCustomValue(currentSlippage);
    } else {
      setCustomValue("");
    }
  }, [currentSlippage]);

  if (!isOpen) return null;

  const handlePresetClick = (value) => {
    onSelectSlippage(value || currentSlippage || 0.5);
    setCustomValue("");
    onClose()
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomValue(val)
  };

  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-2xl shadow-lg p-8 min-w-[320px] max-w-[90vw] flex flex-col items-center relative">
        <button
          aria-label="Close"
          className="absolute top-3 right-4 bg-transparent border-none text-2xl text-gray-500 cursor-pointer rounded-full w-8 h-8 leading-8 text-center transition-colors duration-150 hover:bg-gray-100"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="text-xl font-semibold mb-5 text-gray-800 text-center">
          Adjust Slippage Tolerance
        </div>
        <div className="flex gap-3 mb-5">
          {PRESET_SLIPPAGES.map((val) => (
            <button
              key={val}
              className={`px-4 py-2 rounded-lg font-medium text-base cursor-pointer transition-all duration-150 ${Number(currentSlippage) === val
                ? "bg-indigo-600 text-white shadow-md outline-2 outline outline-indigo-500"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              onClick={() => handlePresetClick(val)}
              type="button"
            >
              {val}%
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-5">
          <input
            min="0"
            step="0.01"
            placeholder="Custom"
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-base outline-none transition-colors duration-150 focus:border-indigo-500"
            value={customValue}
            onChange={handleCustomChange}
            aria-label="Custom slippage percent"
          />
          <span className="text-base text-gray-600">%</span>
        </div>
        <button
          className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium text-base cursor-pointer transition-colors duration-150 hover:bg-indigo-700"
          onClick={() => handlePresetClick(parseNumber(customValue))}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export default SlippageModal;