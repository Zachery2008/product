/*
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}
*/

const fs = require('fs');
const config = require('./config');
const path = require('path');
const storage = require('azure-storage');

const blobStorageAccount = config.blobStorageAccount;
const blobAccessKey = config.blobAccessKey;

// Get a blob service
const blobService = storage.createBlobService(blobStorageAccount, blobAccessKey);

const listContainers = async () => {
    return new Promise((resolve, reject) => {
        blobService.listContainersSegmented(null, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `${data.entries.length} containers`, containers: data.entries });
            }
        });
    });
};

const createContainer = async (containerName) => {
    return new Promise((resolve, reject) => {
        blobService.createContainerIfNotExists(containerName, { publicAccessLevel: 'blob' }, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Container '${containerName}' created` });
            }
        });
    });
};

const uploadString = async (containerName, blobName, text) => {
    return new Promise((resolve, reject) => {
        blobService.createBlockBlobFromText(containerName, blobName, text, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Text "${text}" is written to blob storage` });
            }
        });
    });
};

const uploadLocalFile = async (containerName, localFilePath, blobName) => {
    return new Promise((resolve, reject) => {
        //const fullPath = path.resolve(filePath);
        //const blobName = path.basename(localFilePath);
        blobService.createBlockBlobFromLocalFile(containerName, blobName, localFilePath, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Local file "${localFilePath}" is uploaded` });
            }
        });
    });
};

const listBlobs = async (containerName) => {
    return new Promise((resolve, reject) => {
        blobService.listBlobsSegmented(containerName, null, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `${data.entries.length} blobs in '${containerName}'`, blobs: data.entries });
            }
        });
    });
};

const downloadBlob = async (containerName, blobName) => {
    const dowloadFilePath = path.resolve('./' + blobName.replace('.txt', '.downloaded.txt'));
    return new Promise((resolve, reject) => {
        blobService.getBlobToText(containerName, blobName, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Blob downloaded "${data}"`, text: data });
            }
        });
    });
};

const downloadBlobToLocal = async (containerName, blobName, localFileName) => {
    const dowloadFilePath = path.resolve('./' + blobName.replace('.txt', '.downloaded.txt'));
    return new Promise((resolve, reject) => {
        blobService.getBlobToLocalFile(containerName, blobName, localFileName, (err, result, response) => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Blob downloaded locally "${result}"`, text: response });
            }
        });
    });
};

const deleteBlob = async (containerName, blobName) => {
    return new Promise((resolve, reject) => {
        blobService.deleteBlobIfExists(containerName, blobName, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Block blob '${blobName}' deleted` });
            }
        });
    });
};

const deleteContainer = async (containerName) => {
    return new Promise((resolve, reject) => {
        blobService.deleteContainer(containerName, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Container '${containerName}' deleted` });
            }
        });
    });
};

const execute = async (blob, localFileFullPath) => {

    const containerName = "test";
    const blobName = blob + '/' + path.basename(localFileFullPath);
    console.log(blobName);
    //const content = "hello Blob SDK";
    //const localFilePath = "./readme.md";
    let response;

    //console.log("Containers:");
    response = await listContainers();
    //response.containers.forEach((container) => console.log(` -  ${container.name}`));

    const containerDoesNotExist = response.containers.findIndex((container) => container.name === containerName) === -1;

    if (containerDoesNotExist) {
        await createContainer(containerName);
        console.log(`Container "${containerName}" is created`);
    }

    /*
    folderName = './quickstart/' + blobName;
    await uploadString(containerName, folderName, content);
    console.log(`Blob "${blobName}" is uploaded`);
    */

    response = await uploadLocalFile(containerName,localFileFullPath, blobName );
    //console.log(response.message);

    
    //console.log(`Blobs in "${containerName}" container:`);
    //response = await listBlobs(containerName);
    //response.blobs.forEach((blob) => console.log(` - ${blob.name}`));

    /*
    response = await downloadBlobToLocal(containerName, folderName, blobName);
    console.log(`Downloaded blob content: ${response.text}"`);
    
    await deleteBlob(containerName, blobName);
    console.log(`Blob "${blobName}" is deleted`);

    await deleteContainer(containerName);
    console.log(`Container "${containerName}" is deleted`);
    */
}


uuid = 'StandardTests';
var dataDir = './../' + uuid + '/';


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

        // exclude folders
        if (isFile) {
          // callback, do something with the file
          //processFile(filepath, name, ext, stat);
          execute(uuid, filepath).then(() => console.log("Done")).catch((e) => console.log(e));
        }
      });
    });
  });

//execute().then(() => console.log("Done")).catch((e) => console.log(e));
