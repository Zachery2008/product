let path = require('path');
const fs = require('fs');
const logger = require('./middleware/logger');
const axios = require('axios');

const AssessmentID = '5a997abe-bb13-4dc7-8d3d-92c077698ea0';
const DcaID = '145807F3-9D2F-4699-BAEE-00332342F700';

sendAssessment(AssessmentID, DcaID)
async function sendAssessment(AssessmentID, DcaID){
  return new Promise((resolve, reject) =>{
    // Read Json file from current directory
    const jsonFilePath = process.cwd() +  '/../' + AssessmentID + '/Summary.json';
    console.log(process.cwd());
    console.log(AssessmentID);
    console.log(DcaID);
    console.log(jsonFilePath);
    let jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

    axios({
        // Set endpoint
        url: 'http://localhost:3000/reg/assessment',
        // request type
        method: 'post',
        // request header
        header: 'Assessment insertion request',
        // parameters
        params: {
            blobID: DcaID,
            AssessmentID: AssessmentID,
            version: 'v2'
        },
        // request body--json file
        data: jsonData,
        // timeout
        //timeout: 1000
    })
        .then(res => {
          console.log(res.status);
          console.log(`AssessmentID ${AssessmentID} has been sent to CosmosDB.`);
          resolve('OK');
        })
        .catch(err => {
          console.error(err.response.data.issues);
          reject(`AssessmentID ${AssessmentID} has FAILED been sent to CosmosDB.`);
        });
  });
}


/*
// parameters: userID, blobID, version 
axios.post('http://localhost:5000?userID=dawdad', jsonData)
  .then(res => {
    console.log(res.data);
  })
  .catch(error => {
    console.log(error);
  });
  */