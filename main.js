var SpreadSheetID = "1YHMh3YT-BcfgtntT1rLHa3f5D-KJDu94ILdy2v2LWaw"
var SheetNames = ["Sheet1"]
var EmailSheet = "emails"

// SpreadsheetApp.getActiveSpreadsheet().getRange(range).getValues(values)

function updateUsage(){
  var ss = SpreadsheetApp.openById(SpreadSheetID);
  var inventoryUsage = ss.getSheetByName(SheetNames);


  usage_array = getInventory(inventoryUsage);
  updated_usage = usage_array;
  
  // // see 117
  // usage_dict = rowsToDict(inventoryUsage, 2, 12);
  // console.log(usage_dict);



//  /** 
  //just do it all in usage_array and then move usage_array to google sheet
  for (var i=0; i<usage_array.length; i++){
    // //checking: what is usage_array
    // console.log('before ' + i);
    // console.log(usage_array);
    // console.log(updated_usage);


    //change new total to total (total will be edited)
    updated_usage[i]['previous'] = usage_array[i]['new'];
    updated_usage[i]['new'] = usage_array[i]['total'];


    // use dictionary instead
    updated_dict = [];
    updated_dict[usage_array[i]['item']] = [{
      'previous' : usage_array[i]['new'],
      'new' : usage_array[i]['total'],
      },
    ];
    
    // var dict_data = {};
    // for (var keys in columns) {
    //   var key = columns[keys];
    //   dict_data[key] = data[keys];
    // }

    // //checking that comparison between previous total and new total is working
    // console.log(usage_array[i]['item']);
    // console.log('new: ' + usage_array[i]['new']);
    // console.log('previous: ' + usage_array[i]['previous']);

    //if new total has gone down, difference is ADDED to total used, shift new total to previous total
    if (usage_array[i]['new'] < usage_array[i]['previous']){
      updated_usage[i]['usage'] = usage_array[i]['usage'] + (usage_array[i]['previous'] - usage_array[i]['new']);

      updated_dict[usage_array[i]['item']]['usage'] = usage_array[i]['usage'] + (usage_array[i]['previous'] - usage_array[i]['new']);
      
      // // do i need this last step??
      // updated_usage[i]['total'] = getInventory(inventoryUsage)[i]['total'];
    }

    else{
      updated_usage[i]['usage'] = usage_array[i]['usage'] + 0;
    }

    console.log('after');
    console.log(updated_usage);
    // console.log(updated_dict);

    var headings = ['item', 'total','previous','new', 'usage'];
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
      


    // put updated_usage into google sheet
    // https://sheetsiq.com/google-sheets/app-script/copy-an-array-into-a-sheet-google-sheet/



  // trying to set google sheet values to usage_array values
    // inventoryUsage.getRange(previous_total_range).setValues(usage_array[i]['new']);
    // inventoryUsage.getRange(previous_total_range).setValues(usage_array[i]['new'])
    // inventoryUsage.getRange('D'+j+':D'+j).setValues(inventoryUsage.getRange('E'+j+':E'+j).getValues());

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
  if (now.getDate() == 1){
    // does send as one chunk but UGLY
    for (var j=0; j<email_json.length; j++){
      MailApp.sendEmail({to: email_json[j].email, subject: "Usage Report " + month + "/" + year, htmlBody: JSON.stringify(updated_usage), noReply:true})
    }
  }
}

// // https://gist.github.com/dangtrinhnt/320e425b26ac3c5ca987
// function rowToDict(sheet, rownumber) {
//   var columns = sheet.getRange(1,1,1, sheet.getMaxColumns()).getValues()[0];
//   var data = sheet.getDataRange().getValues()[rownumber-1];
//   var dict_data = {};
//   for (var keys in columns) {
//     var key = columns[keys];
//     dict_data[key] = data[keys];
//   }
//   return dict_data;
// }

// function rowsToDict(sheet, beg, end) {
//   for(var i = beg, l= end +1; i<l ; i++){
//     // first row is the list of keys
//     var columns = sheet.getRange(1,1,1, sheet.getMaxColumns()).getValues()[0];
//     var data = sheet.getDataRange().getValues()[i-1];
//     var dict_data = {};


//     // make a dictionary key the item then everything in this for loop the value
//     console.log(data[0]);
//     for (var keys in columns) {

//       var key = columns[keys];
//       dict_data[key] = data[keys];

//     }
//   }

//   return dict_data;
// }

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
