const {Client, FileCreateTransaction, ContractCreateFlow, ContractCallQuery, ContractFunctionParameters, ContractExecuteTransaction} = require("@hashgraph/sdk");
require("dotenv").config();
const proxy_byte_code = require("../contracts/byteCode/SMPC_proxy_.json");
const sender_byte_code = require("../contracts/byteCode/SMPC_sender.json");
const reciever_byte_code = require("../contracts/byteCode/SMPC_reciever.json");
const NFT_byte_code = require("../contracts/byteCode/SMPC_NFT.json");

async function main(){
    const proxyAddress = await deployProxyContract();
    const senderAddress = await deploySenderContract(proxyAddress);
    const recieverAddress = await deployRecieverContract(proxyAddress);
    const NFTAddress = await deployNFTContract();
    
    console.log("Proxy Address: ", proxyAddress);
    console.log("Sender Address: ", senderAddress);
    console.log("Reciever Address: ", recieverAddress);
    console.log("NFT Address: ", NFTAddress);
}

async function deployProxyContract() {
    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // grab the bytecode
    let contractBytecode = proxy_byte_code;
    contractBytecode = contractBytecode.object;
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    // Create our connection to the Hedera network
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
    console.log("Your Hedera account ID is:", myAccountId);

    // create contract
    const contractCreate = new ContractCreateFlow()
        .setBytecode(contractBytecode)
        .setGas(100000)
        .setMaxChunks(100)
    
    //sign the transaction
    const txResponse = await contractCreate.execute(client);

    //get the receipt
    const receipt = await txResponse.getReceipt(client);


    const contractId = receipt.contractId;
    console.log("Contract file address is :", "0x" + receipt.contractId.toSolidityAddress());
    console.log("Contract file ID is:", contractId);
    console.log("Proxy contract deployed successfully!");

    return receipt.contractId.toSolidityAddress();
}

async function deploySenderContract(proxyAddress) {
    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // grab the bytecode
    let contractBytecode = sender_byte_code;
    contractBytecode = contractBytecode.object;
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    // Create our connection to the Hedera network
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
    console.log("Your Hedera account ID is:", myAccountId);

    // create contract
    const contractCreate = new ContractCreateFlow()
        .setBytecode(contractBytecode)
        .setGas(100000)
        .setMaxChunks(100)
        .setConstructorParameters(new ContractFunctionParameters().addAddress(proxyAddress))

    //sign the transaction
    const txResponse = await contractCreate.execute(client);

    //get the receipt
    const receipt = await txResponse.getReceipt(client);

    const contractId = receipt.contractId.toString();
    console.log("Contract file ID is:", contractId);
    console.log("Sender contract deployed successfully!");

    return receipt.contractId.toSolidityAddress();
}

async function deployRecieverContract(proxyAddress) {
    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // grab the bytecode
    let contractBytecode = reciever_byte_code;
    contractBytecode = contractBytecode.object;
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    // Create our connection to the Hedera network
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
    console.log("Your Hedera account ID is:", myAccountId);

    // create contract
    const contractCreate = new ContractCreateFlow()
        .setBytecode(contractBytecode)
        .setGas(100000)
        .setMaxChunks(100)
        .setConstructorParameters(new ContractFunctionParameters().addAddress(proxyAddress))

    //sign the transaction
    const txResponse = await contractCreate.execute(client);

    //get the receipt
    const receipt = await txResponse.getReceipt(client);

    const contractId = receipt.contractId.toString();
    console.log("Contract file ID is:", contractId);
    console.log("Reciever contract deployed successfully!");

    return receipt.contractId.toSolidityAddress();
}

async function deployNFTContract() {
    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // grab the bytecode
    let contractBytecode = NFT_byte_code;
    contractBytecode = contractBytecode.object;
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    // Create our connection to the Hedera network
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
    console.log("Your Hedera account ID is:", myAccountId);

    // create contract
    const contractCreate = new ContractCreateFlow()
        .setBytecode(contractBytecode)
        .setGas(15000000)
        .setMaxChunks(100)

    //sign the transaction
    const txResponse = await contractCreate.execute(client);

    //get the receipt
    const receipt = await txResponse.getReceipt(client);

    const contractId = receipt.contractId.toString();
    console.log("Contract file ID is:", contractId);
    console.log("NFT contract deployed successfully!");

    return receipt.contractId.toSolidityAddress();
}



module.exports = {
    deployProxyContract,
    deploySenderContract,
    deployRecieverContract,
    deployNFTContract
}
//main();