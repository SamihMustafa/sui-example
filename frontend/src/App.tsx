import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {ConnectButton} from '@suiet/wallet-kit';

function App() {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <ConnectButton/>
    </>
  )
}

export default App
