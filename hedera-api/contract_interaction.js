const {Client, FileCreateTransaction, ContractCreateFlow, ContractCallQuery, ContractFunctionParameters, ContractExecuteTransaction, Hbar} = require("@hashgraph/sdk");
require("dotenv").config();
const hethers = require("@hashgraph/hethers");
const {deployProxyContract, deploySenderContract, deployRecieverContract, deployNFTContract} = require("./deploy_contract.js");
const proxyAbi = require("../contracts/abi/SMPC_proxy_abi.json");
const recieverAbi = require("../contracts/abi/SMPC_reciever_abi.json");
const senderAbi = require("../contracts/abi/SMPC_sender_abi.json");
const network = "testnet";

async function main(){
    /*let contractAddress = process.env.PROXY_EVM_ADDRESS;
    setProxyListener(contractAddress);
    let recieverAddress = process.env.RECIEVER_EVM_ADDRESS;
    let data = "Hello World";
    let toChainID = 1;
    let result = await callProxyContract(recieverAddress, data, toChainID);
    */
/*
    let recieverAddress = process.env.RECIEVER_ADDRESS;
    let data = "Hello World";
    setRecieverListener(recieverAddress);

    let result = await callRecieverContract(recieverAddress, data);
*/
    
/*
    let senderAddress = process.env.SENDER_ADDRESS;
    let senderEVMAddress = process.env.SENDER_EVM_ADDRESS;
    let recieverAddress = process.env.RECIEVER_ADDRESS;
    let recieverEVMAddress = process.env.RECIEVER_EVM_ADDRESS;
    let data = "Hello World";
    let toChainID = 1;
    setSenderListener(senderEVMAddress);
    let result = await callSenderContract(senderAddress, data, toChainID, recieverEVMAddress);
*/
    let exampleJSON = {
        "FirstName": "Emily",
        "LastName": "Johnson",
        "School": "West Elementary",
        "Grade": "4",
        "Subject": "Mathematics",
        "Email": "EmilyJohnson@email.com",
        "Phone": "555-555-5562",
        "Education": "Bachelors in Mathematics, Masters in Education",
        "Experience": "11 years teaching",
        "Bio": "I am a mathematics teacher at West Elementary with 11 years of experience in education. I have a Bachelors in Mathematics and a Masters in Education. I believe in making mathematics accessible and enjoyable for all students. I strive to create a positive and engaging learning environment where every student can build their confidence and problem-solving skills."
    };


    let NFTAddress = process.env.NFT_ADDRESS;
    let NFTEVMAddress = process.env.NFT_EVM_ADDRESS;
    let accountId = process.env.MY_ACCOUNT_ID;
    let accountEVM = process.env.MY_ACCOUNT_EVM_ADDRESS;
    let tokenID = 123;
    let metaData = JSON.stringify(exampleJSON);
    //"pain";
    let result = await mintNFT(NFTAddress, accountEVM, tokenID, metaData);
    let result2 = await getNFTData(NFTAddress, tokenID);
    console.log(result2);

}

async function  callProxyContract(recieverAddress, data, toChainID){
    //grab the Account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
    
    // grab the proxy contract address
    //TODO, make it so it just pulls the proxyID from the ENV file
    const proxyID = process.env.PROXY_ADDRESS;

    //call the function
    const contractCall  = new ContractExecuteTransaction()
        .setGas(100000)
        .setContractId(proxyID)
        .setFunction("proxyCall", new ContractFunctionParameters()
            .addAddress(recieverAddress)
            .addString(data)
            .addUint256(toChainID)
        );
    
    //sign the transaction
    const submitCall = await contractCall.execute(client);

    //get the receipt
    const receipt = await submitCall.getReceipt(client);
    //const transactionId = await submitCall.getTransactionId();

    return receipt.contractId.toSolidityAddress();
    
}

async function setProxyListener(contractAddress){
    console.log("Deployed Proxy Listener");
    // set the provider
    const provider = new hethers.getDefaultProvider(network);
    // set the contract
    const contract = new hethers.Contract(contractAddress, proxyAbi, provider);

    // listen for events
    contract.once("ProxyCall", (from, message, to) => {
        console.log("ProxyCall event fired");
        console.log("from: ", from);
        console.log("message: ", message);
        console.log("to: ", to);
    });
}

async function setRecieverListener(contractAddress){
    console.log("Deployed Reciever Listener");
    // set the provider
    const provider = new hethers.getDefaultProvider(network);
    // set the contract
    const contract = new hethers.Contract(contractAddress, recieverAbi, provider);

    // listen for events
    contract.once("NewMsg", (message) => {
        console.log("NewMsg event fired");
        console.log("message: ", message);
    });
}

async function callRecieverContract(contractAddress, data){
    //grab the Account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    //call the function
    const contractCall  = new ContractExecuteTransaction()
        .setGas(100000)
        .setContractId(contractAddress)
        .setFunction("executeCall", new ContractFunctionParameters()
            .addString(data)
        );
    
    console.log("reciever called")
    
    //sign the transaction
    const submitCall = await contractCall.execute(client);

    //get the receipt
    const receipt = await submitCall.getReceipt(client);

    return receipt.contractId.toSolidityAddress();

}

async function setSenderListener(contractAddress){
    console.log("Deployed Sender Listener");
    // set the provider
    const provider = new hethers.getDefaultProvider(network);
    // set the contract
    const contract = new hethers.Contract(contractAddress, senderAbi, provider);

    // listen for events
    contract.once("NewMsg", (message) => {
        console.log("NewMsg event fired");
        console.log("message: ", message);
    });
}

async function callSenderContract(contractAddress, data, toChainID, recieverAddress){
    //grab the Account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    //call the function
    const contractCall  = new ContractExecuteTransaction()
        .setGas(100000)
        .setContractId(contractAddress)
        .setFunction("sendMsg", new ContractFunctionParameters()
            .addString(data)
            .addUint256(toChainID)
            .addAddress(recieverAddress)
        );

    //sign the transaction
    const submitCall = await contractCall.execute(client);

    //get the receipt
    const receipt = await submitCall.getReceipt(client);

    return receipt.contractId.toSolidityAddress();
}

async function mintNFT(NFTContractAddress, /* must be evm adress for reciever*/ recieverAccount, tokenID, metaData){
    //grab the Account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    //call the function
    const contractCall  = new ContractExecuteTransaction()
        .setGas(12000000)
        .setContractId(NFTContractAddress)
        .setFunction("mint", new ContractFunctionParameters()
            .addAddress(recieverAccount)
            .addUint256(tokenID)
            .addString(metaData)
        );
    
    //sign the transaction
    const submitCall = await contractCall.execute(client);

    //get the receipt
    const receipt = await submitCall.getReceipt(client);

    return receipt.contractId.toSolidityAddress();
}

async function burn(NFTContractAddress, tokenID){
    //grab the Account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    //call the function
    const contractCall  = new ContractExecuteTransaction()
        .setGas(12000000)
        .setContractId(NFTContractAddress)
        .setFunction("burn", new ContractFunctionParameters()
            .addUint256(tokenID)
        );
    
    //sign the transaction
    const submitCall = await contractCall.execute(client);

    //get the receipt
    const receipt = await submitCall.getReceipt(client);

    return receipt.contractId.toSolidityAddress();
}

async function getNFTData(NFTContractAddress, tokenID){
    //grab the Account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    //call the function
    const contractCall  = new ContractCallQuery()
        .setGas(15000000)
        .setContractId(NFTContractAddress)
        .setQueryPayment(new Hbar(1))
        .setFunction("tokenURI", new ContractFunctionParameters()
            .addUint256(tokenID)
        );

    //sign the transaction
    
    const submitCall = await contractCall.execute(client);

    //get the receipt
    const receipt = submitCall.getString(0);
    //console.log(receipt);
    return receipt;
}

main();