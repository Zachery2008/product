//const { execSync } = require('child_process');
const { execFile } = require('child_process');
const fs = require('fs');
const makeDir = require('make-dir');
const config = require('./config');
const path = require('path');
const Promise = require('promise');
const storage = require('azure-storage');


const CosmosClient = require('@azure/cosmos').CosmosClient;


//const Input = require('./testID');
const blobStorageAccount = config.blobStorageAccount;
const blobAccessKey = config.blobAccessKey;

// Get a blob service
const blobService = storage.createBlobService(blobStorageAccount, blobAccessKey);


// Download a blob to local files
async function downloadBlobToLocal(containerName, blobName, localFileName){
    //const dowloadFilePath = path.resolve('./' + blobName.replace('.txt', '.downloaded.txt'));
    return new Promise((resolve, reject) => {
        blobService.getBlobToLocalFile(containerName, blobName, localFileName, (err, result, response) => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Blob downloaded locally "${result}"`, text: response });
            }
        });
    });
}

async function downloadBlob(containerName, filePrefix, localDir){
    return new Promise((resolve, reject) => {
        console.log('Start to download blob');
        blobService.listBlobsSegmentedWithPrefix(containerName, filePrefix, undefined, async function(err, data) {
            // Loop through the directory and download to local folder 
            if (data.entries.length === 0){
                reject({message: `There is no file for blobID ${filePrefix}` });
            }
            else {
                await Promise.all(data.entries.map(function(datafile) {
                    let localFileName = localDir + datafile.name.slice(36);
                    console.log(datafile.name.slice(36));
                    return downloadBlobToLocal(containerName, datafile.name, localFileName);
                }))

                if (err) {
                    console.error('Error occurs when downloading blobs');
                    reject(err);
                } else {
                    //resolve({ message: `${data.entries.length} blobs in '${containerName}'`, blobs: data.entries }); 
                    console.log(`Download from blob ${filePrefix} is done.`);
                    resolve({message: `Download from blob ${filePrefix} is done.`});
                }
            }
        });
    });
}

async function runMatlab(args){
    // Run reprocess
    return new Promise((resolve, reject) => {
        let file2Run = 'ReProcessTest.exe';
            execFile(file2Run, [args], (err) =>{
                if(err){
                    console.error('reprocess failed');
                    reject('Reprocess failed due to data re-analysis.');
                }
                else{
                    console.log('reprocess done');
                    resolve({message: `ReProcess has successfully done`});
                }    
            }   
            );
    });
}

async function upload2Cosmos(assessmentDir){
    // Upload json file to Cosmos db
    const endpoint = config.endpoint;
    const masterKey = config.primaryKey;

    const jsonFilePath = assessmentDir + '/Summary.json';
    console.log(jsonFilePath);

    //const partitionKey = { kind: "Hash", paths: ["/Country"] };
    const client = new CosmosClient({ endpoint, auth: { masterKey } });
    const databaseId = "test-from-matlab";
    const containerId = "test";

    // Read Json file from current directory
    let jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

    async function insertAssessment() {

        const { database} = await client.databases.createIfNotExists({id: databaseId});
        //console.log("created db");

        const { container } = await client.database(databaseId).containers.createIfNotExists({id: containerId}, { offerThroughput: 400 });
        //console.log("created collection");

        const { body } = await container.items.create(jsonData);
        console.log("Created item with content: ", body.id);
    }

    try{
        await insertAssessment();
        return Promise.resolve('Succeed to upload to Cosmos');
    }
    catch(err){
        console.error(err);
        return Promise.reject('err to upload to Cosmos')
    };
}


module.exports = async function executeReprocess(Input){
    return new Promise((resolve, reject) => {
        const AssessmentID = Input.assessmentID;
        const containerName = Input.containerName;
        const CompanyID = Input.companyID;
        const DcaID = Input.dcaID;
        const Command = Input.command;
        const StartTimeIdx = Input.startTimeIdx;
        const EndTimeIdx = Input.endTimeIdx;
        const MatlabArgs = JSON.stringify({
            "AssessmentID": AssessmentID,
            "Command": Command,
            "StartTimeIdx": StartTimeIdx,
            "EndTimeIdx": EndTimeIdx
        });
        console.log(MatlabArgs);


        // Make folder for assessment
        const AssessmentDir = path.resolve('./../', AssessmentID);
        makeDir(AssessmentDir);
        
        downloadBlob(containerName, DcaID, AssessmentDir)
        .then(() => {
            downloadBlob(containerName, CompanyID, AssessmentDir)
            .then(() => {
                runMatlab(MatlabArgs) 
                .then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                console.error('Matlab will run without company info.');
                runMatlab(MatlabArgs) 
                .then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            });
        }).catch((err) => {
            reject(err);
        });
    });
}



