let Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/43ae5928e6e94d5c9d288e3e53ab9845'));

web3.eth.getBlockNumber((err, blockCount) => {
  console.log(blockCount);
});
