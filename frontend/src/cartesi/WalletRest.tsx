import { FetchFun } from "@calindra/cartesify/src/cartesify/FetchLikeClient"
import { JsonRpcSigner } from "ethers"
import { useState } from "react"

type WalletRestProps = {
    fetch: FetchFun
    getSigner: () => Promise<JsonRpcSigner>
}

export function WalletRest({ getSigner, fetch }: WalletRestProps) {
    const [backendResponse, setBackendResponse] = useState('')
    const [erc20address, setErc20Address] = useState(localStorage.getItem('erc20address') ?? '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d')
    const [erc721address, setErc721Address] = useState(localStorage.getItem('erc721address') ?? '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c')

    return (
        <>
            <h2>Wallet + REST</h2>
            <button onClick={async () => {
                const signer = await getSigner()
                const res = await fetch(`http://127.0.0.1:8383/wallet/${signer?.address}`)
                const json = await res.json()
                setBackendResponse(JSON.stringify(json, null, 4))
            }}>GET ETH Balance</button><br />
            <input value={erc20address} onChange={(e) => {
                localStorage.setItem('erc20address', e.target.value)
                setErc20Address(e.target.value)
            }} />
            <button onClick={async () => {
                const signer = await getSigner()
                const res = await fetch(`http://127.0.0.1:8383/wallet/${signer?.address.toLowerCase()}/erc-20/${erc20address.toLowerCase()}`)
                const json = await res.json()
                setBackendResponse(JSON.stringify(json, null, 4))
            }}>GET ERC-20 Balance</button><br />
            <input value={erc721address} onChange={(e) => {
                localStorage.setItem('erc721address', e.target.value)
                setErc721Address(e.target.value)
            }} />
            <button onClick={async () => {
                const signer = await getSigner()
                const url = `http://127.0.0.1:8383/wallet/${signer?.address.toLowerCase()}/erc-721/${erc721address.toLowerCase()}/balance`
                console.log('url', url)
                const res = await fetch(url)
                const json = await res.json()
                setBackendResponse(JSON.stringify(json, null, 4))
            }}>GET ERC-721 Balance</button>
            <div style={{ textAlign: 'left', paddingTop: '20px' }}>
                Backend response: <pre>{backendResponse}</pre>
            </div>
        </>
    )
}
