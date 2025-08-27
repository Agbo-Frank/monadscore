

import React, { useState } from "react";

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

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalCardStyle = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
  padding: "32px 28px 24px 28px",
  minWidth: "320px",
  maxWidth: "90vw",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
};

const titleStyle = {
  fontSize: "1.25rem",
  fontWeight: 600,
  marginBottom: "20px",
  color: "#222",
  textAlign: "center",
};

const presetContainerStyle = {
  display: "flex",
  gap: "12px",
  marginBottom: "18px",
};

const presetButtonStyle = (active) => ({
  background: active ? "#4f46e5" : "#f3f4f6",
  color: active ? "#fff" : "#222",
  border: "none",
  borderRadius: "8px",
  padding: "8px 18px",
  fontWeight: 500,
  fontSize: "1rem",
  cursor: "pointer",
  boxShadow: active ? "0 2px 8px rgba(79,70,229,0.09)" : undefined,
  outline: active ? "2px solid #6366f1" : "none",
  transition: "background 0.15s, color 0.15s, outline 0.15s",
});

const inputContainerStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "20px",
};

const inputStyle = {
  width: "80px",
  padding: "7px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "1rem",
  marginRight: "8px",
  outline: "none",
  transition: "border 0.16s",
};

const percentLabelStyle = {
  fontSize: "1rem",
  color: "#444",
};

const closeButtonStyle = {
  position: "absolute",
  top: "12px",
  right: "14px",
  background: "none",
  border: "none",
  fontSize: "1.5rem",
  color: "#888",
  cursor: "pointer",
  borderRadius: "50%",
  width: "32px",
  height: "32px",
  lineHeight: "32px",
  textAlign: "center",
  transition: "background 0.15s",
};

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
    onSelectSlippage(value);
    setCustomValue("");
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(val)) {
      setCustomValue(val);
      const num = parseFloat(val);
      if (!isNaN(num)) {
        onSelectSlippage(num);
      }
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalCardStyle}>
        <button
          aria-label="Close"
          style={closeButtonStyle}
          onClick={onClose}
        >
          &times;
        </button>
        <div style={titleStyle}>Adjust Slippage Tolerance</div>
        <div style={presetContainerStyle}>
          {PRESET_SLIPPAGES.map((val) => (
            <button
              key={val}
              style={presetButtonStyle(Number(currentSlippage) === val)}
              onClick={() => handlePresetClick(val)}
              type="button"
            >
              {val}%
            </button>
          ))}
        </div>
        <div style={inputContainerStyle}>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Custom"
            style={inputStyle}
            value={customValue}
            onChange={handleCustomChange}
            aria-label="Custom slippage percent"
          />
          <span style={percentLabelStyle}>%</span>
        </div>
      </div>
    </div>
  );
}

export default SlippageModal;