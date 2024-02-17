import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { Cartesify } from "@calindra/cartesify";
import { BrowserProvider } from 'ethers';
import { useState } from 'react';

type EthereumFromWindow = import("ethers").Eip1193Provider & import("ethers").AbstractProvider;
declare global {
  interface Window {
    /** @link {https://docs.metamask.io/wallet/reference/provider-api/} */
    ethereum?: // import("@ethersproject/providers").ExternalProvider &
    EthereumFromWindow;
  }
}

// replace with the content of your dapp address (it could be found on dapp.json)
const fetch = Cartesify.createFetch({
  dappAddress: '0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C',
  endpoints: {
    graphQL: new URL("http://localhost:8080/graphql"),
    inspect: new URL("http://localhost:8080/inspect"),
  },
})

function App() {
  const [backendResponse, setBackendResponse] = useState('')
  async function getSigner() {
    try {
      if (!window.ethereum) {
        alert("Connecting to metamask failed.");
        return
      }
      await window.ethereum.request({ method: "eth_requestAccounts" })
      const provider = new BrowserProvider(
        window.ethereum
      );
      return provider.getSigner();
    } catch (error) {
      console.log(error);
      alert("Connecting to metamask failed.");
    }
  }

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
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={async () => {
          const res = await fetch('http://127.0.0.1:8383/health')
          const json = await res.json()
          setBackendResponse(JSON.stringify(json, null, 4))
        }}>GET</button>
        <button onClick={async () => {
          const res = await fetch('http://127.0.0.1:8383/new-game', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ any: 'body' }),
            signer: await getSigner()
          })
          const json = await res.json()
          setBackendResponse(JSON.stringify(json, null, 4))
        }}>POST</button>
        <div style={{ textAlign: 'left', paddingTop: '20px' }}>
          Backend response: <pre>{backendResponse}</pre>
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
