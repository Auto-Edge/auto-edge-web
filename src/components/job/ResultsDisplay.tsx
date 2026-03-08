import React from 'react';
import type { ConversionResult } from '../../types';

interface ResultsDisplayProps {
  result: ConversionResult | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = React.memo(({ result }) => {
  if (!result) return null;

  return (
    <div className="results-display">
      <div className="results-highlight">
        <p className="results-value">{result.reduction}</p>
        <p className="results-label">size reduction</p>
      </div>

      <div className="results-grid">
        <div>
          <p className="results-item-label">Original</p>
          <p className="results-item-value">{result.original_size}</p>
        </div>
        <div>
          <p className="results-item-label">Optimized</p>
          <p className="results-item-value">{result.optimized_size}</p>
        </div>
      </div>

      <div className="results-model">
        <p className="results-item-label">Model</p>
        <p className="results-model-name">{result.model_name}</p>
      </div>
    </div>
  );
});

export default ResultsDisplay;
