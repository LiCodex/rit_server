const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/user');

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


const server = require('http').createServer(app);
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server:server });

wss.on('connection', function connection(ws) {
  console.log('A new client Connected!');


  ws.on('message', function incoming(message) {
    console.log(message);
    console.log(typeof message);
    console.log(message == "\"hello\"");
    if (message == "\"hello\"") {
      console.log('123');

      var cmd = JSON.stringify({"c":"index","m":"console","data":{}})
      ws.send(cmd);
    }
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
        if (message == "\"hello\"") {
          console.log('Two seconds later, showing sleep in a loop...');

          var cmd = {"c":"index","m":"console","data":{}}
          client.send(cmd);
        }
      }
    });

  });
});
server.listen(8888, () => console.log(`Lisening on port :8888`));
app.listen(3000, err => {
    if (err) {
        console.log(err);
    } else {
        console.log("listening on port", 3000);
    }
});
