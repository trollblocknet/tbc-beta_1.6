let reports = {};
let report = {};
var myTable = [];

// define variables that reference elements on our page
const reportsList = document.getElementById('reports'); //Selects report list

// a helper function to call when our request for reports is done
const getreportsListener = function() {
  
 // parse our response to convert to JSON
 reports = JSON.parse(this.responseText);
  
 //Iterate through every report and add it to our page
 reports.forEach(function (row) {
   
    var UrlTweetID = "<a target=\"_blank\" href=https://www.twitter.com/userid/status/" + row.tweetID + ">" + row.tweetID + "</a>";
    var myObj = {tw_userID: row.tw_userID, tweetID: UrlTweetID, list: row.list, comments: row.comments};
    myTable.push(myObj);
   
  });
}

// request the reports from our app's sqlite database

const reportRequest = new XMLHttpRequest();
reportRequest.onload = getreportsListener;
reportRequest.open('get', '/getReports');
reportRequest.send();

if(reportRequest.error){console.error("[tbc.sqlite] : " +  reportRequest.error)
}

var myList = myTable;

// Builds the HTML Table out of myList.
function buildHtmlTable(selector) {
  var columns = addAllColumnHeaders(myList, selector);

  for (var i = 0; i < myList.length; i++) {
    var row$ = $('<tr/>');
    for (var colIndex = 0; colIndex < columns.length; colIndex++) {
      var cellValue = myList[i][columns[colIndex]];
      if (cellValue == null) cellValue = "";
      
      row$.append($('<td/>').html(cellValue));
    }
    $(selector).append(row$); 
  }
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records.
function addAllColumnHeaders(myList, selector) {
  var columnSet = [];
  var headerTr$ = $('<tr/>');

  for (var i = 0; i < myList.length; i++) {
    var rowHash = myList[i];
    for (var key in rowHash) {
      if ($.inArray(key, columnSet) == -1) {
        columnSet.push(key);
        headerTr$.append($('<th/>').html(key));
      }
    }
  }
  $(selector).append(headerTr$);

  return columnSet;
}
        
///////////////////////////////////
///   THE END
//////////////////////////////////

// POSSIBLE BUG RENDERING IN FIREFOX -> CLEAR CACHE ETC AND MONITOR ISSUE


///////////////////////////////////
///   NOTES
//////////////////////////////////

 