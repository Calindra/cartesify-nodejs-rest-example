import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { Cartesify } from "@calindra/cartesify";
import { BrowserProvider } from 'ethers';
import { useState } from 'react';
import { ERC1155SinglePortal__factory, IERC1155__factory } from '@cartesi/rollups';

type EthereumFromWindow = import("ethers").Eip1193Provider & import("ethers").AbstractProvider;
declare global {
  interface Window {
    /** @link {https://docs.metamask.io/wallet/reference/provider-api/} */
    ethereum?: // import("@ethersproject/providers").ExternalProvider &
    EthereumFromWindow;
  }
}

const DAPP_ADDRESS = '0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C'
// replace with the content of your dapp address (it could be found on dapp.json)
const fetch = Cartesify.createFetch({
  dappAddress: DAPP_ADDRESS,
  endpoints: {
    graphQL: new URL("http://localhost:8080/graphql"),
    inspect: new URL("http://localhost:8080/inspect"),
  },
})

function App() {
  const [backendResponse, setBackendResponse] = useState('')
  const [erc20address, setErc20Address] = useState(localStorage.getItem('erc20address') ?? '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d')
  const [erc721address, setErc721Address] = useState(localStorage.getItem('erc721address') ?? '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c')

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

  async function depositERC1155() {
    const signer = await getSigner()
    const portalAddress = '0x7CFB0193Ca87eB6e48056885E026552c3A941FC4'
    const erc1155address = '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c'
    const contract = IERC1155__factory.connect(erc1155address, signer)
    const portal = ERC1155SinglePortal__factory.connect(portalAddress, signer)
    const approve = await contract.setApprovalForAll(portalAddress, true)
    console.log('approve', approve)
    const tokenId = '2'
    const value = 1
    const tx = await portal.depositSingleERC1155Token(erc1155address, DAPP_ADDRESS, tokenId, value, '0x', '0x')
    console.log('tx', tx)
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
          const signer = await getSigner()
          const res = await fetch(`http://127.0.0.1:8383/wallet/${signer?.address}`)
          const json = await res.json()
          setBackendResponse(JSON.stringify(json, null, 4))
        }}>GET ETH Balance</button>
        <input value={erc20address} onChange={(e) => {
          localStorage.setItem('erc20address', e.target.value)
          setErc20Address(e.target.value)
        }} />
        <button onClick={async () => {
          const signer = await getSigner()
          const res = await fetch(`http://127.0.0.1:8383/wallet/${signer?.address.toLowerCase()}/erc-20/${erc20address.toLowerCase()}`)
          const json = await res.json()
          setBackendResponse(JSON.stringify(json, null, 4))
        }}>GET ERC-20 Balance</button>


        <input value={erc721address} onChange={(e) => {
          localStorage.setItem('erc721address', e.target.value)
          setErc721Address(e.target.value)
        }} />
        <button onClick={async () => {
          const signer = await getSigner()
          const url = `http://127.0.0.1:8383/wallet/${signer?.address.toLowerCase()}/erc-721/${erc721address.toLowerCase()}`
          console.log('url', url)
          const res = await fetch(url)
          const json = await res.json()
          setBackendResponse(JSON.stringify(json, null, 4))
        }}>GET ERC-721 Balance</button>
        
        <div>
          ERC-1155
          
          <button onClick={depositERC1155}>Deposit</button>
        </div>

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
