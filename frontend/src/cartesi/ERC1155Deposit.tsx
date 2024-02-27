import { FetchFun } from "@calindra/cartesify/src/cartesify/FetchLikeClient"
import { ERC1155BatchPortal__factory, ERC1155SinglePortal__factory, IERC1155__factory, CartesiDApp__factory, DAppAddressRelay } from "@cartesi/rollups"
import { Signer } from "ethers"
import { useEffect, useState } from "react"
import { Voucher } from "./model/Voucher"
import { VoucherService } from "./services/VoucherService"

type ERC1155DepositProps = {
    dappAddress: string
    getSigner: () => Promise<Signer>
    fetch: FetchFun
}

export default function ERC1155Deposit({ getSigner, dappAddress, fetch }: ERC1155DepositProps) {
    const [erc1155address, _setErc1155Address] = useState(localStorage.getItem(`erc1155address`) ?? '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c')
    const [tokenId, setTokenId] = useState('1')
    const [value, setValue] = useState(1)

    const [batchSize, setBatchSize] = useState(2)
    const [batch, setBatch] = useState<{ tokenId: string, value: number, balance?: number }[]>([])
    const [vouchers, setVouchers] = useState<Voucher[]>([])

    function setErc1155Address(address: string) {
        _setErc1155Address(address)
        localStorage.setItem('erc1155address', address)
    }

    async function singleDeposit() {
        const signer = await getSigner()
        // you could check this address by executing `sunodo run --verbose`
        const portalAddress = '0x7CFB0193Ca87eB6e48056885E026552c3A941FC4'
        const contract = IERC1155__factory.connect(erc1155address, signer)
        const portal = ERC1155SinglePortal__factory.connect(portalAddress, signer)
        const approve = await contract.setApprovalForAll(portalAddress, true)
        console.log('approve', approve)
        const tx = await portal.depositSingleERC1155Token(erc1155address, dappAddress, tokenId, value, '0x', '0x')
        console.log('tx', tx)
    }

    async function batchDeposit() {
        const signer = await getSigner()
        // you could check this address by executing `sunodo run --verbose`
        // const userAddress = await signer.getAddress()
        const portalAddress = '0xedB53860A6B52bbb7561Ad596416ee9965B055Aa'
        const contract = IERC1155__factory.connect(erc1155address, signer)
        const approve = await contract.setApprovalForAll(portalAddress, true)
        console.log('approve', approve)

        const portal = ERC1155BatchPortal__factory.connect(portalAddress, signer)
        const tx = await portal.depositBatchERC1155Token(erc1155address, dappAddress, batch.map(b => BigInt(b.tokenId)), batch.map(b => BigInt(b.value)), '0x', '0x')
        console.log('tx', tx)
    }

    async function batchWithdraw() {
        const signer = await getSigner()
        const signerAddress = await signer.getAddress()
        const res = await fetch(`http://127.0.0.1:8383/wallet/${signerAddress}/erc-1155/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: erc1155address,
                address: signerAddress,
                tokenIds: batch.map(item => +item.tokenId),
                values: batch.map(item => item.value)
            }),
            signer: await getSigner()
        })
        if (!res.ok) {
            console.log(res.status, res.text())
            return
        }
        const json = await res.json()
        console.log(json)
    }

    function updateBatchSize(newSize: number) {
        setBatchSize(newSize)
        const newBatch = batch.slice(0, newSize)
        for (let i = newBatch.length; i < newSize; i++) {
            newBatch.push({
                tokenId: `${i}`,
                value: 1
            })
        }
        loadBalances(newBatch)
    }

    async function loadBalances(batch: { tokenId: string; value: number; balance?: number }[]) {
        const signer = await getSigner()
        // you could check this address by executing `sunodo run --verbose`
        const userAddress = await signer.getAddress()
        // const userAddress = '0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C'
        const contract = IERC1155__factory.connect(erc1155address, signer)
        const balances = await contract.balanceOfBatch(batch.map(() => userAddress), batch.map(b => b.tokenId))
        balances.forEach((b, i) => {
            batch[i].balance = b.toString()
        })
        setBatch(batch)
    }
    

    async function init() {
        const res = await VoucherService.findAll()
        const vouchers = res.data.vouchers.edges.map((e: any) => e.node)
        console.log(vouchers)
        setVouchers(vouchers)
    }

    useEffect(() => {
        init()
    }, [])

    /*
     | 0xF5B2d8c81cDE4D6238bBf20D3D77DB37df13f735 Bitmask
     | 0xB634F716BEd5Dd5A2b9a91C92474C499e50Cb27D CartesiMathV2
     | 0x33436035441927Df1a73FE3AAC5906854632e53d MerkleV2
     | 0x3F8FdcD1B0F421D817BF58C96b7C91B98100B450 UnrolledCordic
     | 0x59b22D57D4f067708AB0c00552767405926dc768 InputBox
     | 0xFfdbe43d4c855BF7e0f105c400A50857f53AB044 EtherPortal
     | 0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB ERC20Portal
     | 0x237F8DD094C0e47f4236f12b4Fa01d6Dae89fb87 ERC721Portal
     | 0x7CFB0193Ca87eB6e48056885E026552c3A941FC4 ERC1155SinglePortal
     | 0xedB53860A6B52bbb7561Ad596416ee9965B055Aa ERC1155BatchPortal
     | 0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE DAppAddressRelay
     | 0x7122cd1221C20892234186facfE8615e6743Ab02 CartesiDAppFactory
     | 0x5050F233F2312B1636eb7CF6c7876D9cC6ac4785 Authority
     | 0x4FF8BD9122b7D91d56Dd5c88FE6891Fb3c0b5281 History
     | 0xae7f61eCf06C65405560166b259C54031428A9C4 SunodoToken
     | 0x519421Bd7843e0D1E2F280490962850e31c86087 AuthorityFactory
     | 0x5314730B6285B9B026FAaD759aa39A9415eB874c PayableDAppSystem
     */
    async function executeVoucher(voucher: Voucher) {
        const address = '0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C'
        const signer = await getSigner()
        const cartesiDApp = CartesiDApp__factory.connect(address, signer)
        // cartesiDApp.addListener('VoucherExecuted', (...args) => {
        //     console.log('VoucherExecuted', args)
        // })
        const executed = await cartesiDApp.wasVoucherExecuted(voucher.input.index, voucher.index)
        if (executed) {
            console.log('Voucher was executed!!!')
        } else {
            console.log('executing voucher...')
            const tx = await cartesiDApp.executeVoucher(voucher.destination, voucher.payload, voucher.proof)
            console.log(tx)
            const res = await (tx as any).wait()
            console.log('Executed!', res)
        }
    }

    useEffect(() => updateBatchSize(batchSize), [])

    return (
        <div style={{ textAlign: 'left' }}>
            <h2>ERC-1155</h2>
            <h3>Single Deposit</h3>
            Token address: <input value={erc1155address} onChange={(e) => setErc1155Address(e.target.value)} /><br />
            Token ID: <input value={tokenId} onChange={(e) => setTokenId(e.target.value)} /><br />
            Value: <input value={value} onChange={(e) => setValue(+e.target.value)} /><br />
            <button onClick={singleDeposit}>Deposit</button>
            <h3>Batch Deposit</h3>
            Token address: <input value={erc1155address} onChange={(e) => setErc1155Address(e.target.value)} /><br />
            Batch size: <input value={batchSize} type="number" onChange={(e) => {
                updateBatchSize(+e.target.value)
            }} /><br />
            {batch.map((item, i) => {
                return (
                    <div key={`${i}`} style={{ border: '1px solid #444', padding: '3px', marginTop: '3px' }}>
                        Token ID: <input value={item.tokenId} onChange={(e) => {
                            batch[i].tokenId = e.target.value;
                            loadBalances([...batch])
                        }} /><br />
                        Value: <input value={item.value} onChange={(e) => {
                            batch[i].value = +e.target.value;
                            setBatch([...batch])
                        }} /><br />
                        Balance: {batch[i].balance ?? "0"}<br />
                    </div>
                )
            })}
            <button onClick={batchDeposit}>Deposit</button>

            <button onClick={batchWithdraw}>Withdraw</button>

            <h3>Vouchers</h3>
            {vouchers.map((voucher, i) => {
                return (
                    <div key={`${i}`}>
                        {voucher.destination}
                        <button onClick={async () => {
                            await executeVoucher(voucher)
                        }}>Execute</button>
                    </div>
                )
            })}
        </div>
    )
}

