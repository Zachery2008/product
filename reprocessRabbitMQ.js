const { execSync } = require('child_process');
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


// Download blob to local files
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

async function listAndDownloadBlobs(containerName, filePrefix, localDir){
    return new Promise((resolve, reject) => {
        blobService.listBlobsSegmentedWithPrefix(containerName, filePrefix, undefined, async function(err, data) {
            // Loop through the directory and download to local folder 

            await Promise.all(data.entries.map(function(datafile) {
                let localFileName = localDir + datafile.name.slice(36);
                console.log(datafile.name.slice(36));
                return downloadBlobToLocal(containerName, datafile.name, localFileName).then(function(){
                });
            }))

            if (err) {
                reject(err);
            } else {
                resolve({ message: `${data.entries.length} blobs in '${containerName}'`, blobs: data.entries }); 
            }
        });
    });
}

async function downloadBlob(containerName, filePrefix, localDir){
    // Download dca 
    await listAndDownloadBlobs(containerName, filePrefix, localDir); 

    // Download company's motion threshold
    //var prefix_company = Company;
    //await listAndDownloadBlobs(containerName, prefix_company);
}

async function runMatlab(Command, DcaID, CompanyID){
    //var CalibDate = '1904022205';
    var file2Run = 'ReProcessTest.exe';
    var INPUT = Command + ' ' + DcaID + ' ' + CompanyID;
    var file2Run1 = 'ReProcessTest.exe' + ' ' + INPUT;
    console.log(file2Run1);

    // Check Calibration.mat as a proof of file existence
    let CalibrationDir = './../' + DcaID + '/Calibration.mat';
    var calibPath = path.resolve(CalibrationDir);
    // execSync(file2Run, {input: INPUT});
    // Run reprocess

    if(fs.existsSync(calibPath)){
        execSync(file2Run1);
        console.log('reprocess done');
        Promise.resolve('OK');
        }
    else{
        console.error('reprocess failed, dca files do not exist.');
        Promise.reject('err');
        }
}
    //execSync(file2Run ,{cwd: './Senz/System/ErgoSenz-Analytics-Matlab/', input: INPUT});



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


    insertAssessment().catch(err => {
        console.error(err);
    });
}


const deletion = async(DcaDir, CompanyDir)=>{
    async function deleteLocalFile(dataDir){
        fs.readdir(dataDir, (error, fileNames) => {
            if (error) throw error;

            fileNames.forEach(filename => {
                // get current file name
                const name = path.parse(filename).name;
                // get current file extension
                const ext = path.parse(filename).ext;
                // get current file path
                const filepath = path.resolve(dataDir, filename);
            
                // get information about the file
                fs.stat(filepath, function(error, stat) {
                    if (error) throw error;
        
                    // check if the current path is a file or a folder
                    const isFile = stat.isFile();  
                    console.log(isFile); 
                    console.log(filepath);
                    
                    if (isFile) {
                    // callback, do something with the file
                    //processFile(filepath, name, ext, stat);
                    fs.unlinkSync(filepath);
                    }
                });
                
            });
        });
    }

    deleteLocalFile(DcaDir);
    deleteLocalFile(CompanyDir);
}


module.exports = async function executeReprocess(Input){
    const containerName = Input.containerName;
    const CompanyID = Input.companyID;
    const DcaID = Input.dcaID;
    const Command = Input.command;
    const AssessmentID = Input.assessmentID; 

    // Make folder for assessment
    //const CompanyDir = './../' + DcaID.slice(0,16) + companyID.slice(16);
    const AssessmentDir = path.resolve('./../', AssessmentID);
    //makeDir(CompanyDir);
    makeDir(AssessmentDir);
    
    downloadBlob(containerName, DcaID, AssessmentDir)
        .then(() => {
            downloadBlob(containerName, CompanyID, AssessmentDir)
            .then(() => {
                runMatlab(Command, AssessmentID, AssessmentID)
                .then(() =>{
                        upload2Cosmos(AssessmentDir);
                        Promise.reject('err');
                    })
            
            /*
            .then(() => {
                deletion(DcaDir, CompanyDir)
            })
            */
        })
    });
}

/*
    downloadBlob(containerName, DcaID, CompanyID)
        .then(() => {
            runMatlab()
        })
        .then(() => upload2Cosmos())
        .catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) });
        */

//var output = executeReprocess(Input);


