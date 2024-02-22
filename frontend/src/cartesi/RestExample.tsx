import { FetchFun } from "@calindra/cartesify/src/cartesify/FetchLikeClient"
import { Signer } from "ethers"
import { useState } from "react"

type RestExampleProps = {
    fetch: FetchFun
    getSigner: () => Promise<Signer>
}

export function RestExample({ getSigner, fetch }: RestExampleProps) {
    const [backendResponse, setBackendResponse] = useState('')
    return (
        <div>
            <h2>REST Example</h2>
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
    )
}