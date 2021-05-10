const express = require("express");
const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server:server });

exports.start = function(conf, mgr) {
    wss.on('connection', function connection(ws) {
        console.log('A new client Connected!');
        ws.on('login', function(data) {
            data = JSON.parse(data);
            if (ws.user_id != null) {
                return;
            }
            var token = data.token;
            var room_id = data.room_id;
            var time = data.time;
            var sign = data.sign;

            console.log(token);
            console.log(room_id);
            console.log(time);
            console.log(sign);

            if (token == null || room_id == null || sign == null || time == null) {
                console.log(1);
                ws.send('login_result', {errcode: 1,errmsg: "invalid parameters"});
            }
        })
        ws.on('message', function incoming(message) {
        //   console.log(JSON.stringify(message));
        //   console.log(typeof message);
        //   console.log(message == "\"hello\"");
            var cmd = JSON.parse(message);
            var func = cmd["c"] + "_" + cmd["m"];
            try {
            res = center[func](cmd["data"]);
            console.log(players);
            ws.send(JSON.stringify({c: cmd["c"], m: cmd["m"], data: {res}}));
            } catch (error) {
            console.log(error);
            }
          
          
          // if (message == "\"hello\"") {
          //   console.log('123');
      
          //   var cmd = JSON.stringify({"c":"index","m":"console","data":{"result": [123, "test"]}})
          //   ws.send(cmd);
          // }
            wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
                // if (message == "\"hello\"") {
                //   console.log('Two seconds later, showing sleep in a loop...');
        
                //   var cmd = {"c":"index","m":"console","data":{}}
                //   client.send(cmd);
                // }
            }
            });
      
        });
      });
}