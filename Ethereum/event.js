let Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/43ae5928e6e94d5c9d288e3e53ab9845'));

let ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "var1",
				"type": "string"
			}
		],
		"name": "E_SetString",
		"type": "event"
	},
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

// Smart Contract Address
let CA = "0xc1B15ebB2606fE7c2F6925E200A01B4bD578bC39";

// Create Contract Object
let Contract = new web3.eth.Contract(ABI, CA);

// Call Contract
Contract.events.E_SetString().on('data', (event) => {
  console.log('data set: ');
  console.log(event);

  console.log('data extract: ');
  console.log(event.returnValues);
});
