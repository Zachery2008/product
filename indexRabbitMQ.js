const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const reprocess = require('./reprocess.js');
const send2JobQueue = require('./sender.js');

const app = express();
const assessment = {
    "assessmentID": "StandardTests25", 
};


// Init logger
app.use(logger);
// Parse request body as JSON
app.use(express.json());    

app.get('/', function (req, res, next){
    //console.log(req.query);
    let Input = {};
    Input.containerName = req.query.containerName;
    Input.dcaID = req.query.dcaID;
    Input.companyID = req.query.companyID;
    Input.command = req.query.command;
    Input.startTimeIdx = req.query.startTimeIdx;
    Input.endTimeIdx = req.query.endTimeIdx;
    Input.priority = req.query.priority;
    console.log(Input);

    send2JobQueue(Input);
    res.send('Scheduled to process');

    
});

// POST method route
app.post('/', function (req, res, next) {
    
    //res.send('POST request to the homepage');
    console.log(req.query);
    console.log(req.body);
 
    res.send('Get your post request');
    //res.send('Get your post request');
    next();
    /*
    res.json(assessment);
    res.sendFile(fileName, function(err){
        if(err){
            next(err);
        }
        else{
            console.log('Sent:', fileName);
        }
    });
    console.log(res.body);
    */
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, 'localhost', () => {
    console.log(`Server started on port ${PORT}`);
});;

