const path = require('path');
const fs = require('fs');
const logger = require('./middleware/logger');
const axios = require('axios');

// Read Json file from current directory
const jsonFilePath = path.resolve('./test-json-files/', 'Summary.json');
let jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

axios({
    // Set endpoint
    url: 'http://localhost:5000',
    // request type
    method: 'post',
    // request header
    header: 'Assessment insertion request',
    // parameters
    params: {
        userID: 13123123,
        blobID: 143123124413112313,
        version: '1906a'
    },
    // request body--json file
    data: jsonData,
    // timeout
    timeout: 1000
})
    .then(res => {
        console.log(res.data);
        console.log(res.status);
    })
    .catch(err => {

    });

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