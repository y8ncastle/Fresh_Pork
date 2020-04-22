let Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;

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

// Smart Contract Address
let CA = "0xc1B15ebB2606fE7c2F6925E200A01B4bD578bC39";

// Create Contract Object
let Contract = new web3.eth.Contract(ABI, CA);

// User Address
let EOA1 = "0x05AaD52eE84B4E0F2D1737189ee7D29658686DA0";

// User Private Key
let PK = "51C7CDED83405C1E348D0C69F0EE11721A742270C56C598555288A9C825D6968";

// Call Bytecode
let setStringExec = Contract.methods.setString("Hello, I am sending Transaction");
let setStringByteCode = setStringExec.encodeABI();

const Gwei = 9;
const uint = 10 ** Gwei;
const gasLimit = 310000;
const gasPrice = 21 * uint;

web3.eth.getTransactionCount(EOA1, "pending", (err, nonce) => {
  let rawTx = {
    nonce: nonce,
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    data: setStringByteCode,
    from: EOA1,
    to: CA
  };

  let pk = new Buffer.from(PK, "hex");

  let tx = new Tx(rawTx, {'chain':'ropsten'});
  tx.sign(pk);

  let serializedTx = tx.serialize();

  web3.eth.sendSignedTransaction("0x" + serializedTx.toString("hex"), (err, txHash) => {
    console.log(err);
    console.log(txHash);
  });
});
