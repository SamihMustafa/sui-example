import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {WalletProvider, SuiTestnetChain, Chain} from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

const SupportedChains: Chain[] = [
  SuiTestnetChain
]

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <WalletProvider chains={SupportedChains}>
    <App/>
  </WalletProvider>
  </React.StrictMode>
)
