import React, { useRef, useEffect } from 'react';

export default function OtpInput({ length = 6, value = '', onChange, disabled = false }) {
  const inputRefs = useRef([]);

  // Convert incoming string to array of 6 characters
  const otpDigits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Auto-focus first empty input box on render
    const firstEmptyIndex = otpDigits.findIndex(d => !d);
    const targetIdx = firstEmptyIndex !== -1 ? firstEmptyIndex : 0;
    if (inputRefs.current[targetIdx] && !disabled) {
      inputRefs.current[targetIdx].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return; // Allow numeric digits only

    const digit = val.slice(-1); // Take last entered digit
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    const newOtpString = newDigits.join('');

    onChange(newOtpString);

    // Auto-advance to next box if digit entered
    if (digit && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move to previous box on backspace if current is empty
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digitsOnly = pastedData.slice(0, length);
    onChange(digitsOnly);

    const targetIdx = Math.min(digitsOnly.length, length - 1);
    if (inputRefs.current[targetIdx]) {
      inputRefs.current[targetIdx].focus();
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 sm:space-x-3 my-4">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otpDigits[index]}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={`w-11 h-13 sm:w-13 sm:h-14 text-center text-xl font-black rounded-2xl border-2 transition-all duration-200 shadow-sm focus:outline-none ${
            otpDigits[index]
              ? 'border-agri-600 bg-agri-50 text-agri-950 shadow-md ring-2 ring-agri-500/20'
              : 'border-agri-200 bg-white text-gray-800 focus:border-agri-600 focus:ring-4 focus:ring-agri-500/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      ))}
    </div>
  );
}
