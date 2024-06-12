import React from 'react';

interface SupplyInfoProps {
  totalSupply: number;
  currentSupply: number;
}

const SupplyInfo: React.FC<SupplyInfoProps> = ({ totalSupply, currentSupply }) => {
    const formatNumberWithCommas = (number: number): string => {
        return number.toLocaleString();
    };
  return (
    <div>
      <p>Total Supply: {formatNumberWithCommas(totalSupply)}</p>
      <p>Current Supply: {formatNumberWithCommas(currentSupply)}</p>
    </div>
  );
};

export default SupplyInfo;