//const { execSync } = require('child_process');
const { execFile } = require('child_process');
const fs = require('fs');
const fsExtra = require('fs-extra')
const makeDir = require('make-dir');
const config = require('./config');
const path = require('path');
const Promise = require('promise');
const storage = require('azure-storage');
const uuidv4 = require('uuid/v4');

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

async function runMatlab(args){
    // Run reprocess
    return new Promise((resolve, reject) => {
        let file2Run = 'ReProcessTest.exe';
            execFile(file2Run, [args], (err) =>{
                if(err){
                    console.error('reprocess failed');
                    reject('err');
                }
                else{
                    console.log('reprocess done');
                    resolve('Succeed of matlab reprocessing');
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
        return Promise.resolve('Successed to upload to Cosmos');
    }
    catch(err){
        console.error(err);
        return Promise.reject('err to upload to Cosmos')
    };
}


async function deletion(dataDir){
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



module.exports = async function executeReprocess(Input, callback){
    return new Promise((resolve, reject) => {
        const AssessmentID = uuidv4();
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
                    .then(() => {
                        upload2Cosmos(AssessmentDir)
                        .then(() => {
                            fsExtra.remove(AssessmentDir,(err) =>{
                                if(err){
                                    callback(true);
                                }
                                else{
                                    callback(false);
                                }
                            })
                    })
                })
            })
        });
    });
}




