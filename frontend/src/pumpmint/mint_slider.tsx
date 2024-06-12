import React, { useState } from 'react';
import { Slider, Input } from '@mui/material';

interface TokenMintPageProps {
    currentSupply: number;
    maxSupply: number;
    mintAmount: number;
    setMintAmount(amount: number): void;
  }

const MintAmountSlider: React.FC<TokenMintPageProps> = ({
    currentSupply,
    maxSupply,
    mintAmount,
    setMintAmount
  }) => {
    // Calculate the max value for the slider
    const maxMintAmount = Math.min(5000, maxSupply - currentSupply);
    const [isEditable, setIsEditable] = useState(true);

    // Handle slider value change
    const handleSliderChange = (event: Event, value: number | number[]) => {
        setMintAmount(value as number);
      };

    // Handle input value change
    const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(event.target.value, 10);
        if (newValue >= 0 && newValue <= maxSupply - currentSupply) {
          setMintAmount(newValue);
        }
      };

    const isSupplyLow = maxSupply - currentSupply < 1000;

      if (isSupplyLow) {
        setIsEditable(false);
      }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Input Field for Manual Entry */}
            <Input
                type="number"
                value={mintAmount}
                onChange={handleTextFieldChange}
                disabled={!isEditable}
                inputProps={{
                step: 1000,
                min: 0,
                max: maxMintAmount,
            }}
            style={{ color: 'white' }} 
            />
            {/* Slider Component */}
            <Slider
                value={mintAmount}
                onChange={handleSliderChange}
                min={0}
                max={maxMintAmount}
                step={1000}
                disabled={!isEditable}
             />
        </div>
    );
};

export default MintAmountSlider;
