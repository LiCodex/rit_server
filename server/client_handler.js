const assert = require('assert');
const center = require('./center');

function send_to_client(c, m, uid, session_id, data) {
    var response = {};
    response.c = c;
    response.m = m;
    response.uid = uid;
    response.src = 'client';
    response.data = data;
    response.session_id = session_id;
    center.send_to_center(response);
}

function send_to_room(room_id, c, m, uid, session_id, data, ctx_seq) {
    var response = {};
    response.c = c;
    response.m = m;
    response.uid = uid;
    response.src = 'client';
    response.data = data;
    response.ctx_seq = ctx_seq;
    response.session_id = session_id;
    center.send_to_room(room_id, response);
}

function send_to_client(socket, message) {
    res = JSON.stringify(message);
    socket.sent(res);
}

function client_room_load_context(message) {
    console.log('load context %s', JSON.stringify(message));
    if (this.room_id != null) {
        send_to_room(this.room_id, message.c, message.m, this.uid, this.ctx.session_id, message.data);
    }
}

function client_room_heartbeat(message) {
    console.log(JSON.stringify(message));
    send_to_client(this.ctx.web_socket, message);
}

function client_room_join(message) {
    console.log('load context %s', JSON.stringify(message));
    data = message.data;
    key = data.key;
    message.data.info = {
        avatar: 1,
        uid: this.uid,
        name: this.name,
        ip: this.IP
    }
    send_to_center(message.c, message.m, this.uid, this.ctx.session_id);
}
//reconnect
function client_room_rejoin(message) {
    message.data.info = {
        avatar: 1,
        uid = this.uid,
        name: this.name,
        ip: this.IP
    }

}

function server_room_join(message) {
    if (message.data.err == null) {
        this.room_id = message.data.room_id;
    }
    send_to_client(this.ctx.web_socket, message);
}

function server_room_quit(message) {
    if (message.data.uid == this.uid) {
        this.room_id = null;
    }
    send_to_client(this.ctx.web_socket, message);
}

function server_room_game_begin(message) {
    send_to_client(this.ctx.web_socket, message);
}

function server_room_load_context(message) {
    self.room_id = message.room_id;
    send_to_client(this.ctx.web_socket, message);
}

function client_index_login(message) {
    var data = message.data;
    this.uid = message.data.uid;
    var user = {};
    var response = {};
    response.c = message.c;
    response.m = message.m;
    var data = {};
    response.data = data;

    this.coin = user.coin;
    this.avatar = 1;
    this.name = 'test';
    data.room_id = get_room_id(this.uid);
    this.room_id = data.room_id;
    if (data.room_id != null) {
        data.room_type = get_room_type(data.room_id);
    }

    send_to_client(this.ctx.web_socket, response);
}

