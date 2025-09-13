import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, onOTPChange, value = '', disabled = false }) => {
  const [otp, setOtp] = useState(value.split(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    setOtp(value.split(''));
  }, [value]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Call parent callback
    onOTPChange(newOtp.join(''));

    // Focus next input
    if (element.value !== '' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
    // Handle paste
    else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(clipText => {
        const pastedNumbers = clipText.replace(/\D/g, '').slice(0, length);
        const newOtp = pastedNumbers.split('');
        
        // Pad with empty strings if needed
        while (newOtp.length < length) {
          newOtp.push('');
        }
        
        setOtp(newOtp);
        onOTPChange(pastedNumbers);
        
        // Focus the last filled input or first empty
        const focusIndex = Math.min(pastedNumbers.length, length - 1);
        inputRefs.current[focusIndex].focus();
      });
    }
  };

  const handleFocus = (index) => {
    inputRefs.current[index].select();
  };

  return (
    <div className="otp-input-container">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          maxLength={1}
          value={otp[index] || ''}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`otp-digit-input ${otp[index] ? 'filled' : ''}`}
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default OTPInput;
