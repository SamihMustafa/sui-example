import React, { useState } from 'react';
import MintButton from './mint_button';
import Progress from './progress';
import SupplyInfo from './supply';
import { get_current_supply_object } from './get_supply_object';
import MintAmountSlider from './mint_slider';

const TokenMinting: React.FC = () => {
    const [supplyData, refreshData] = get_current_supply_object(5);
    const [mintAmount, setMintAmount] = useState(1000);
  
    const handleMint = () => {
        if(supplyData == null) return 
        if (supplyData.currentSupply < supplyData.maxSupply) {
            refreshData()
        } else {
            alert("Max supply reached");
        }
    };

    if(supplyData == null){
        return <div>Loading</div>
    }
  
    return (
      <div>
        <SupplyInfo totalSupply={supplyData.maxSupply} currentSupply={supplyData.currentSupply} />
        <Progress totalSupply={supplyData.maxSupply} currentSupply={supplyData.currentSupply} />
        <MintAmountSlider
                currentSupply={supplyData.currentSupply}
                maxSupply={supplyData.maxSupply}
                mintAmount={mintAmount}
                setMintAmount={setMintAmount}
            />
        <MintButton mintAmount={mintAmount} onMint={handleMint} />
      </div>
    );
  };
  
  export default TokenMinting;