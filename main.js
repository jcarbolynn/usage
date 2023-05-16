var SpreadSheetID = "1diGFcUshSjcyVml01cbt5GjsQm9PC0m2YbSFYcdlPa0"
var SheetNames = ["Sheet1"]
var EmailSheet = "emails"

function updateUsage(){
  var ss = SpreadsheetApp.openById(SpreadSheetID);
  var inventoryUsage = ss.getSheetByName(SheetNames);

  usage_array = getInventory(inventoryUsage);
  updated_usage = usage_array;
  

//  /** 
  //just do it all in usage_array and then move usage_array to google sheet
  for (var i=0; i<usage_array.length; i++){

    //change new total to total (total will be edited)
    updated_usage[i]['previous'] = usage_array[i]['new'];
    updated_usage[i]['new'] = usage_array[i]['total'];

    //if new total has gone down, difference is ADDED to total used, shift new total to previous total
    if (usage_array[i]['new'] < usage_array[i]['previous']){
      updated_usage[i]['usage'] = usage_array[i]['usage'] + (usage_array[i]['previous'] - usage_array[i]['new']);
    }

    else{
      updated_usage[i]['usage'] = usage_array[i]['usage'] + 0;
    }

    var headings = ['item', 'total','previous', 'new', 'usage'];
    var output = [];

    updated_usage.forEach(item => {
      output.push(headings.map(heading => {
        return item[heading]
      }));
    })

    if (output.length) {
      // Add the headings - delete this next line if headings not required
      output.unshift(headings);
      ss.getSheetByName("Sheet1").getRange(1, 1, output.length, output[0].length).setValues(output);
    }

  }
  //  */


  var emailInfo = ss.getSheetByName(EmailSheet);
  var email_json = getEmails(emailInfo);

  const now = new Date();
  // month = now.getMonth() +1; <-- it actually will be for the previous month...but DO need to keep this out here so I can adjust for 12/previousyear inventory usage
  month = now.getMonth();
  year = now.getFullYear();
  if (month == 0){
    month = 12;
    year = year -1;
  }

// if first of month send email about usage
  if (now.getDate() == 16){
    // does send as one chunk but UGLY
    for (var j=0; j<email_json.length; j++){
      MailApp.sendEmail({to: email_json[j].email,
                         subject: "Usage Report " + month + "/" + year,
                         htmlBody: printStuff(updated_usage),
                         noReply:true})
    }

    // now time for some code duplication
    for (var i=0; i<usage_array.length; i++){
      updated_usage[i]['usage'] = 0;

      var headings = ['item', 'total','previous', 'new', 'usage'];
      var output = [];

      updated_usage.forEach(item => {
        output.push(headings.map(heading => {
          return item[heading]
        }));
      })

      if (output.length) {
        // Add the headings - delete this next line if headings not required
        output.unshift(headings);
        ss.getSheetByName("Sheet1").getRange(1, 1, output.length, output[0].length).setValues(output);
      }

    }
  }
}

function printStuff(updated_usage){
  // newthing = []

  string = "";
  for (var i=0; i<usage_array.length; i++){

    temp = JSON.stringify(updated_usage[i]['item']) + ": " + JSON.stringify(updated_usage[i]['usage'])+ ",   ";
    string = string.concat(temp);


    // newthing.push(JSON.stringify(updated_usage[i]['item']) + ": " + JSON.stringify(updated_usage[i]['usage']))
    // console.log(JSON.stringify(updated_usage[i]['item']) + ": " + JSON.stringify(updated_usage[i]['usage']))
    // console.table(updated_usage, ['item', 'usage']);
  }
  return string;
}

function getInventory(item){
  var jo = {};
  var dataArray = [];
  // collecting data from 2nd Row , 1st column to last row and last    // column sheet.getLastRow()-1
  var rows = item.getRange(2,1,item.getLastRow()-1, item.getLastColumn()).getValues();
  for(var i = 0, l= rows.length; i<l ; i++){
    //skip empty values: check if item name (rows[i][0]) is blank, then dont add to dataArray
    if (rows[i][0] !== ''){
      var dataRow = rows[i];
      var record = {};
      record['item'] = dataRow[0];
      record['total'] = dataRow[1];
      record['previous'] = dataRow[2];
      record['new'] = dataRow[3];
      record['usage'] = dataRow[4];
      dataArray.push(record);
    }
  }
  jo = dataArray;
  return jo;
}

function getEmails(email_sheet){
  var jo = {};
  var dataArray = [];
  var rows = email_sheet.getRange(2,1,email_sheet.getLastRow()-1, email_sheet.getLastColumn()).getValues();
  for(var i = 0, l= rows.length; i<l ; i++){
    var dataRow = rows[i];
    var record = {};
    record['email'] = dataRow[0];
    dataArray.push(record);
  }
  jo = dataArray;
  return jo;
}
