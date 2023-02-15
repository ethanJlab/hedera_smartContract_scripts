require ('dotenv').config();
const { Client, FileCreateTransaction, Hbar} = require("@hashgraph/sdk");
const {fs} = require('fs');

main();
async function main() {

    const contractBytecode = fs.readFileSync('SMPC_NFT_byte.bin');

    const fileCreateTx = new FileCreateTransaction()
        .setContents(contractBytecode)
        .setKeys([operatorKey])
        .setMaxTransactionFee(new Hbar(0.75))
        .freezeWith(client);

    const fileCreateSign = await fileCreateTx.sign(operatorKey);
    const fileCreateSubmit = await fileCreateSign.execute(client);
    const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateReceipt.fileid;

    console.log('Contract bytecode file ID: '+ bytecodeFileId.toString());
}