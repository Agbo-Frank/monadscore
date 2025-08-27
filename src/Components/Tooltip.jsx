

import React, { useState } from "react";

const Tooltip = ({ text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative flex items-center">
      <button
        className="ml-2 text-white/70 cursor-pointer focus:outline-none"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        aria-label="Info tooltip"
        type="button"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M12 18h.01"
          />
        </svg>
      </button>
      {visible && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 bg-black bg-opacity-80 text-white text-xs rounded py-2 px-3 z-50 pointer-events-none select-none">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;