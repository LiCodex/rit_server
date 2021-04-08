var db = require('./utils/db');

var rooms = {};
var creating_room = {};

var userLocation = {};
var totalRooms = 0;

function constructRoomFromDb(dbdata) {
    var roomInfo = {

    }

    rooms[roomId] = roomInfo;
    totalRooms++;
    return roomInfo;
}

exports.createRoom = function(creator, roomConf, ip, port, callback) {
    if ()
};


exports.destroy = function(roomId) {
    var roomInfo = rooms[roomId];
    if (roomInfo == null) {
        return;
    }

    for (var i = 0; i < 8; i++) {
        var userId = roomInfo.seats[i].userId;
        if (userId > 0) {
            delete userLocation[userId];
            db.set_room_id_of_user(userId, null);
        }
    }

    delete rooms[roomId];
    totalRooms--;
    db.delete_room(roomId);
};

exports.getTotalRooms = function() {
    return totalRooms;
};

exports.getRoom = function(roomId) {
    return rooms[roomId];
}

exports.getUserLocations = function() {
    return userLocation;
};

exports.exitRoom = function(userId) {
    var location = userLocation[userId];
    if (location == null)
        return;
    
    var roomId = location.roomId;
    var seatIndex = location.seatIndex;
    var room = rooms[roomId];

};