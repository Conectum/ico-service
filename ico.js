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

Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

// Increases testrpc time by the passed duration in seconds
function increaseTime (duration) {
  const id = Date.now();

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1);

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id + 1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res);
      });
    });
  });
}

function invest(from, amount) {
    const ethAmount = web3.utils.toWei(amount.toString(), 'ether');
    return web3.eth.sendTransaction({to: icoContractAddress, value: ethAmount, from: from});
}

const commandLineArgs = require('command-line-args')

const optionDefinitions = [
    {
        name: 'setReference',
        multiple: true,
        description: 'Set reference'
    },
    {
        name: 'balanceOf',
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
        name: 'releaseTimelockedFor',
        description: 'Unlock timelocked tokens for a user',
        type: String
    },
    {
        name: 'incStage',
        description: 'Increase ICO stage'
    },
    {
        name: 'incTime',
        description: 'Increase block time (works only for the testrpc)'
    },
    {
        name: 'currentTime',
        description: 'Get current block timestamp'
    },
    {
        name: 'invest',
        description: 'Invest ether',
        multiple: true
    },
    {
        name: 'isActive',
        description: 'Is ICO in active stage'
    }
];

function sendICO(method, params) {
    if (process.env.NODE_ENV == 'production') {
        return web3.eth.personal.unlockAccount(owner, ownerPassword)
            .then(icoContract.methods[method].apply(null, params).send({from: owner}))
    } else {
        return icoContract.methods[method].apply(null, params).send({from: owner});
    }
}

function sendToken(method, params) {
    if (process.env.NODE_ENV == 'production') {
        return web3.eth.personal.unlockAccount(owner, ownerPassword)
            .then(tokenContract.methods[method].apply(null, params).send({from: owner}))
    } else {
        return tokenContract.methods[method].apply(null, params).send({from: owner});
    }
}

function callICO(method, params) {
    return icoContract.methods[method].apply(null, params).call();
}

function callToken(method, params) {
    return tokenContract.methods[method].apply(null, params).call();
}

function executeMethod(method, params, methods) {
    const m = methods[method];
    return m(params);
}

const methods = {
    setReference: (p) => sendICO('setReference', p),
    balanceOf: (p) => callToken('balanceOf', [p]),
    finalize: (p) => sendICO('finalize'),
    releaseVestedFor: (p) => sendToken('releaseVestedFor', [p]),
    releaseTimelockedFor: (p) => sendToken('releaseTimelockedFor', [p]),
    incStage: (p) => sendICO('incStage', p),
    incTime: (p) => increaseTime(p),
    invest: (p) => invest.apply(null, p),
    isActive: (p) => callICO('isActive', p)
};

const options = commandLineArgs(optionDefinitions);
const methodName = Object.keys(options)[0];
const params = options[methodName] || [];
executeMethod(methodName, params, methods).then(console.log).catch(console.log);
