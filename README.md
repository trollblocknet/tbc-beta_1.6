# TBC: Trollblock Network Core (Backend Engine)

🗨️ TrollBlockChain DAAP - Trolls Distributed Ledger / DB (BlockChain Implementation) - @trollblocknet

🗨️ Current version: tbc-beta_1.5

🔫 App triggered by: cron-job.org --> "TrollBlockNet Core Backend - empty rabbitmq queue every 15 mins"

ALARM CREATED IN CRON-JOB.ORG: IT TRIGGERS THE SERVER LISTENERS TO EMPTY THE RABBITAMQ QUEUE ONCE EVERY 15 MINUTES. AFTER 5 MINS OF INACTIVITY, THE SERVER GETS IN EVERGY SAVING MODE AGAIN, SO THERE ARE 10 MINS OF ENERGY SAVING MODE EVERY 15 MINS WHEN THERE IS NO ACTIVITY. (WAKING UP THE SERVER IS NEEDED BECAUSE IF THE CLOUDAMQ SERVER REBOOTS FOR AN INSTANT FOR MAINTENANCE, ETC, THE QUEUE IS LOST, SO IT'S BETTER TO NOT TO LEAVE DATA IN THE QUEUE FOR LONG PERIODS OF TIME).

🌐 App Hosted at: <https://tbc-beta-15.glitch.com> pending migrate to (redir or embed) --> <http://trollblocknet.cat/reports/>

🌐 Project Git-Hub: <https://github.com/trollblocknet/tbc-beta_1.5>

## Disclaimer:

I'm not quite experienced in node.js programming (actually this one's my very first time using it in a project). To get in track and start getting used to it, I just tried to join or "remix" together two different very basic projects in glitch.com; one that implements "ampqlib" ([rabbit-amqplib](https://glitch.com/~rabbit-amqplib)) and takes care of retrieving data from a rabbitmq queue service, and a second one ([field-acrylic](https://glitch.com/~field-acrylic)) that takes this data and stores it in a sqlite db file, as well as displaying all the DB contents in an html webpage. 

## What's already done:

The file rabbit.js (from the rabbit-amqplib example) has been renamed to server.js and the contents of the former server.js (from the field-acrylic example) has been integrated into the new one. Then, the index.html file has been adapted and the below function in the current client.js:

```javascript
// iterate through every report and add it to our page

reports.forEach(function (row) { 
  rows[contador] = row.tw_userID + ";" 
    + "<a href=https://www.twitter.com/userid/status/" + row.tweetID + ">" + row.tweetID + "</a>" + ";"
    + row.list + ";"
    + row.comments; 
  appendNewreport(rows);   
});
```
  
has been added, replacing the "forEach" function that iterates the table rows in the original client.js. Finally, some clean-up of unused functions has been done in client.js.

## Project Structure:

**public/IBEX.csv   ->** IBEX35 blocked profiles list. Gets updated directly from twitter's @ibexblocknet account blocks list once every 15 mins or when tbc-beta-15.glitch.com is rendered 

**public/Regim.csv  ->** Regim78 blocked profiles list. Gets updated directly from twitter's @xusmablocknet account blocks list once every 15 mins or when tbc-beta-15.glitch.com is rendered 

**public/Trolls.csv ->** Trolls blocked profiles list. Gets updated directly from twitter's @trollblocknet account blocks list once every 15 mins or when tbc-beta-15.glitch.com is rendered 

**public/client.js  ->** troll reports dynamic html table functions

**public/style.css  ->** Styles (just a basic quick-start template used here, We will implement first the program logic by now)

**views/index.html  ->**  Renders the troll reports table:

- There is an sql filter enabled in server.js (function -> xxx ) to show only the twitter users that are not yet blocked in one of the lists. Repeates reports are logged and discarded (sql unique constraint).

**.env        -->** cloudamqp auth. url + sqlite secrets + twitter API keys

**README.md   -->** This file

**apps.js     -->** amqplib server listener & main program

**package.son -->** Dependencies (npm node.js packages): 
  
    - amqplib
    - sqlite
    - twitter   
    
**server.js    ->** Server listeners and backend tasks:

    - sqlite server listener
    - twitter REST API calls (to DB & CSV)
    - console logging in fs

## Program Architecture:

-----------------------------------------------------------

## Goals for Beta 1 <---> Cloudamqp consumer app : amqplib + sqlite + basic report management system

-----------------------------------------------------------

### tbc-beta_1.0 (node.js server based, not-distributed app)

✅ Retrieve amqp message (report) sent by tba-android, tba-ios & tba-chrome from cloudamqp queue using the node.js amqplib. 

✅ Store data in a local file db using the node.js sqlitedb.

#### 🔴 TO-DO List for beta_1.0: ####

##### ✅ 1.0_1: Render the Sqlite3 "Reports" table rows in an html ordered list \<ol> #####

⚠️ **Issue #0:** All the rows are rendered properly in html but there is something wrong, since the last field of every row displays the value "undefined" instead of the data contained on the "comments" column of the db table "reports" **--> SOLVED (There was a typo in the foreach function)**

##### ✅ 1.0_2: make tw_userID the key column in table db #####

Modify CREATE TABLE sentence in server.js

##### ✅ 1.0_3: Retrieve the tw_userID field BEFORE inserting amqp message fields into db #####

if the tweeter_id already exists in the db, Show message in console and abort insert

-----------------------------------------------------------

### tbc-beta_1.1 to 1.4 (node.js server based, not-distributed app)

✅ Create a management system for the agents that perform the blocking tasks so they have one place to check all the troll reports made from the Mobile App. The system will work as follows; there will be a backend connection to the twitter API, therefore, once one agent blocks one troll from the list and refreshes the html page, the backend will retrieve the updated list of blocks (all lists), will compare it with the reports that have been received, and finally, an sql query will filter the results to show only the accounts that still haven't been blocked (for any of the lists that we manage). The system will work in real time, but we have to consider that one agent can only refresh 15 times the management page every 15 minutes (Twitter standard API new 2018 constraints). Anyway, this shall suffice, since there is only one agent managing the lists right now, and the next expansion will be one agent per list, so it still will suffice.

⚠️ **[Issue #1:](https://github.com/trollblocknet/tbc-beta_1.5/issues/5#issue-405933272)** 
client.js -> html reports dynamic table erratic behaviour (does not always render)

#### 🔴 TO-DO List for beta_1.1: ####

##### ✅ 1.1_1: Render the Sqlite3 "Reports" table rows in an html table #####

Try-out the commented code in "notes" section of client.js --> See Open Issue #001 (table renders randomly depending on network traffic) 

#### 🔴 TO-DO List for beta_1.2: ####

##### ✅ 1.2_1: Retrieve blocked accounts list from the csv in github  and update the rows in the sqlite table that have been already blocked in real time

DEPRECATED <-> Create an script to update it every hour  from @trollblockchain blocked accounts using the twitter api and update the "alreadyBlocked?" boolean field in the sqlite db. The goal is to show a ✅ image in the rendered html for the reports that have already been processed without having to update it manually in the db (this will enable some sort of primitive tracking for the twitter troll reporting system) --> **This will be very useful in order to keep track of the reports that have been already processed

#### 🔴 TO-DO List for beta_1.3: ####

##### ✅ 1.3_1: Create new tables in BD for each list (by the moment, we only store the tw_userID)

##### ✅ 1.3_2: Apply basic CSS styles to the rendered html tables

#### 🔴 TO-DO List for beta_1.4: ####

##### ✅ 1.4_1: Upgrade to-do 1.2_1 --> Instead of retrieving from the github CSV's, retrieve block list directly from twitter using standard API 

-----------------------------------------------------------

### tbc-beta_1.5 (node.js server based, not-distributed app)

✅ Replace the CSV's system for an automated new one

#### 🔴 TO-DO List for beta_1.5: ####

##### ✅ 1.5_1: Store the blocked lists retrieved for twitter in a csv file (use fs lib)

Do it in glitch and then make a redirection from trollblocknet.cat to them. This will deprecate the CSV's from github, so they won't need to be updated manually anymore (which was a pain in the ass by the way) 

##### 🕝 1.5_2: Store console logs in a file (create new one weekly or monthly)

Done, but the "monthly new logs" feature is still not implemented. 

##### ✅ 1.5_3: Add timestamp to logs and improve formatting

-----------------------------------------------------------

### tbc-beta_1.6 (node.js server based, not-distributed app)

🕝 Improve current reporting management (more data and styles) and list table

#### 🔴 TO-DO List for beta_1.6: ####

##### 🕝 1.6_1: Parse the tw-handler from App in the amqp message and include it in the reports table (create column)
##### 🕝 1.6_2: Add timestamp to reports table and insert it from current time (javascript like it in the trollblockbot glitch project)
##### 🕝 1.6_3: Add totals to reports lists and show message when there are no rows to display
##### 🕝 1.6_4: Make reports list rows to render in different colors depending on the selected list
##### 🕝 1.6_5: Table reports render: Order by list, timestamp
##### 🕝 1.6_6: migrate client.js to trollblocknet.cat and render table there with proper css styles
##### 🕝 1.6_7: Show amount of blocked accounts and timestamp of last update in lists table (both subsc. & csv)
##### 🕝 1.6_8: Show console log in client html (expandable in footer)

-----------------------------------------------------------

## Goals for Beta 2 <---> turn basic report management system into a semi-automated t administation interface - colective voting system between "manually trusted" peers (the ones added manually to the app whitelist)

-----------------------------------------------------------

### tbc-beta_2.0 (Decentralized / distributed dApp)

First approach to voting systems over p2p

#### 🔴 TO-DO List for beta_2.0: ####

##### 🕝 2.0_1: Implement basic voting systems over the html interface. 

The results of voting will trigger a block user action in the account @trollblockchain, which will be synced with the @trollblockchain block list through blocktogether.org subscriptions (in v_1.0 this step is done manually) 

-----------------------------------------------------------

### tbc-beta_2.1  (Decentralized / distributed dApp) 

First approach to blockchain. Implement p2p network without certificates

#### 🔴 TO-DO List for beta_2.1: ####

##### 🕝 2.1_1: p2p without SHA

##### 🕝 2.1_2: basic arbritrage system

##### 🕝 2.1_3: TSAE message propagation

-----------------------------------------------------------

## Goals for Beta 3 <---> Blockchain implementation 

-----------------------------------------------------------

### tbc-beta_3.0 (Decentralized / distributed dApp) 

Full blockchain layer implementation

#### 🔴 TO-DO List for beta_3.0: ####

##### 🕝 3.0_1: p2p + SHA = blockchain 

Validate blocks of reported profiles (proof of work). Invent something to regard the users that validate blocks such as trollcoins or whatever... (I wrote something somewhere about it, find it and paste here) ---->
----->
és una mica complex, però amb bitcoin per exemple, els usuaris de la currency poden guanyar bitcoins validant o certificant blocs de transaccions que s'han efectuat. Es pot fer quelcom anàleg amb trolls en comptes de transaccions, i avisar amb notificacions als usuaris quan hi hagi trolls per validar. Si el fork que inclou el teu bloc s'acaba afegint a la cadena, guanyes una recompensa, que es podria utilitzar per mantenir viva la subscripció automàtica o poder importar trolls (si no guanyes "trollcoins" certificant trolls, no pot seguir disfrutant del "anti-virus de trolls", que by the way, és gratis però no funciona si no s'hi col·labora. Si ets un troll que intenta reportar o certificar perfils legitims, el forks que conté el teu bloc no entra a la cadena. Si es repeteix aquest comportament, s'et banneja de la app, primer x dies, després x setmanes, etc.). No m'enrrollo més perque aquesta fase és purament teórica i haig de lligar-ho molt bé, però mentres més voltes li dono a la idea més possibilitats li veig (insisteixo, això és per una fase moooolt més avançada del projecte).