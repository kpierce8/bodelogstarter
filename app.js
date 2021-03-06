//
// hello-mongoose: MongoDB with Mongoose on Node.js example on Heroku.
// Mongoose is a object/data mapping utility for the MongoDB database.
//

// by Ben Wen with thanks to Aaron Heckmann

//
// Copyright 2014 ObjectLabs Corp.  
// ObjectLabs operates MongoLab.com a MongoDb-as-a-Service offering
//
// MIT Licensed
//

// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:  

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software. 

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE. 

//
// Preamble
var http = require ('http');	     // For serving a basic web page.
var mongoose = require ("mongoose"); // The reason for this demo.

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.  
var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/bodelogstarter';

// The http server will listen to an appropriate port, or default to
// port 5000.
var theport = process.env.PORT || 5000;

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

// This is the schema.  Note the types, validation and trim
// statements.  They enforce useful constraints on the data.
var userSchema = new mongoose.Schema({
  name: {
    first: String,
    last: { type: String, trim: true }
  },
  age: { type: Number, min: 0}
});

var bodeSchema = new mongoose.Schema({
  name: String,
  reps: {type: Number, min: 0},
  resistance: {type: Number, min: 0},
  time: Date
});

var BLog = mongoose.model('Bodelog', bodeSchema);

var set1 = new BLog ({
  name: 'Squat',
  reps: 4,
  resistance: 225
});

set1.save(function(err) {if (err) console.log('Error on save')});

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'PowerUsers' collection in the MongoDB database
var PUser = mongoose.model('PowerUsers', userSchema);

// Clear out old data
function clearData(addData){
PUser.remove({}, function(err) {
  console.log('in delete function');
  if (err) {
    console.log ('error deleting old data.');
  }
});
addData();
}

// Creating one user.
function addData(){


  var johndoe = new PUser ({
    name: { first: 'John', last: '  Doe   ' },
    age: 25
  });

// Saving it to the database.  
johndoe.save(function (err) {if (err) console.log ('Error on save!')});

// Creating more users manually
var janedoe = new PUser ({
  name: { first: 'Jane', last: 'Doe' },
  age: 65
});
janedoe.save(function (err) {if (err) console.log ('Error on save!')});

// Creating more users manually
var alicesmith = new PUser ({
  name: { first: 'Alice', last: 'Smith' },
  age: 45
});
alicesmith.save(function (err) {if (err) console.log ('Error on save!')});


var alicesmith2 = new PUser ({
  name: { first: 'Alicia', last: 'Wibbleton' },
  age: 13
});
alicesmith2.save(function (err) {if (err) console.log ('Error on save!')});

}

// In case the browser connects before the database is connected, the
// user will see this message.
var found = ['DB Connection not yet established.  Try again later.  Check the console output for error messages if this persists.'];

// Create a rudimentary http server.  (Note, a real web application
// would use a complete web framework and router like express.js). 
// This is effectively the main interaction loop for the application. 
// As new http requests arrive, the callback function gets invoked.

http.createServer(function (req, res) {
  clearData(addData);
  if ('/' == req.url) {
    switch (req.method) {
      case 'GET' :
      res.writeHead(200, {'Content-Type': 'text/html'});
      createWebpage(req, res);
      addExerciseData(req, res);
      break;
      case 'POST':
        req.setEncoding('utf8');
        req.on('data', function(chunk) {
            console.log(chunk);
            processSet(chunk);
            });
        res.end('ended process chunk from / ');
      break;
      default:
        badRequest(res); //added route logic from Node in Action page 88 to fill out app
      }
    } else if ('/sets/' == req.url) {
      switch (req.method) {
      case 'GET' :
       res.writeHead(200, {'Content-Type': 'text/html'});
       res.write(html7);
       res.end();
      break;
      case 'POST':
        req.setEncoding('utf8');
        req.on('data', function(chunk) {
            console.log(chunk);
            processSet(chunk);
            });
        res.end('ended process chunk from /sets/' + html8 );
      break;
      default:
        badRequest(res); //added route logic from Node in Action page 88 to fill out app
      }
       

    } else {
      notFound(res);
    }

  }).listen(theport);

function badRequest(res) {
  res.statusCode = 400;
  res.setHeader('Content-Type', 'text/plain');
  res.end('At least the Bad Request response worked');
}


function notFound(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('At least the Not Found response worked');
}


function createWebpage (req, res) {
  // Let's find all the documents
  PUser.find({}).exec(function(err, result) { 
    if (!err) { 
      res.write(html1 + JSON.stringify(result, undefined, 2) +  html2 + result.length + html3);
      // Let's see if there are any senior citizens (older than 64) with the last name Doe using the query constructor
      var query = PUser.find({'name.last': 'Doe'}); // (ok in this example, it's all entries)
      query.where('age').gt(64);
      query.exec(function(err, result) {
	if (!err) {
	  res.end(html4 + JSON.stringify(result, undefined, 2) + html5 + result.length + html6);
	} else {
	  res.end('Error in second query. ' + err)
	}
      });
    } else {
      res.end('Error in first query. ' + err)
    };
  });
}

function addExerciseData (req, res) {
  BLog.find({}).exec(function(err, result) {
    if (!err) { 
      res.write('<h2>List the exercise sets </h2></b> <pre><code>' + JSON.stringify(result, undefined, 2) +  html2 + result.length + html3);
  } else {
    res.end('Error in third query. ' + err)
  }
});
}

function processSet(setdata) {
  bob = setdata.split('&');
  var set2 = new BLog ({
    name: bob[0].split('=')[1],
    reps: bob[1].split('=')[1],
    resistance: bob[2].split('=')[1]
  }).save(function(err) {if (err) console.log('Error on save')});
  console.log('set processed');
  
  //set2.save(function(err) {if (err) console.log('Error on save')});
}

// Tell the console we're getting ready.
// The listener in http.createServer should still be active after these messages are emitted.
console.log('http server will be listening on port %d', theport);
console.log('CTRL+C to exit');

//
// House keeping.

//
// The rudimentary HTML content in three pieces.
var html1 = '<title> hello-mongoose: MongoLab MongoDB Mongoose Node.js Demo on Heroku </title> \
<head> \
<style> body {color: #394a5f; font-family: sans-serif} </style> \
</head> \
<body> \
<h1> hello-mongoose: MongoLab MongoDB Mongoose Node.js Demo on Heroku </h1> \
See the <a href="https://devcenter.heroku.com/articles/nodejs-mongoose">supporting article on the Dev Center</a> to learn more about data modeling with Mongoose. \
<br\> \
<br\> \
<br\> <h2> All Documents in MonogoDB database </h2> <pre><code> ';
var html2 = '</code></pre> <br\> <i>';
var html3 = ' documents. </i> <br\> <br\>';
var html4 = '<h2> Queried (name.last = "Doe", age >64) Documents in MonogoDB database </h2> <pre><code> ';
var html5 = '</code></pre> <br\> <i>';
var html6 = ' documents. </i> <br\> <br\> \
<br\> <br\> <center><i> Demo code available at <a href="http://github.com/mongolab/hello-mongoose">github.com</a> </i></center></b><a href="../sets/">Add Set</a>';
var html7 = '<form method="post" action="/"><p><input type="text" name="exercise"/> Exercise</p><p><input type="text" name="reps"/> Reps</p><p><input type="text" name="resistance"/> Resistance</p><p><input type="submit" value="Add Set"/></p></form>';
var html8 = '<a href = "../"> Home</a>'

