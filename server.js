const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/user.js');
const center = require('./server/center.js');
const Room = require("./models/room.js");

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

// var rooms = {};
// var total_rooms = 0;

rooms = load_room_info();
console.log("rooms");
console.log(rooms);
// console.log("total_rooms");
// console.log(total_rooms);

wss.on('connection', function connection(ws) {
  console.log('A new client Connected!');


  ws.on('message', function incoming(message) {
    console.log(JSON.stringify(message));
    console.log(typeof message);
    console.log(message == "\"hello\"");
    var cmd = JSON.parse(message);
    var func = cmd["c"] + "_" + cmd["m"];
    try {
      players = center[func](cmd["data"].key);
      console.log(players);
      ws.send(JSON.stringify({c: cmd["c"], m: cmd["m"], data: {players}}));
    } catch (error) {
      console.log(error);
    }
    
    
    if (message == "\"hello\"") {
      console.log('123');

      var cmd = JSON.stringify({"c":"index","m":"console","data":{"result": [123, "test"]}})
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


async function load_room_info() {
  var rooms = {};
  var rs = await Room.find();
  
  for (var room in rs) {
    //total_rooms++;
    console.log("room.players");
    console.log(room.players);
    rooms[room.id] = {"players": room.players, "status": room.room_status, "stake": room.stake, "name": room.name, "blind_type": room.blind_type, "starting_time": room.starting_time}
  }
  console.log("rs1");
  console.log(rooms);
  return rooms;
}