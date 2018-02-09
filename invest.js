var Web3 = require('web3');
var config = require('config');

var ConectumICO = require('./contracts/ConectumICO.json');

var ethNodeAddress = config.get('eth-node-address');
var owner = config.get('owner');
var icoContractAddress = config.get('ico-contract-address');
var web3 = new Web3(Web3.givenProvider || ethNodeAddress);
var icoContract = new web3.eth.Contract(ConectumICO.abi, icoContractAddress);

web3
    .eth
    .sendTransaction({
        to: icoContractAddress, 
        from: owner, 
        value: web3.utils.toWei('1', 'ether')
    })
    .then(console.log)
    .catch(console.log);
