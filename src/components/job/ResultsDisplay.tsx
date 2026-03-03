import React from 'react';
import type { ConversionResult } from '../../types';

interface ResultsDisplayProps {
  result: ConversionResult | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="space-y-3">
      <div className="text-center py-2">
        <p className="text-2xl font-semibold text-green-400">{result.reduction}</p>
        <p className="text-slate-500 text-xs">size reduction</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500 text-xs">Original</p>
          <p className="text-white">{result.original_size}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Optimized</p>
          <p className="text-white">{result.optimized_size}</p>
        </div>
      </div>

      <div className="text-sm">
        <p className="text-slate-500 text-xs">Model</p>
        <p className="text-white font-mono text-xs truncate">{result.model_name}</p>
      </div>
    </div>
  );
};

export default ResultsDisplay;
