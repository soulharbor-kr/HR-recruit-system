import React, { useState } from 'react';

interface ScoreSliderProps {
  label: string;
  description: string;
  value: number;
  max: number;
  onChange: (val: number) => void;
}

export const ScoreSlider: React.FC<ScoreSliderProps> = ({ label, description, value, max, onChange }) => {
  const [inputVal, setInputVal] = useState(String(value));

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setInputVal(String(v));
    onChange(v);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    const v = Number(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= max) {
      onChange(v);
    }
  };

  const handleBlur = () => {
    const v = Math.min(max, Math.max(0, Number(inputVal) || 0));
    setInputVal(String(v));
    onChange(v);
  };

  // Sync input display when value changes externally
  React.useEffect(() => {
    setInputVal(String(value));
  }, [value]);

  const pct = (value / max) * 100;

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="font-semibold text-slate-800">{label}</h4>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {/* Direct number input */}
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            max={max}
            value={inputVal}
            onChange={handleInput}
            onBlur={handleBlur}
            className="w-14 text-center text-xl font-bold text-blue-600 border border-blue-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
          />
          <span className="text-slate-400 text-sm">/ {max}</span>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={handleSlider}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />

      {/* Progress bar visual */}
      <div className="relative h-1 mt-1 mb-1">
        <div className="absolute top-0 left-0 h-full rounded bg-blue-100 w-full" />
        <div
          className="absolute top-0 left-0 h-full rounded bg-blue-400 transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-400">
        <span>0 (부족)</span>
        <span>{max / 2} (보통)</span>
        <span>{max} (탁월)</span>
      </div>
    </div>
  );
};
