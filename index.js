const { Client, FileCreateTransaction, ContractCreateFlow, ContractCallQuery, ContractFunctionParameters, ContractExecuteTransaction } = require("@hashgraph/sdk");
require("dotenv").config();
const {readFileSync} = require('fs');
const axios = require("axios");
const web3 = require("web3");
const abi = require("./contracts/byteCode/SMPC_proxy_abi.json");
const hethers = require("@hashgraph/hethers");
const { concat } = require("@hashgraph/hethers/lib/utils");

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;
    //const contractBytecode = readFileSync("contracts/byteCode/SMPC_proxy_byte.bin");
    let contractBytecode = require("./contracts/byteCode/SMPC_proxy_.json");
    contractBytecode = contractBytecode.data.bytecode.object;
    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }


    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this really easy!
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
    //console.log("tc response", txResponse)

    //get the receipt
    const receipt = await txResponse.getReceipt(client);
    const contractId = receipt.contractId.toString();
    
    //console.log("Contract file ID is:", contractId);

    //call a function
    const contractExecTx= await new ContractExecuteTransaction()
        .setGas(100000) 
        .setContractId(contractId)
        .setFunction("proxyCall", new ContractFunctionParameters()
            .addAddress("0x0000000000000000000000000000000000000000")
            .addString("Hello World")
            .addUint256(5));
    
    //submit the transaction
    const submitExecTx = await contractExecTx.execute(client);

    //get the receipt
    const receipt2 = await submitExecTx.getReceipt(client);

    //confirm the transaction
    console.log("Transaction status:", receipt2.status.toString());
    console.log("Contract ID: ", contractId);
    let contractAddress = '0x' + receipt2.contractId.toSolidityAddress();
    console.log("Contract Address is:", contractAddress);

    /*

    let events = await getEventsFromMirror(contractId);
    console.log("Events:", events);
        
    */

    // wait 10 seconds
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    //console.log(abi);
    console.log(`\nGetting event(s) from mirror`);
    console.log(`Waiting 10s to allow transaction propagation to mirror`);
    await delay(10000);

    let provider = await hethers.getDefaultProvider("testnet");
    let contract = new hethers.Contract(contractAddress, abi, provider);

    contract.once("ProxyCall", (from, message, to) => {
        console.log("Event proxyCall received");
        console.log("From: ", from);
        console.log("Message: ", message);
        console.log("to: ", to);
    });


    const contractExecTx2= await new ContractExecuteTransaction()
        .setGas(100000) 
        .setContractId(contractId)
        .setFunction("proxyCall", new ContractFunctionParameters()
            .addAddress("0x0000000000000000000000000000000000000000")
            .addString("Hello World")
            .addUint256(5));
    
    //submit the transaction
    const submitExecTx2 = await contractExecTx2.execute(client);

    //get the receipt

    const receipt3 = await submitExecTx2.getReceipt(client);

    

    return;


}
main();