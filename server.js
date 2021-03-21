const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/user');
const WebSocketServer = require('websocket').server;
const http = require('http');


dotenv.config();

const app = express();
app.use(cors());

mongoose.connect(process.env.DATABASE, 
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("connected to the db")
    }
})

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: false } ));

const productRoutes = require('./routes/product');
const userRoutes = require("./routes/auth");
const heartBeatRoutes = require('./routes/heart_beat');
const hallRoutes = require('./routes/hall');
app.use('/', productRoutes);
app.use('/', userRoutes);
app.use('/', heartBeatRoutes);
app.use('/', hallRoutes);

// app.get('/', (req, res) => {
//     res.json("Hello Amazon");
// });

// app.post('/', (req, res) => {
//     console.log(req.body.name);
//     let user = new User();
//     user.name = req.body.name;
//     user.email = req.body.email;
//     user.password = req.body.password;

//     user.save((err) => {
//         if (err) {
//             res.json(err);
//         } else {
//             res.json('request sucess');
//         }
//     })
// })

app.listen(3000, err => {
    if (err) {
        console.log(err);
    } else {
        console.log("listening on port", 3000);
    }
});

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
