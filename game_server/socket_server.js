var express = require('express');
var tokenMgr = require('./token_mgr');
var roomMgr = require('./roommgr');
var userMgr = require('./usermgr');
var http = require('../utils/http');

var app = express();

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
	http.send(res,0,"ok",{});
});

var config = null;

exports.start = function(conf, mgr) {

    config = conf;
    const server = require('http').createServer(app);
    const WebSocket = require('ws');
}
