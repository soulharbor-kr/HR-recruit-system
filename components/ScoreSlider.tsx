import React from 'react';

interface ScoreSliderProps {
  label: string;
  description: string;
  value: number;
  max: number;
  onChange: (val: number) => void;
}

export const ScoreSlider: React.FC<ScoreSliderProps> = ({ label, description, value, max, onChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h4 className="font-semibold text-slate-800">{label}</h4>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">{value}</span>
          <span className="text-slate-400 text-sm"> / {max}</span>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>0 (부족)</span>
        <span>{max / 2} (보통)</span>
        <span>{max} (탁월)</span>
      </div>
    </div>
  );
};