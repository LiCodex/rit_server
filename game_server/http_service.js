var crypto = require('../utils/crypto');
var express = require('express');
var db = require('../utils/db');
var http = require('../utils/http');
var roomMgr = require("./roommgr");
var userMgr = require("./usermgr");
var tokenMgr = require("./tokenmgr");


dotenv.config();
const app = express();
app.use(cors());
var app = express();
var config = null;

var serverIp = "";

const productRoutes = require('./routes/product');
const userRoutes = require("./routes/auth");
const heartBeatRoutes = require('./routes/heart_beat');
const hallRoutes = require('./routes/hall');
app.use('/', productRoutes);
app.use('/', userRoutes);
app.use('/', heartBeatRoutes);
app.use('/', hallRoutes);


app.get('/is_room_runing', function(req, res){
  var room_id = req.query.room_id;
	var sign = req.query.sign;
	if(room_id == null || sign == null){
		http.send(res,1,"invalid parameters");
		return;
	}

	var md5 = crypto.md5(room_id + config.ROOM_PRI_KEY);
	if(md5 != sign){
		http.send(res,2,"sign check failed.");
		return;
	}

	http.send(res,0,"ok",{runing:true});
});
