let path = require('path');
const fs = require('fs');
const logger = require('./middleware/logger');
const axios = require('axios');

async function sendAssessment(AssessmentID, DcaID){
  return new Promise((resolve, reject) =>{
    // Read Json file from current directory
    const jsonFilePath = path.resolve('../', AssessmentID, 'Summary.json');
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
          resolve({message:`AssessmentID ${AssessmentID} has been sent to CosmosDB.`});
        })
        .catch(err => {
          console.error(err.response.data.issues);
          reject({message: `AssessmentID ${AssessmentID} has FAILED been sent to CosmosDB.`,
                  err: err.response.data.issues});
        });
  });
}

module.exports = sendAssessment;

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