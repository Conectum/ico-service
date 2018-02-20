var Personal = require('web3-eth-personal');
var Web3 = require('web3');
var config = require('config');

var ConectumICO = require('./contracts/ConectumICO.json');
var COMToken = require('./contracts/COMToken.json');

var ethNodeAddress = config.get('eth-node-address');
var owner = config.get('owner');
var ownerPassword = config.get('owner-password');
var icoContractAddress = config.get('ico-contract-address');
var tokenContractAddress = config.get('token-contract-address');
var web3 = new Web3(Web3.givenProvider || ethNodeAddress);
var icoContract = new web3.eth.Contract(ConectumICO.abi, icoContractAddress);
var tokenContract = new web3.eth.Contract(COMToken.abi, tokenContractAddress);

function setReference(participant, referrer) {
    web3.eth.personal.unlockAccount(owner,ownerPassword).then((response) => {
        icoContract.methods.setReference(participant, referrer).send({from: owner}).then(console.log).catch(console.log);
    }).catch(console.log);
}

function getBalanceOf(acc) {
    tokenContract.methods.balanceOf(acc).call().then(console.log).catch(console.log);
}

function finalize() {
    web3.eth.personal.unlockAccount(owner, ownerPassword).then((response) => {
        icoContract.methods.finalize().send({from: owner}).then(console.log).catch(console.log);
    }).catch(console.log);
}

function releaseVestedFor(acc) {
    web3.eth.personal.unlockAccount(owner, ownerPassword).then((response) => {
        tokenContract.methods.releaseVestedFor(acc).send({from: owner}).then(console.log).catch(console.log);
    }).catch(console.log);
}

function unclockFor(acc) {
    web3.eth.personal.unlockAccount(owner, ownerPassword).then((response) => {
        tokenContract.methods.releaseTimelockedFor(acc).send({from: owner}).then(console.log).catch(console.log);
    }).catch(console.log);
}

function incStage() {
    web3.eth.personal.unlockAccount(owner, ownerPassword).then((response) => {
        icoContract.methods.incStage().send({from: owner}).then(console.log).catch(console.log);
    }).catch(console.log);
}

const commandLineArgs = require('command-line-args')

const optionDefinitions = [
    {
        name: 'setReference',
        multiple: true,
        description: 'Set reference'
    },
    {
        name: 'getBalanceOf',
        type: String,
        description: 'Get COM token balance'
    },
    {
        name: 'finalize',
        description: 'Finalize ICO'
    },
    {
        name: 'releaseVestedFor',
        description: 'Release vested tokens for a user',
        type: String
    },
    {
        name: 'unlockFor',
        description: 'Unlock timelocked tokens for a user',
        type: String
    },
    {
        name: 'incStage',
        description: 'Increase ICO stage'
    }
];

const options = commandLineArgs(optionDefinitions)

switch (Object.keys(options)[0]) {
    case "setReference": {
        setReference(options.setReference[0], options.setReference[1]);
        break;
    }
    case "getBalanceOf": {
        getBalanceOf(options.getBalanceOf);
        break;
    }
    case "finalize": {
        finalize();
        break;
    }
    case "releaseVestedFor": {
        releaseVestedFor(options.releaseVestedFor[0]);
        break;
    }
    case "unclockFor": {
        unlockFor(options.unclockFor[0]);
        break;
    }
    case "incStage": {
        incStage();
        break;
    }
}
