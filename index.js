const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const reprocess = require('./reprocess.js');
const uuidv4 = require('uuid/v4');
const sendAssessment = require('./sendAssessment');
const fsExtra = require('fs-extra')
const send2JobQueue = require('./sender.js');
const app = express();

// Init logger
app.use(logger);
// Parse request body as JSON
app.use(express.json());    

app.get('/reprocess', function (req, res, next){
    //console.log(req.query);
    let Input = {};
    Input.containerName = req.query.containerName;
    Input.dcaID = req.query.dcaID;
    Input.companyID = req.query.companyID;
    Input.command = req.query.command;
    Input.startTimeIdx = req.query.startTimeIdx;
    Input.endTimeIdx = req.query.endTimeIdx;
    Input.assessmentID = uuidv4();

    console.log(Input);
    res.send('scheduled to process');
    reprocess(Input).then((result) => {
        console.log(result);
        sendAssessment(Input.assessmentID, Input.dcaID).then(() => {  
        });
    }, (err) => {
        console.log(err);
    });

    next();
    
});

// POST method route
app.post('/', function (req, res, next) {
    
    //res.send('POST request to the homepage');
    console.log(req.query);
    console.log(req.body);
 
    res.send('Get your post request');
    //res.send('Get your post request');
    next();
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, 'localhost', () => {
    console.log(`Server started on port ${PORT}`);
});


