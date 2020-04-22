let Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8544'));

web3.eth.getBalance('0xfb4087aa59f662e2003c6ca0371b8e7fe19cc42b', (error, balance) => {
  console.log(balance);
});
