// ************************************************************************************
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
//
//                 #TROLLBLOCKNET REPORTING SYSTEM BACKEND VERSION 1.5
//  
//                           AUTHOR: @TROLLBLOCKNET (Twitter)
//        
//                        Read the README.md file for details
//
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
// ************************************************************************************


// ************************************************************************************
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
//
//                                       GLOBALS
//
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
// ************************************************************************************


// ************************************************************************************

//                                       REQUIRES

// ************************************************************************************

const amqp = require('amqplib');
var Twitter = require('twitter'); 


// ************************************************************************************

//                                         VARS

// ************************************************************************************

var tw_userID = "NULL";
var tweetID = "NULL";
var list = "NULL";
var comments = "NULL";
var currentItem = "NULL";

// ************************************************************************************
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
//
//                                         MAIN
//
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
// ************************************************************************************


// ************************************************************************************

//                                     DATABASE INIT

// ************************************************************************************

// server.js
// where this node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var dbApp = express();
dbApp.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
dbApp.use(express.static('public'));

// init sqlite db
var fs = require('fs');
//var dbFile = './.data/tbn_reports2.db';
var dbFile = './.data/tbn_reports9.db';
var exists = fs.existsSync(dbFile); 
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Reports (tw_userID TEXT, tweetID TEXT, list TEXT, comments TEXT, PRIMARY KEY (tweetID))');
    log('New table "Reports" created!');
    
    db.run('CREATE TABLE Trolls (tw_userID TEXT, PRIMARY KEY (tw_userID))');
    log('New table "Trolls" created!');
    
    db.run('CREATE TABLE Regim (tw_userID TEXT, PRIMARY KEY (tw_userID))');
    log('New table "Regim" created!');
    
    db.run('CREATE TABLE IBEX (tw_userID TEXT, PRIMARY KEY (tw_userID))');
    log('New table "IBEX" created!');
    
  }
  else {
    log('[tbc.sqlite] : Database "tbc-reports" ready to go!');
  }
});


// ************************************************************************************

//                                     RENDER HTML 

// ************************************************************************************


// http://expressjs.com/en/starter/basic-routing.html
dbApp.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
dbApp.get('/getReports', function(request, response) {
  
      
// ---------------------------------------------------

//         TWITTER IMPORT & DB UPDATE EVERY 
//            TIME A GET REQUEST IS MADE 

// ---------------------------------------------------
    
  
    //-------------- @TROLLBLOCKCHAIN -----------------

    var client = new Twitter({
      consumer_key: process.env.TROLLBLOCKCHAIN_TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TROLLBLOCKCHAIN_TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TROLLBLOCKCHAIN_TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TROLLBLOCKCHAIN_TWITTER_ACCESS_TOKEN_SECRET
    });
    var dbTable = "Trolls"
    retrieveTwitterBlocksAndUpdateDB(client,dbTable); // --> ADAPT WITH PARAMETERS TO MAKE CALLS TO THE OTHER API'S
       
    
    //-------------- @XUSMABLOCKNET -----------------
  
  
    var client = new Twitter({
      consumer_key: process.env.XUSMABLOCKNET_TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.XUSMABLOCKNET_TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.XUSMABLOCKNET_TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.XUSMABLOCKNET_TWITTER_ACCESS_TOKEN_SECRET
    });
    dbTable = "Regim";
    retrieveTwitterBlocksAndUpdateDB(client,dbTable); // --> ADAPT WITH PARAMETERS TO MAKE CALLS TO THE OTHER API'S
  
  
    
    //-------------- @IBEXBLOCKNET -----------------


      var client = new Twitter({
      consumer_key: process.env.IBEXBLOCKNET_TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.IBEXBLOCKNET_TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.IBEXBLOCKNET_TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.IBEXBLOCKNET_TWITTER_ACCESS_TOKEN_SECRET
    });
    dbTable = "IBEX";
    retrieveTwitterBlocksAndUpdateDB(client,dbTable); // --> ADAPT WITH PARAMETERS TO MAKE CALLS TO THE OTHER API'S 
  

// ---------------------------------------------------

//                 PERFORM DB QUERY

// ---------------------------------------------------
    
    
  let dbQuery = "SELECT * FROM Reports WHERE NOT EXISTS "+
                        "(SELECT tw_userID FROM Trolls WHERE Reports.tw_userID = Trolls.tw_userID "+
				                 "UNION "+
				                 "SELECT tw_userID FROM Regim WHERE Reports.tw_userID = Regim.tw_userID "+
				                 "UNION "+
				                 "SELECT tw_userID FROM Ibex WHERE Reports.tw_userID = Ibex.tw_userID)";
  
  //intersect 1 & 2
  
  db.all(dbQuery, function(err, rows) {
    if (err) { log(console.error(err)) }
    response.send(JSON.stringify(rows));
  });
});

// listen for requests :)
var listener = dbApp.listen(process.env.PORT, function() {
  log('[tbc.sqlite] : db app is listening on port ' + listener.address().port + '....');
});


// ************************************************************************************

//            RETRIEVE MESSAGES FROM CLOUDAMQP QUEUE AND STORE IN DB

// ************************************************************************************


let channel = null;
const rabbitUrl = process.env.RABBITURL;
const rabbitQueue = process.env.RABBITQUEUE;

const getvalue = (regex, string) => {
  const match = regex.exec(string);
  return match ? match.pop() : null;
};

const connect = async () => {
  const connection = await amqp.connect(`${rabbitUrl}`);
  channel = await connection.createChannel();
  await channel.prefetch(2);
  await channel.assertQueue(rabbitQueue);

  channel.consume(rabbitQueue, msg => {
    const message = msg.content.toString();
    log("[tbc.amqplib] : Message Received --> "+message);    
    
// ************************************************************************************

//              PARSE AMQP MESSAGE AND INSERT ROW IN REPORTS DB TABLE

// ************************************************************************************
    
    //DISECT MESSAGE IN 4 VARIABLES 
    var disectedMessage = message.toString().split(";");
    
    tw_userID = disectedMessage[0];
    tweetID = disectedMessage[1];
    list = disectedMessage[2];
    comments = disectedMessage[3];
      
    //INSERT DISECTED MESSAGE VARIABLES, TWITTER USER ID & POST DATA RECEIVED IN A NEW DB ROW
    db.serialize(function() {
      
      db.run('INSERT INTO Reports (tw_userID,tweetID,list,comments) VALUES (?,?,?,?)',tw_userID,tweetID,list,comments,function(err){
        if(err){  
          let logEntry ='[tbc.sqlite] : ERROR! : '+ err.message+' --> '+tweetID;
          
          return log(logEntry); }
        log(`[tbc.sqlite] : Rows inserted in Reports Table -> ${this.changes}`);
      });
    });
    
    
// ************************************************************************************

//                             CLOSE RABBITAMQP CONNECTION

// ************************************************************************************
      

    fakeApi(message)
      .then(response => {
        channel.ack(msg);
        log("[tbc.amqplib] : Ack is done "+message);
      })
      .catch(error => {
        log(console.error("[tbc.amqplib] : fakeApi", { error, message }));
      });
  });

  channel.on("error", error => {
    log(console.error("[tbc.amqplib] : connection error", error));
  });

  channel.on("close", () => {
    const retryTimeoutMs = 30000;
    log(console.info(`[tbc.amqplib] : connection closed, retrying in ${retryTimeoutMs / 1000}s...`));
    setTimeout(connect, retryTimeoutMs);
  });
};

const disconnect = async () => {
  await channel.close();
};

const fakeApi = async msg => {
  await sleep(1)
};

const sleep = s =>
  new Promise(res => {
    setTimeout(res, s * 1000);
  });

module.exports = {
  connect,
  disconnect,
};


// ************************************************************************************
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
//
//                                     THE END
//
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
// ************************************************************************************

  
  
// ************************************************************************************

//                                    FUNCTIONS

// ************************************************************************************


// ---------------------------------------------------
// Function: 
// Description:
// Input:
// Output: N/A
// ---------------------------------------------------

function retrieveTwitterBlocksAndUpdateDB(client,table){
  
  // IMPORT TWITTER BLOCKED PROFILES INTO INTO DB 
  
  client.get('/blocks/ids.json?stringify_ids=true&cursor=-1', function(error, profiles, response) {
  if(error) {
    //throw error  
    //let logEntry = "[tbc.twitter] : ERROR! : "+error.message;
    //log(logEntry);
    return console.error(error);
     
  }else{
    log('[tbc.twitter] : '+table+' blocked profiles list received' );
  };
  
  updateBlockedTable(profiles.ids,table); 
    
  updateCSV(profiles.ids,table);
   
   return;
  //console.log(response);  // Raw response object.
  
});
  
  
// ---------------------------------------------------
// Function:
// Description:
// Input:
// Output:
// ---------------------------------------------------
  
function updateBlockedTable(ids,table) { 
    
    let i;
    var n = 0;
    let sql = 'INSERT INTO '+table+' (tw_userID) VALUES (?)';
    for (i=0;i<=ids.length;i++)
    {   
      //INSERT ROW 
      db.serialize(function() {
        db.run(sql,ids[i], function(err) {
          if (err) {
            //return console.error(err.message);
            //return; 
          } else {
          n++;
          
          }  
        }          
        );       
      });         
    }
    log('[tbc.sqlite] : New ' +table+ ' rows inserted -> ' + n); 
    log('[tbc.sqlite] : Total ' +table+ ' (profiles) blocked -> ' + ids.length); 
  return;
  }  
}


// ---------------------------------------------------
// Function:
// Description:
// Input:
// Output:
// ---------------------------------------------------

function updateCSV(ids,fileName){
  
  var fs = require('fs');
  var wstream = fs.createWriteStream('./public/'+fileName+'.csv');
  let i;
  for (i=0;i<ids.length;i++)
  {
    wstream.write(ids[i]+'\n');
  }
  wstream.end();
}


// ---------------------------------------------------
// Function: timestamp()
// Description: gets the system's current date and returns a formatted timestamp string --> [HH:MM:SS dd:mm:yy]
// Input: N/A
// Output: String --> formatted 
// ---------------------------------------------------

function timestamp(){
  //return "dd/mm/yy-hh:MM"; 
  
process.env.TZ = 'Europe/Madrid';   
var date = new Date();
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();
var H = date.getHours();
var M = date.getMinutes();

var timestamp = new String();
      
timestamp = H+':'+M+' '+d+'/'+m+'/'+y;
  
  return timestamp;
}

// ---------------------------------------------------
// Function: log(String)
// Description: Shows a log event in the server log console and saves it in /app/.data/console.log with current timestamp
// Input: String --> Console message
// Output: N/A
// ---------------------------------------------------

function log(message){
  
  var fs = require('fs');
  const path = './.data/console.log';
  let exists = fs.existsSync(path);
  var output;
  //if file ./data/console.log does not exist
  if (fs.existsSync(path) == false){
    fs.writeFile(path, timestamp()+' : '+message+'\n', (err) => {
    if (err) throw err;
    console.log(message);
    });
  } else { 
  //if it does   
    fs.appendFile(path, timestamp()+' : '+message+'\n', (err) => {
    if (err) throw err;
    console.log(message); 
    });
  }
  return;
} 