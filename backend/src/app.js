console.log('starting app.js...')
const { CartesifyBackend } = require("@calindra/cartesify-backend")
const { createWallet } = require("@deroll/wallet")
let dapp, wallet

CartesifyBackend.createDapp().then(initDapp => {
    initDapp.start(() => {
        console.log('Dapp started');
    }).catch((e) => {
        console.error(e);
        process.exit(1);
    });
    dapp = initDapp

    wallet = createWallet()
    dapp.addAdvanceHandler(() => {
        console.log('before wallet handler')
        return "reject"
    })
    dapp.addAdvanceHandler(wallet.handler);
    dapp.addAdvanceHandler(() => {
        console.log('final handler')
        return "reject"
    })
})

const express = require("express")

const app = express();
const port = 8383;
app.use(express.json());

let totalAmount = 0

let games = []

app.get("/health", (req, res) => {
    res.send({ some: "response" });
});

app.get("/wallet/:address", (req, res) => {
    console.log(`Checking balance ${req.params.address}`)
    res.send({
        balance: wallet.balanceOf(req.params.address).toString()
    })
})

app.post("/wallet/:address/erc-1155/withdraw", async (req, res) => {
    const voucher = wallet.withdrawERC1155(
        req.body.token,
        req.body.address,

        // deepcode ignore HTTPSourceWithUncheckedType: doing the type validation
        req.body.tokenIds.map(id => {
            if (typeof id !== 'number') {
                throw new Error('BadRequest')
            }
            return BigInt(id)
        }),

        // deepcode ignore HTTPSourceWithUncheckedType: doing the type validation
        req.body.values.map(value => {
            if (typeof value !== 'number') {
                throw new Error('BadRequest')
            }
            return BigInt(value)
        }),
    )

    const voucherResult = await dapp.createVoucher(voucher)
    res.send({
        ok: 1, voucherResult
    })
})

app.get("/token/:tokenId/owners", (req, res) => {
    
    res.send({ owners })
})

app.get("/wallet/:address/tokens", (req, res) => {
    console.log(`Checking balance ${req.params.address}`)
    res.send({...wallet.getAllTokens(req.params.address)})
})

app.get("/wallet/:address/erc-20/:token", (req, res) => {
    console.log(`Checking balance ${req.params.address} ${req.params.token}`)
    res.send({
        balance: wallet.balanceOf(req.params.token, req.params.address).toString()
    })
})

app.get("/wallet/:address/erc-721/:token/balance", (req, res) => {
    console.log(`Checking balance ${req.params.address} ${req.params.token}`)
    res.send({
        balance: wallet.balanceOfERC721(req.params.token, req.params.address).toString()
    })
})

app.get("/wallet/:address/erc-721/:token/tokenIds", (req, res) => {
    console.log(`Checking balance ${req.params.address} ${req.params.token}`)
    res.send({
        balance: wallet.balanceOfERC721(req.params.token, req.params.address).toString()
    })
})

app.post("/new-game", async (req, res) => {
    let player1 = req.header("x-msg_sender")
    let commit1 = req.body.commit // = hash(move + nonce)
    games.push({
        player1,
        commit1
    })
    res.send({ created: games.length })
})

app.post('/deposit', (req, res) => {
    axios.post('http://deroll/voucher')
})

app.get("/", (req, res) => {
    res.send({ some: "response" });
});

app.get('/games', (req, res) => {
    console.log('hi')
    res.send({ ok: 1 })
})

app.put('/update', (req, res) => {
    res.send({ updateBody: req.body })
})

app.patch('/patch', (req, res) => {
    res.send({ patchBody: req.body })
})

app.delete('/delete', (req, res) => {
    res.send({ query: req.query })
})

app.post('/player', (req, res) => {
    const name = req.body.name
    const id = req.user.id
    res.send({ msg: "created", player: { id, name } })
})

app.post('/games', (req, res) => {
    req.body.startBid
    res.send({ msg: "game created" })
})

app.post('/hit', (req, res) => {
    // req.user.id === 'msg_sender'
    if (!Number.isNaN(+req.body.amount)) {
        totalAmount += +req.body.amount
    }
    res.send({ amount: totalAmount, myPost: req.body });
});

app.post('/echo', (req, res) => {
    res.send({ myPost: req.body });
});

app.post('/echo/headers', (req, res) => {
    res.send({ headers: req.headers });
});

app.get('/echo/headers', (req, res) => {
    res.send({ headers: req.headers });
})

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
