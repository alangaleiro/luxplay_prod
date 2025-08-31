[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_stateView",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "_poolId",
				"type": "bytes32"
			},
			{
				"internalType": "uint8",
				"name": "_dec0",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "_dec1",
				"type": "uint8"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "decimals0",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals1",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "peekSqrtPrice",
		"outputs": [
			{
				"internalType": "uint160",
				"name": "sqrtPX96",
				"type": "uint160"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "poolId",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_poolId",
				"type": "bytes32"
			},
			{
				"internalType": "uint8",
				"name": "_dec0",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "_dec1",
				"type": "uint8"
			}
		],
		"name": "setPool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "stateView",
		"outputs": [
			{
				"internalType": "contract IStateView",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]