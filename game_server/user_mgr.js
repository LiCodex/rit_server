var room_mgr = require('./room_mgr');
var user_list = {};
var user_online = 0;

exports.bind = function(user_id, socket) {
    user_list[user_id] = socket;
    user_online++;
};

exports.del = function(user_id) {
    delete user_list[user_id];
    user_online--;
};

exports.get = function(user_id) {
    return user_list[user_id];
};

exports.is_online = function(user_id) {
    var data = user_list[user_id];
    if (data != null) {
        return true;
    }
    return false;
};

exports.get_online_count = function() {
    return user_online;
};

exports.send_message = function(user_id, event, msg_data) {
    console.log(event);
    var user_info = user_list[user_id];
    if (user_info == null) {
        return;
    }
    var socket = user_info[user_id];
    if (socket == null) {
        return;
    }
};

exports.clear_room = function(room_id) {
    if (room_id == null) {
        return;
    }

    var room_info = room_mgr.get_room(room_id);
    if (room_info == null) {
        return;
    }

    for (var i = 0; i < room_info.seats.length; i++) {
        var rs = room_info.seats[i];
        if (rs.user_id > 0) {
            var socket = user_list[rs.user_id];
            if (socket != null) {
                exports.del(rs.user_id);
                socket.disconnect();
            }
        }
    }
};

exports.broadcast_in_room = function(event, data, sender, including_sender) {
    var room_id = room_mgr.get_user_room(sender);
    if (room_id == null) {
        return;
    }

    var room_info = room_mgr.get_room(room_id)
    if (room_info == null) {
        return;
    }

    for (var i = 0; i < room_info.seats.length; i++) {
        var rs = room_info.seats[i];

        if (rs.user_id == sender && including_sender != true) {
            continue;
        }

        var socket = user_list[rs.user_id];
        if (socket != null) {
            socket.send(JSON.stringify({c: event["c"], m: event["m"], data: {data}}));
            // socket.emit(event, data);
        }
    }
};
