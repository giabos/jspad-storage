const express = require('express');
const bodyParser = require('body-parser');

const { BlobServiceClient } = require('@azure/storage-blob');
const uuidv1 = require('uuid/v1');

// Retrieve the connection string for use with the application. The storage
// connection string is stored in an environment variable on the machine
// running the application called AZURE_STORAGE_CONNECTION_STRING. If the
// environment variable is created after the application is launched in a
// console or with Visual Studio, the shell or application needs to be closed
// and reloaded to take the environment variable into account.
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'jspad7b97bd40-7402-11ea-a40f-83e626882315';

const app = express();
app.use(bodyParser.text());


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS,PUT");
    next();
});


app.get('/:id', async function (req, res) {
    const blobServiceClient = await BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = await blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(req.params.id);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    res.send(await streamToString(downloadBlockBlobResponse.readableStreamBody));
});


app.post('/', async function (req, res) {
    const blobServiceClient = await BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = await blobServiceClient.getContainerClient(containerName);
    const blobName = 'jspad-' + uuidv1();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const data = req.body;
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);

    res.json({ success: true, id: blobName })
});



app.listen(process.env.port || 3000, function () {
    console.log('Example app listening on port 3000!')
});

// A helper function used to read a Node.js readable stream into a string
async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data.toString());
        });
        readableStream.on("end", () => {
            resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
    });
}