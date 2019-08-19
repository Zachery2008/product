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

// Reprocess port
app.route('/reprocess')
    .get(function (req, res, next){
        let Input = {};
        Input.containerName = req.query.containerName;
        Input.dcaID = req.query.dcaID;
        Input.companyID = req.query.companyID;
        Input.startTimeIdx = req.query.startTimeIdx;
        Input.endTimeIdx = req.query.endTimeIdx;
        // Generate a uuid for store local files 
        Input.assessmentID = uuidv4();
        LocalFileDir = path.resolve('../', Input.assessmentID);

        // If command is undefined, Matlab reprocess will start from Analyze Motion
        if (typeof req.query.command === 'undefined') {
            Input.command = 'A';
          }
        else {
            Input.command = req.query.command;
        }

        //res.send('scheduled to process');

        reprocess(Input).then((result) => {
            sendAssessment(Input.assessmentID, Input.dcaID).then((result) => {  
                console.log(result); 
                res.status(200).json({
                    message: result
                  })
            }).catch((err) => {
                console.error(err);
                //console.error('Failed to insert assessment to sql database');
                res.status(400).json({
                    message: 'Failed to send json file to server',
                    err: err,
                  })
            });
        }, (err) => {
            console.error(err);
            res.status(400).json({
                message: 'Matlab reprocess failed',
                err: err,
              }) 
        })
        .then(() => {
        // Clean local files
        fsExtra.remove(LocalFileDir, (err) => {
            if(err){
                console.error({message: `Have trouble when delete folder ${LocalFileDir}.`});
            }
            else{
                console.log({message: `Files have been cleaned locally for capture ${Input.dcaID}.`});
            }
        });
        
    });   
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


