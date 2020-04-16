let Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8544'));

web3.eth.sendTransaction({from: '0xdb9097272bee270f6cd2ad8a96fb2ff4f4b9a5b5', to: '0xf46f0e1f3fbdbd3d61e89a4a5c429ffff3667544', value: 100}, (err, txHash) => {
  console.log(txHash);
});
