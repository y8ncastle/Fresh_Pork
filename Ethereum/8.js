let Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8544'));

web3.eth.getTransaction('0x2ac203fa848858d2c72f99706a056a1df3870a63251a26b53372e6cbf51d9b54', (err, txHash) => {
  console.log(txHash);
});
