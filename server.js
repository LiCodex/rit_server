const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/user');
const WebSocket = require('ws');


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

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});