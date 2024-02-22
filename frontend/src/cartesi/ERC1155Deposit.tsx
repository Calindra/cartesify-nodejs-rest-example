import { ERC1155BatchPortal__factory, ERC1155SinglePortal__factory, IERC1155__factory } from "@cartesi/rollups"
import { Signer } from "ethers"
import { useEffect, useState } from "react"

type ERC1155DepositProps = {
    dappAddress: string
    getSigner: () => Promise<Signer>
}

export default function ERC1155Deposit({ getSigner, dappAddress }: ERC1155DepositProps) {
    const [erc1155address, setErc1155Address] = useState('0x3Aa5ebB10DC797CAC828524e59A333d0A371443c')
    const [tokenId, setTokenId] = useState('1')
    const [value, setValue] = useState(1)

    const [batchSize, setBatchSize] = useState(2)
    const [batch, setBatch] = useState<{ tokenId: string, value: number }[]>([])

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
        console.log(await signer.getAddress())
        const portalAddress = '0xedB53860A6B52bbb7561Ad596416ee9965B055Aa'
        const contract = IERC1155__factory.connect(erc1155address, signer)
        
        const approve = await contract.setApprovalForAll(portalAddress, true)
        console.log('approve', approve)

        const portal = ERC1155BatchPortal__factory.connect(portalAddress, signer)
        const tx = await portal.depositBatchERC1155Token(erc1155address, dappAddress, batch.map(b => BigInt(b.tokenId)), batch.map(b => BigInt(b.value)), '0x', '0x')
        console.log('tx', tx)
    }

    function updateBatchSize(newSize: number) {
        setBatchSize(newSize)
        const newBatch = batch.slice(0, newSize)
        for (let i = newBatch.length; i < newSize; i++) {
            newBatch.push({
                tokenId: `${i + 1}`,
                value: 1
            })
        }
        setBatch(newBatch)
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
                            setBatch([...batch])
                        }} /><br />
                        Value: <input value={item.value} onChange={(e) => {
                            batch[i].value = +e.target.value;
                            setBatch([...batch])
                        }} /><br />
                    </div>
                )
            })}
            <button onClick={batchDeposit}>Deposit</button>
        </div>
    )
}
