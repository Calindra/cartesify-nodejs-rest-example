import { FetchFun } from "@calindra/cartesify/src/cartesify/FetchLikeClient"
import { ERC20Portal__factory, ERC721Portal__factory, IERC20__factory, IERC721__factory } from "@cartesi/rollups"
import { JsonRpcSigner } from "ethers"
import { useEffect, useState } from "react"

type WalletRestProps = {
    fetch: FetchFun
    getSigner: () => Promise<JsonRpcSigner>
    dappAddress: string
}

export function WalletRest({ getSigner, fetch, dappAddress }: WalletRestProps) {
    const [backendResponse, setBackendResponse] = useState('')
    const [backendWalletResponse, setBackendWalletResponse] = useState('')
    const [erc20address, setErc20Address] = useState(localStorage.getItem('erc20address') ?? '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d')
    const [toAddress, setToAddress] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')
    const [erc20value, setErc20value] = useState('0')
    const [erc20balanceL1, setErc20balanceL1] = useState('0')
    const [erc20balanceL2, setErc20balanceL2] = useState('0')

    const [erc721balanceL1, setErc721balanceL1] = useState('0')
    const [erc721balanceL2, setErc721balanceL2] = useState('0')
    const [erc721address, setErc721Address] = useState(localStorage.getItem('erc721address') ?? '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c')
    const [erc721id, setErc721id] = useState('1')


    useEffect(() => {
        loadErc20balance()
    }, [erc20address])

    async function loadErc20balance() {
        const signer = await getSigner()
        const contract = IERC20__factory.connect(erc20address, signer)
        const balance = await contract.balanceOf(await signer.getAddress())
        setErc20balanceL1(balance.toString())
    }

    useEffect(() => {
        loadErc1155balance()
    }, [erc721address])

    async function loadErc1155balance() {
        const signer = await getSigner()
        const contract = IERC721__factory.connect(erc721address, signer)
        const balance = await contract.balanceOf(await signer.getAddress())
        setErc721balanceL1(balance.toString())
    }

    async function transferErc20() {
        const signer = await getSigner()
        const res = await fetch(`http://127.0.0.1:8383/wallet/erc-20/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: erc20address,
                to: toAddress,
                amount: +erc20value
            }),
            signer,
        })
        if (!res.ok) {
            console.log(res.status, res.text())
            return
        }
        const json = await res.json()
        setBackendResponse(JSON.stringify(json, null, 4))
    }

    async function transferErc721() {
        const signer = await getSigner()
        const res = await fetch(`http://127.0.0.1:8383/wallet/erc-721/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: erc721address,
                to: toAddress,
                tokenId: +erc721id
            }),
            signer,
        })
        if (!res.ok) {
            console.log(res.status, res.text())
            return
        }
        const json = await res.json()
        setBackendResponse(JSON.stringify(json, null, 4))
    }

    async function withdrawErc20() {
        const signer = await getSigner()
        const signerAddress = await signer.getAddress()
        const res = await fetch(`http://127.0.0.1:8383/wallet/${signerAddress}/erc-20/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: erc20address,
                address: signerAddress,
                amount: +erc20value
            }),
            signer: await getSigner()
        })
        if (!res.ok) {
            console.log(res.status, res.text())
            return
        }
        const json = await res.json()
        setBackendResponse(JSON.stringify(json, null, 4))
    }

    async function withdrawErc721() {
        const signer = await getSigner()
        const signerAddress = await signer.getAddress()
        const res = await fetch(`http://127.0.0.1:8383/wallet/${signerAddress}/erc-721/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: erc721address,
                address: signerAddress,
                tokenId: erc721id
            }),
            signer: await getSigner()
        })
        if (!res.ok) {
            console.log(res.status, res.text())
            return
        }
        const json = await res.json()
        setBackendResponse(JSON.stringify(json, null, 4))
    }

    async function depositErc20() {
        const signer = await getSigner()
        const portalAddress = '0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB'
        const contract = IERC20__factory.connect(erc20address, signer)
        await contract.approve(portalAddress, erc20value)
        console.log('approved')
        const portal = ERC20Portal__factory.connect(portalAddress, signer)
        console.log({ erc20address, dappAddress, erc20value })
        const tx = await portal.depositERC20Tokens(erc20address, dappAddress, +erc20value, '0x')
        await (tx as any).wait()
        console.log('Success!')
    }

    async function depositErc721() {
        const signer = await getSigner()
        const portalAddress = '0x237F8DD094C0e47f4236f12b4Fa01d6Dae89fb87'
        const contract = IERC721__factory.connect(erc721address, signer)
        await contract.approve(portalAddress, erc721id)
        console.log('approved')
        const portal = ERC721Portal__factory.connect(portalAddress, signer)
        console.log({ erc20address, dappAddress, erc20value })
        const tx = await portal.depositERC721Token(erc721address, dappAddress, erc721id, '0x', '0x')
        await (tx as any).wait()
        console.log('Success!')
    }

    return (
        <div style={{ textAlign: 'left' }}>
            <h2>Wallet + REST</h2>
            <pre>http://127.0.0.1:8383/wallet/:address/tokens</pre>
            <button onClick={async () => {
                const signer = await getSigner()
                const res = await fetch(`http://127.0.0.1:8383/wallet/${signer?.address}/tokens`)
                const json = await res.json()
                setBackendWalletResponse(JSON.stringify(json, null, 4))
            }}>GET Wallet</button><br />
            <div style={{ textAlign: 'left', paddingTop: '20px' }}>
                Backend wallet response: <pre>{backendWalletResponse}</pre>
            </div>
            <button onClick={async () => {
                const signer = await getSigner()
                const res = await fetch(`http://127.0.0.1:8383/wallet/${signer?.address}`)
                const json = await res.json()
                setBackendResponse(JSON.stringify(json, null, 4))
            }}>GET ETH Balance</button><br />

            <h3>ERC-20</h3>
            <input value={erc20address} onChange={(e) => {
                localStorage.setItem('erc20address', e.target.value)
                setErc20Address(e.target.value)
            }} />
            <button onClick={async () => {
                const signer = await getSigner()
                const res = await fetch(`http://127.0.0.1:8383/wallet/${signer?.address.toLowerCase()}/erc-20/${erc20address.toLowerCase()}`)
                const json = await res.json()
                setErc20balanceL2(json.balance)
                setBackendResponse(JSON.stringify(json, null, 4))
                loadErc20balance()
            }}>GET Balance</button><br />
            <input value={erc20value} onChange={(e) => {
                setErc20value(e.target.value)
            }} />
            <button onClick={depositErc20}>Deposit</button>
            <button onClick={withdrawErc20}>Withdraw</button><br />
            <input value={toAddress} onChange={(e) => {
                setToAddress(e.target.value)
            }} />
            <button onClick={transferErc20}>Transfer</button><br />
            L1 Balance: {erc20balanceL1}<br />
            L2 Balance: {erc20balanceL2}<br />
            

            <h3>ERC-721</h3>
            <input value={erc721address} onChange={(e) => {
                localStorage.setItem('erc721address', e.target.value)
                setErc721Address(e.target.value)
            }} />
            <button onClick={async () => {
                const signer = await getSigner()
                const url = `http://127.0.0.1:8383/wallet/${signer?.address.toLowerCase()}/erc-721/${erc721address.toLowerCase()}/balance`
                const res = await fetch(url)
                const json = await res.json()
                setErc721balanceL2(json.balance)
                setBackendResponse(JSON.stringify(json, null, 4))
                loadErc1155balance()
            }}>GET Balance</button><br />
            <input value={erc721id} onChange={(e) => {
                setErc721id(e.target.value)
            }} />
            <button onClick={depositErc721}>Deposit</button>
            <button onClick={withdrawErc721}>Withdraw</button><br />
            <input value={toAddress} onChange={(e) => {
                setToAddress(e.target.value)
            }} />
            <button onClick={transferErc721}>Transfer</button>
            <br />
            L1 Balance: {erc721balanceL1}<br />
            L2 Balance: {erc721balanceL2}<br />
            <div style={{ textAlign: 'left', paddingTop: '20px' }}>
                Backend response: <pre>{backendResponse}</pre>
            </div>
        </div>
    )
}
