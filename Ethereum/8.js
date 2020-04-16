let Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8544'));

web3.eth.getTransaction('0x1cfa1f8b1e33fa8851fefa31e8fca7f9fdbb76ba1797504f265a9e1e6c1ad893', (err, txHash) => {
  console.log(txHash);
});
