let Web3 = require('web3');
const Tx = require('ethereumjs-tx');

let web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/43ae5928e6e94d5c9d288e3e53ab9845'));

let ABI = [
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "_var1",
				"type": "string"
			}
		],
		"name": "setString",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "var1",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]

let CA = "0x1a5C6a0B6b1b206e3F36413069AAAE23A1e09e0e";

let Contract = new web3.eth.Contract(ABI, CA);

Contract.methods.var1().call().then(data => {
  console.log(data);
})
