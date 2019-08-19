# SenzCloudCompute

Run 'npm run dev' for testing, port number is 4000. 

Http request must need parameters: 'captureID'(dcaID), 'containerName'(where blob belongs to); 
  
Optional parameters: 'startTimeIdx', 'endTimeIdx', 'command'(if no, reprocess will start from 'A'), 'companyID'(where company stores their own criteria in blob). 

Note: for 'command':

                    'T': force start with TimeSync, no user interaction
                    
                    'C': force start with CalcBodyAngle, no user interaction
                    
                    'A': force start with Analyze Motion, no user interaction
                    
                    't': force start with TimeSync, require user interaction
