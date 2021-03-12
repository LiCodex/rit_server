var db = require('../utils/db');

var rooms = {};
var creatingRooms = {};

var userLocation = {};
var totalRooms = 0;

function generateRoomId() {
  var roomId = "";
  for (var i = 0; i < 6; i++) {
    roomId += Math.floor(Math.random()* 10);
  }
  return roomId;
}


function constructRoomFromDb(dbdata) {
  var roomInfo = {
    uuid: dbdata.uuid,
    id: dbdata.id,
    numberOfHands: dbdata.number_of_hands,
    createTime: dbdata.create_time,
    nextButton: dbdata.next_button,
    seats: new Array(8),
    conf: JSON.parse(dbdata.base_info)
  };

  var roomId = roomInfo.id;

  for(var i = 0; i < 8; i++) {
    var s = roomInfo.seats[i] = {};
    
  }
}
