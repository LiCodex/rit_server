var http_service = require("./http_service");
var socket_service = require("./socket_service");

var configs = require(process.argv[2]);
var config = configs.game_server();

//开启HTTP服务
http_service.start(config);

//开启外网SOCKET服务
socket_service.start(config);
