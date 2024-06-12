import React from 'react';
import { mint_token_transaction } from './mint_transaction';
import { EthosConnectStatus, SignInButton, ethos, TransactionBlock } from 'ethos-connect';

interface MintButtonProps {
  mintAmount: number,
  onMint: () => void;
}

const MintButton: React.FC<MintButtonProps> = ({ mintAmount,onMint }) => {
  const { wallet, status } = ethos.useWallet();

  const handleMint = async () => {
    if(wallet){
      const trx = mint_token_transaction(mintAmount);
      console.log(trx);
      const trx_bytes = await trx.build({onlyTransactionKind: true, client: wallet.client})
      const gaslessPayloadBase64 = btoa(
        trx_bytes
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
  
      const url = new URL('https://cfch58kxxa.execute-api.eu-north-1.amazonaws.com/Prod/get-gasless-trx');
  
      url.searchParams.append("trx_bytes", gaslessPayloadBase64)
      url.searchParams.append("sender_addr", wallet.address)
      console.log(url)
      const response = await (await fetch(url)).json()
      console.log(response)
      const sender_sig = await wallet.signTransactionBlock({
        transactionBlock: TransactionBlock.from(response.sponsored_bytes)
      })

      wallet.executeTransactionBlock({
        transactionBlock: response.sponsored_bytes,
        signature: [sender_sig.signature, response.signature]
      })

     console.log(`Transaction successful: ${response}`);

      onMint();
    }
  };

  if(status == EthosConnectStatus.Connected){
    return (
      <button onClick={handleMint}>
        Mint Token
      </button>
    );
  } else {
    return <SignInButton>Connect Wallet to Mint Tokens</SignInButton>
  }
};

export default MintButton;