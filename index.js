var Web3 = require('web3');
var config = require('config');
var express = require("express");
var bodyParser = require('body-parser');
var Database = require('better-sqlite3');
var db = new Database('ico.db');

var ConectumICO = require('./contracts/ConectumICO.json');

var ethNodeAddress = config.get('eth-node-address');
var owner = config.get('owner');
var icoContractAddress = config.get('ico-contract-address');
var web3 = new Web3(Web3.givenProvider || ethNodeAddress);
var icoContract = new web3.eth.Contract(ConectumICO.abi, icoContractAddress);

var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", (req, res) => {
    const stats = {
        "address": icoContractAddress
    };

    Promise.all(
        [
            icoContract.methods.weiRaised().call(),
            icoContract.methods.startTime().call(),
            web3.eth.getBlock('latest'),
            icoContract.methods.isActive().call()
        ]
    ).then((values) => {
        stats.weiRaised = Number(values[0]);
        stats.startTime = Number(values[1]);
        stats.currentTime = values[2].timestamp;
        stats.isActive = values[3];
        res.json(stats);
    }).catch((error) => {
        res.status(500).json({error: error.message});
    });
});

app.post("/set_reference", (req, res) => {
    const participant = req.body.participant
    const referrer = req.body.referrer
    var stmt = db.prepare('INSERT INTO log (method, status, response) VALUES (@method, @status, @response)');
    icoContract
        .methods
        .setReference(participant, referrer)
        .send({from: owner})
        .then((receipt) => {
            stmt.run({
                method: 'set_reference',
                status: 200,
                response: receipt.transactionHash
            });
            res.json({
                transactionHash: receipt.transactionHash
            });
        }).catch((error) => {
            stmt.run({
                method: 'set_reference',
                status: 500,
                response: error.message
            });
            
            res.status(500).json({error: error.message});
        });
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send({error: err.message});
})

var port = 9000;
app.listen(port);
console.log(`Listening on port ${port}`);
