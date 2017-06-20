var https = require('https');
var fs = require('fs');

// for ssl connection

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// secret ID value for each handler

var crypto = require('crypto');
function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}
var idArray = new Array();
if (typeof(idArray[0]) == "undefined") {
  for (var i = 1; i <= 30; i++) {
      idArray[i] = randomValueHex(i);
  }
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

var idIncrementer = 1;
// data result for starttest
var data = [];
// Variable for GET/allTests
var allTests = {};
allTests['handles'] = [];

function getjson(postJSON) {
  urls = postJSON.sitesToTest;
  for (url in urls) {
  	allTests['handles'].push(urls[url]);
  	for (i = 1; i <= postJSON.iterations; i++) {
  		var start = new Date();
  		https.get(urls[url], (res) => {
  			var d = {};
        d['ID'] = idArray[idIncrementer];
        idIncrementer += 1;
  			if (!res.headers.location) {
  				d['testHandle'] = "http://www.google.com/";
  			}
  			else {
  				d['testHandle'] = res.headers.location;
  			}
  			d['statusCode'] = res.statusCode;
  			d['status'] = 'finished';
  			d['avg'] = 5;
    	  d['max'] = 10;
    		d['min'] = 1;
  			var h = addZero(start.getUTCHours());
      	var m = addZero(start.getUTCMinutes());
      	var s = addZero(start.getUTCMilliseconds());
  			d['startTestTime'] = h + "h:" + m + "m:" + s + "ms";
  			var end = new Date();
  			h = addZero(end.getUTCHours());
      		m = addZero(end.getUTCMinutes());
      		s = addZero(end.getUTCMilliseconds());
  			d['endTestTime'] = h + "h:" + m + "m:" + s + "ms";
  			d['Request took'] = end - start + 'ms';
  			data.push(d);
  		}).on('error', (e) => {
  			console.error(e);
  		});
  	}
  }
  return data;
}

var a = https.createServer(options, function (req, res) {
  // read from data
  req.on('error', function(err) {
    console.log(err);
  }).on('data', function(chunk) {
    res.writeHead(200);
    data = getjson(chunk);
    if (req.url == '/startTest') {
      res.end(JSON.stringify(data));
      jsonData = JSON.stringify(data);
      fs.writeFile("alltests.txt", jsonData, function(err) {
        if(err) {
            return console.log(err);
        }
      });
    }
    else if (req.url.startsWith('/testStatus?testHandle')) {
    	var siteID = req.url.split('=')[1];
    	var testStatus = {};
      for (d in data) {
        testStatus = data[d];
        if (testStatus["ID"] == siteID) {
          res.end(JSON.stringify({"testHandle": testStatus["testHandle"], "status": testStatus["status"]}));
        }
      }
    }
    else if (req.url.startsWith('/testResults?testHandle')) {
    	var siteID = req.url.split("=")[1];
    	console.log(siteID);
    	var testResults;
    	for (d in data) {
    		testResults = data[d];
    		if (testResults["ID"] == siteID) {
    			res.end(JSON.stringify(testResults)); 
    		}
    	}
    }
    else if (req.url == '/allTests') {
    	res.end(JSON.stringify(allTests));
    }
  }).on('end', function() {
    res.end("Hello! use any of the following path with the server url: /startTest \ /allTests \ /testStatus?testHandle=<someID> \ /testResults?testHandle=<someID>");
  });
}).listen(8000);