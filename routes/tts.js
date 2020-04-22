var express = require('express');
var router = express.Router();
var pdfreader = require("pdfreader");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = process.env.mongo;
 
const dbName = 'jdData';
 


router.get('/', async (req, res, next) => {
   
    var rows = {};

    new pdfreader.PdfReader().parseFileItems("./Project\ Manager\ Job\ Description\ Template.pdf", function(err,item) {
        if (!item) {
          let dataToReturn = furnishData();
          res.send(dataToReturn);
        } else if (item.text) {
          (rows[item.y] = rows[item.y] || []).push(item);
        }
      });

      function furnishData() {
        data = {};
        data.details={};
        let counter=0;
        let preHeading;
        let currentHeading;
        let currentSubHeading;
        Object.keys(rows) // => array of y-positions (type: float)
          .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
    
          .forEach(y => { 
            let rowText = "";
            let rowData = {}
    
            rows[y].forEach(value => {
              if(value.R[0].T == '%E2%80%A2' || value.R[0].T == '%E2%97%8F'){
                rowData.bulletPoint = true;
              }else{
                
                rowText = rowText+value.text
              }
    
              if(counter>1){
                if(value.R[0].TS[1] > 14.5){
                  rowData.heading=true;
                }
                if(value.R[0].TS[3] == 1){
                  rowData.italicSubHeading = true;
                }
              }
            });
    
            if(counter == 0){
              data.companyName = rowText;
            } else if (counter == 1){
              data.jobRole = rowText;
            }
            else if (rowData.heading == true){
              if(preHeading){
                rowText = preHeading+" "+rowText
                delete data.details[preHeading];
              }
              preHeading = rowText;
              data.details[rowText] = [];
              currentSubHeading=false
            }else{
              if(rowData.bulletPoint){
                if(preHeading){
                  data.details[preHeading].push(rowText);
                  currentHeading = preHeading;
                }else if(currentHeading){
                  if(currentSubHeading){
                    data.details[currentHeading][currentSubHeading].push(rowText)
    
                  }else{
                    data.details[currentHeading].push(rowText);
                  }
                }
              }else{
                if(rowData.italicSubHeading && preHeading){
                  let obj = {};
                  obj[rowText] = [];
                  data.details[preHeading] = obj;
                  currentHeading = preHeading;
                  currentSubHeading = rowText; 
                }
                else if(rowData.italicSubHeading && currentHeading){
                   currentSubHeading = rowText; 
                  data.details[currentHeading][currentSubHeading] = [];
                }
                else{
                  currentSubHeading = false; 
                  currentHeading = false;
                }
              }
              preHeading = false;
            }
            counter++;
          });
    
          return data;
      }
});

router.post('/', async (req, res, next) => {
    console.log(req.body);
    MongoClient.connect(url, function(err, client) {
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        const collection = db.collection('documents');
        collection.insertOne(req.body, function(err, result) {
            if(err){
                return res.send({message: "Mongo connection error"})
            }
            res.send({message: "Data saved to mongo"})
          });
        client.close();
      });
   
});

module.exports = router;

