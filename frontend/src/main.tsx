import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Chain, EthosConnectProvider } from 'ethos-connect'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <EthosConnectProvider ethosConfiguration={{
    chain: Chain.SUI_TESTNET,  network: "https://fullnode.testnet.sui.io:443"
    }}>
    <App/>
  </EthosConnectProvider>
  </React.StrictMode>
)
