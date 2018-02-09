var Web3 = require('web3');
var config = require('config');
var express = require("express");

var ConectumICO = require('./contracts/ConectumICO.json');

var ethNodeAddress = config.get('eth-node-address');
var icoContractAddress = config.get('ico-contract-address');
var web3 = new Web3(Web3.givenProvider || ethNodeAddress);
var icoContract = new web3.eth.Contract(ConectumICO.abi, icoContractAddress);

var app = express();

app.get("/", (req, res) => {
    let stats = {};
    icoContract.methods.weiRaised().call()
        .then((weiRaised) => {
            stats.weiRaised = weiRaised;
            res.json(stats);
        });
});

var port = 9000;
app.listen(port);
console.log(`Listening on port ${port}`);
