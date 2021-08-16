const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/user.js');
const center = require('./server/center.js');
const Room = require("./models/room.js");
const room_mgr = require('./game_server/room_mgr');

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

  ws.on('ready', function(data){
    var user_id = ws.user_id;
    if(user_id == null){
      return;
    }
    ws.gameMgr.setReady(user_id);
    user_mgr.broacast_in_room('user_ready_push',{user_id: user_id, ready: true}, user_id, true);
  });

  ws.on('message', function incoming(message) {
    console.log(JSON.stringify(message));
    console.log(typeof message);
    console.log(message == "\"hello\"");
    var cmd = JSON.parse(message);
    console.log("c+m");
    console.log(cmd["c"] + "_" + cmd["m"]);
    var func = cmd["c"] + "_" + cmd["m"];
    try {
      res = room_mgr[func](cmd["data"]);
      if (res != null) {
        ws.send(JSON.stringify({c: cmd["c"], m: cmd["m"], data: {res}}));
      }
    } catch (error) {
      console.log(error);
    }

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
