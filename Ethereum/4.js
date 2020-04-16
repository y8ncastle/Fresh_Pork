let Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8544'));

web3.eth.getBalance('0xf46f0e1f3fbdbd3d61e89a4a5c429ffff3667544', (error, balance) => {
  console.log(balance);
});
