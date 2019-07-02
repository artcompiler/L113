/*
   L113 compiler service.
   @flow weak
*/
const langID = "113";
// SHARED START
const bodyParser = require('body-parser');
const https = require("https");
const express = require('express')
const compiler = require("./lib/compile.js");
const app = express();
app.set('port', (process.env.PORT || "5" + langID));
app.use(express.static(__dirname + '/pub'));
app.use(bodyParser.json({type: 'application/json', limit: '50mb'}));
app.get('/', function(req, res) {
  res.send("Hello, L" + langID + "!");
});
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});
app.get("/version", function(req, res) {
  res.send(compiler.version || "v0.0.0");
});
app.post("/compile", function(req, res) {
  let body = req.body;
  let auth = body.auth;
  validate(auth, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      if (data.access.indexOf("compile") === -1) {
        // Don't have compile access.
        res.sendStatus(401).send(err);
      } else {
        let code = body.src;
        let data = body.data;
        let t0 = new Date;
        let obj = compiler.compile(code, data, function (err, val) {
          if (err.length) {
            res.send({
              error: err,
            });
          } else {
            console.log("GET /compile " + (new Date - t0) + "ms");
              res.json(val);
          }
        });
      }
    }
  });
});
function postAuth(path, data, resume) {
  let encodedData = JSON.stringify(data);
  var options = {
    host: "auth.artcompiler.com",
    port: "443",
    path: path,
    method: "POST",
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(encodedData),
    },
  };
  var req = https.request(options);
  req.on("response", (res) => {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    }).on('end', function () {
      try {
        resume(null, JSON.parse(data));
      } catch (e) {
        console.log("ERROR " + data);
        console.log(e.stack);
      }
    }).on("error", function () {
      console.log("error() status=" + res.statusCode + " data=" + data);
    });
  });
  req.end(encodedData);
  req.on('error', function(err) {
    console.log("ERROR " + err);
    resume(err);
  });
}
function count(token, count) {
  postAuth("/count", {
    jwt: token,
    lang: "L" + langID,
    count: count,
  }, () => {});
}
const validated = {};
function validate(token, resume) {
  if (token === undefined) {
    resume(null, {
      address: "guest",
      access: "compile",
    });
  } else if (validated[token]) {
    resume(null, validated[token]);
    count(token, 1);
  } else {
    postAuth("/validate", {
      jwt: token,
      lang: "L" + langID,
    }, (err, data) => {
      validated[token] = data;
      resume(err, data);
      count(token, 1);
    });
  }
}
// SHARED STOP
