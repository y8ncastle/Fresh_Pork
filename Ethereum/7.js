let Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8544'));

web3.eth.sendTransaction({from: '0xd4b21552e0bdfcd258b79e31f22a87140e6c531b', to: '0xdccd5d1ac54a2c1a482a563b1e5c64ba425a3f51', value: 100}, (err, txHash) => {
  console.log(txHash);
});
