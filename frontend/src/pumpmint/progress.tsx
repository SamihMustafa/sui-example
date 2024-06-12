import React from 'react';

interface ProgressProps {
  totalSupply: number;
  currentSupply: number;
}

const Progress: React.FC<ProgressProps> = ({ totalSupply, currentSupply }) => {
  const progress = (currentSupply / totalSupply) * 100;
  
  return (
    <div>
      <p>Progress: {progress.toFixed(2)}%</p>
      <progress value={currentSupply} max={totalSupply}></progress>
    </div>
  );
};

export default Progress;