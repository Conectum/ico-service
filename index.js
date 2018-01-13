var Web3 = require('web3');
var config = require('config');
var express = require("express");

var Token = require('./Token.json');

var ethNodeAddress = config.get('eth-node-address');
var tokenContractAddress = config.get('token-contract-address');
var web3 = new Web3(Web3.givenProvider || ethNodeAddress);
var tokenContract = new web3.eth.Contract(Token.abi, tokenContractAddress);

var app = express();

app.get("/", (req, res) => {
    tokenContract.methods.totalSupply().call()
        .then((supply) => {
            res.send(`<div>ICO address: ${tokenContractAddress}</div><div>Total supply: ${supply}`);
        });
});

var port = 9000;
app.listen(port);
console.log(`Listening on port ${port}`);
