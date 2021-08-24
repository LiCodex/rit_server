//var db = require('../utils/db');
const Deck = require('./deck.js');
const Room = require('../models/room');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
var rooms = [{"_id": "608f829787c9b44b2c186f16", "name": "test", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "player_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "seat_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "seat_id": 1, "money_on_the_table": 100}]},{"_id": "6119cbab01f8ca1b5e7ed509", "name": "test_medium1", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "player_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "seat_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "seat_id": 1, "money_on_the_table": 100}]}, {"_id": "6119cbd101f8ca1b5e7ed50a", "name": "test_medium2", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "player_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "seat_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "seat_id": 1, "money_on_the_table": 100}]}, {"_id": "6119cbdb01f8ca1b5e7ed50b", "name": "test_medium3", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "player_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "seat_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "seat_id": 1, "money_on_the_table": 100}]} ];
var creating_rooms = {};

var user_location = {};
var total_rooms = 0;

function generate_room_id() {
    var room_id = "";
    for (var i = 0; i < 6; i++) {
        room_id += Math.floor(Math.random() * 10);
    }
    return room_id;
};


function active_player_count(players) {
  var res = 0;
  for (var i = 0; i < player.length; i++) {
    if ((players[i]["game_state"] == "playing" || players[i]["game_state"] == "waiting") && players[i]["money_on_the_table"] > 0) {
      res++;
    }
  }
  return res;
}

function check_start(room) {
  if (room.state != null) {
    return { message: "Cannot start" }
  }
  var active_players = 0;
  for (var player in room.players) {
    if (player.game_state != "sit_out" && player.money_on_the_table > 0) {
      active_players++;
    }
  }
  if (active_players >= 2) {
    room.time_state = 'start';
  }

};

exports.room_join = async function(message) {
    console.log(message);
    var room_id = message.key;
    var user_id = message.user_id;
    var room = rooms.filter(room => room["_id"] == room_id)[0];
    let db_room = await Room.findOne({ _id: room_id });
    db_room.players_count = room["player_count"] + 1;
    await db_room.save();
    return { success: true, players: room["players"] }
};

exports.room_quit = function(message) {
  var room = rooms["test"];
};

exports.room_add_time = function(message) {
  var room = rooms["test"];
  var chair_id = message.chair_id;
  var player = room["players"][chair_id];
  if (player["hand_state"] == "fold") {
    return { success: false, message: "the player has folded the hole cards, cannot add time" }
  }
  if (room["current_action_player"] != chair_id) {
    return { success: false, message: "not current player" }
  }

  if (player["money_in_the_bank"] < room["small_blind"]) {
    return { success: false, message: "do not have enough in the bank" }
  }

  room["XZTIMER"] += 15;
  room["current_player_timer"] = room["XZTIMER"] - (Date.now() - room["last_action_timestamp"]);
  return { success: true, message: "15 seconds have been added" }
}

exports.room_sit = function(message) {
  var uid = message.uid;
  var seat_id = message.chair_id;
  var room = rooms.filter(room => room["name"] == "test")[0];

  if (seat_id > room["seat_count"]) {
    return { success: false, message: "the chair_id exceeds room chair_count" }
  }

  var player = room["players"].filter(player => player["seat_id"] == seat_id)[0];
  if (player != undefined) {
    return { success: false, message: "there is already a player on the seat" }
  }
  //needs to read from the db
  player = {"uid": uid, "hand_state": "default", "game_state": "waiting", "seat_id": seat_id, "money_on_the_table": 0 }
  room["players"].push(player);
  room["player_count"]++;
  return { success: true, player: room["players"] }
};

exports.hall_user_profile = function(message) {
  // var uid = message.uid;
  // var user = await User.findOne({ _id: uid });
  // //let foundUser = await User.findOne({ _id: req.decoded._id });
  // if (user == undefined) {
  //   return { success: false, message: "user cannot be found" }
  // } else {
  //   console.log("user");
  //   console.log(user.coins);
  //   return { success: true, coins: user.coins }
  // }
  res = test();
  res.then(function(val) {
    console.log("val");
    console.log(val);
    return val;
  });

};

async function test() {
  return { success: true }
}

exports.room_buy_in = function(message) {
  var uid = message.uid;
  var seat_id = message.chair_id;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var amount = message.amount;

  if (seat_id > room["seat_count"]) {
    return { success: false, message: "the chair_id exceeds room chair_count" }
  }

  var player = room["players"].filter(player => player["seat_id"] == seat_id)[0];
  user = User.findOne({ _id: uid });
  if (amount > user.coins) {
    return { success: false, message: "the amount requested exceeds user own" }
  }

  user.coins -= amount;
  user.save();
  room["players"]["seat_id"]["money_on_the_table"] += amount;

  return { success: true, player: room["players"] }
};


exports.room_standup = function(message) {
  var uid = message.uid;
  var room = rooms.filter(room => room["name"] == "test")[0];

  var player = room["players"].filter(player => player["uid"] == uid)[0];
  if (player == undefined) {
    return { success: false, message: "user is not on the table" }
  }
  //needs to read from the db
  if (player["money_on_the_table"] > 0) {
    user = User.findOne({ _id: uid });
    user.coins += player["money_on_the_table"];
    user.save();
  }

  room["players"] = room["players"].filter(player => (player["uid"] != uid));
  room["player_count"]--;
  //table to bank
  return { success: true, player: room["players"] }
};

function bank_to_table(player, amount) {
  // var res = false;
  if (player["money_in_the_bank"] < amount) {
    return false;
  } else {
    player["money_in_the_bank"] -= amount;
    player["money_on_the_table"] += amount;
    return true;
  }
};

function table_to_bank(player, amount) {
  // var res = false;
  if (player["money_in_the_bank"] < amount) {
    return false;
  } else {
    player["money_in_the_bank"] -= amount;
    player["money_on_the_table"] += amount;
    return true;
  }
};


exports.room_refresh = function() {
  var room = [{"_id": "608f829787c9b44b2c186f16", "name": "test", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "player_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "seat_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "seat_id": 1, "money_on_the_table": 100}]},{"_id": "6119cbab01f8ca1b5e7ed509", "name": "test_medium1", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "player_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "seat_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "seat_id": 1, "money_on_the_table": 100}]}, {"_id": "6119cbd101f8ca1b5e7ed50a", "name": "test_medium2", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "player_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "seat_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "seat_id": 1, "money_on_the_table": 100}]}, {"_id": "6119cbdb01f8ca1b5e7ed50b", "name": "test_medium3", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "player_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "seat_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "seat_id": 1, "money_on_the_table": 100}]} ];
  return { success: true }
};

exports.room_testing = function() {
  return { room: room }
};

exports.index_login = function(message) {
    var token = message.jwt;
    console.log(token);
    var decoded = jwt.decode(token);
    console.log(decoded);
    //console.log(decoded.payload);
    var response = {};
    response.uid = decoded._id;
    response.room_id = "";
    //return null;
    return response;
};

exports.room_game_start = function(message) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  room["state"] = "playing";
  room["play_state"] = "start";

  if (room["round"] == 0) {
    room["started_at"] = Date.now();
  }

  room["round"]++;
  if (room["button"] == undefined) {
    button = rnd_button();
    room["button"] = button;
    room["players"][button] = true;
  } else {
    room["button"] = get_next(room["button"]);
  }

  if (room["button"] != undefined) {
  }

};


exports.room_action_buy_in = function(message) {
    var uid = message.uid;
    var room_id = message.room_id;
    var amount = message.chips;
    var room = rooms.filter(room => room["name"] == "test")[0];
    var seat_id = message.seat_id;
    var player = room["players"].filter(player => player["seat_id"] == seat_id)[0];
    // console.log("money in the bank")
    // console.log(player);
    if (amount == undefined) {
      return { success: false, added_amount: 0, message: "amount not provided"}
    }
    else if (player["money_in_the_bank"] < amount) {
      money_to_add = player["money_in_the_bank"]
      player["money_on_the_table"] += money_to_add;
      player["money_in_the_bank"] -= money_to_add;
      return { success: true, added_amount: money_to_add, message: "do not have enough money" }
    } else {
      player["money_on_the_table"] += amount;
      player["money_in_the_bank"] -= amount;
      // console.log("has enough money");
      // console.log(amount);
      return { success: true, added_amount: amount, message: "success" }
    }
};

exports.room_fold = function(message) {
  var uid = message.uid;
  var seat_id = message.seat_id;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(player => player["seat_id"] == seat_id)[0];
  if (seat_id == undefined) {
    return { success: false, message: "seat_id not found" }
  }
  seat_id = parseInt(seat_id);
  if (seat_id != room["current_action_player"]) {
    return { success: false, message: "not current action player" }
  }

  if (player["state"] == "fold") {
    return { success: false, message: "the player has folded the cards" }
  }

  player["action_count"] += 1;
  player["last_action_timestamp"] = Date.now();
  room["last_action_timestamp"] = Date.now();
  player["hand_state"] = "fold";

  var response = {}
  response["m"] = 'fold';
  response["c"] = "room";
  var data = {};
  data["seat_id"] = seat_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = 0;
  data["action"] = "fold";
  response["data"] = data;
  //broadcast_to_online_user(response);

  //room["actions"][seat_id] = [];

  return { success: true }
};

exports.room_call = function(message) {
  var uid = message.uid;
  var seat_id = message.seat_id;
  var bet_amount = message.bet_amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(player => player["seat_id"] == seat_id)[0];
  if (seat_id == undefined) {
    return { success: false, message: "seat_id not found" }
  }
  seat_id = parseInt(seat_id);
  if (seat_id != room["current_action_player"]) {
    return { success: false, message: "not current action player" }
  }

  if (player["state"] == "call") {
    return { success: false, message: "the player has folded the cards" }
  }

  player["action_count"] += 1;
  player["last_action_timestamp"] = Date.now();
  room["last_action_timestamp"] = Date.now();
  player["hand_state"] = "fold";

  var response = {}
  response["m"] = 'call';
  response["c"] = "room";
  var data = {};
  data["seat_id"] = seat_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = message.bet_amount;
  data["action"] = "call";
  response["data"] = data;
  //broadcast_to_online_user(response);

  //room["actions"][seat_id] = [];

  return { success: true, data: data }
};

exports.room_raise = function(message) {
  var uid = message.uid;
  var seat_id = message.seat_id;
  var bet_amount = message.bet_amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  console.log("players");
  console.log(room["players"]);
  var player = room["players"].filter(player => player["seat_id"] == seat_id)[0];
  console.log("player");
  console.log(player);
  if (seat_id == undefined) {
    return { success: false, message: "seat_id not found" }
  }
  seat_id = parseInt(seat_id);
  if (seat_id != room["current_action_player"]) {
    return { success: false, message: "not current action player" }
  }

  if (player["state"] == "raise") {
    return { success: false, message: "the player has folded the cards" }
  }

  player["action_count"] += 1;
  player["last_action_timestamp"] = Date.now();
  room["last_action_timestamp"] = Date.now();
  player["hand_state"] = "raise";

  var response = {}
  response["m"] = 'raise';
  response["c"] = "room";
  var data = {};
  data["seat_id"] = seat_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = message.bet_amount;
  data["action"] = "raise";
  response["data"] = data;
  //broadcast_to_online_user(response);

  //room["actions"][seat_id] = [];
  console.log("data");
  console.log(data);
  return { success: true, data: data }
};

exports.room_all_in = function(message) {
  var uid = message.uid;
  var seat_id = message.seat_id;
  var bet_amount = message.bet_amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(player => player["seat_id"] == seat_id)[0];
  if (seat_id == undefined) {
    return { success: false, message: "seat_id not found" }
  }
  seat_id = parseInt(seat_id);
  if (seat_id != room["current_action_player"]) {
    return { success: false, message: "not current action player" }
  }

  if (player["state"] == "fold") {
    return { success: false, message: "the player has folded the cards" }
  }

  player["action_count"] += 1;
  player["last_action_timestamp"] = Date.now();
  room["last_action_timestamp"] = Date.now();
  player["hand_state"] = "all_in";

  var response = {}
  response["m"] = 'all_in';
  response["c"] = "room";
  var data = {};
  data["seat_id"] = seat_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = bet_amount;
  data["action"] = "all_in";
  response["data"] = data;
  //broadcast_to_online_user(response);

  //room["actions"][seat_id] = [];

  return { success: true, data: data }
};


exports.room_deal_hole_cards = function(message) {
    var uid = message.uid;
    var deck = new Deck();
    // var room = rooms[]
    deck.shuffle();
    var room = rooms.filter(room => room["name"] == "test")[0];
    room["deck"] = deck;
    console.log("deck");
    console.log(deck)
    var hole_cards = [];
    hole_cards.push(room["deck"].deal().toString());
    hole_cards.push(room["deck"].deal().toString());
    console.log("hole cards");
    console.log(hole_cards);
    room["fake_hole_cards_status"] = [true, true, true, true, true, true, true, true];
    //save to db
    return { "hole_cards": hole_cards, "player_hole_cards_status": room["fake_hole_cards_status"] }

};

exports.room_deal_flop_cards = function(message) {
    var uid = message.uid;
    var room_id = message.room_id;
    var room = rooms.filter(room => room["name"] == "test")[0];

    var cards = [];
    cards.push(room["deck"].deal().toString());
    cards.push(room["deck"].deal().toString());
    cards.push(room["deck"].deal().toString());
    room["flop"] = cards;

    // fake_hole_cards_status = [true, true, true, true, true, true, true, true];
    return { "cards": cards }

};

exports.room_deal_turn_card = function(message) {
    var uid = message.uid;
    var room_id = message.room_id;
    var room = rooms.filter(room => room["name"] == "test")[0];

    var cards = [];
    cards.push(room["deck"].deal().toString());

    room.turn = cards;
    // fake_hole_cards_status = [true, true, true, true, true, true, true, true];
    return { "cards": cards }

};

exports.room_deal_river_card = function(message) {
    var uid = message.uid;
    var room_id = message.room_id;
    var room = rooms.filter(room => room["name"] == "test")[0];

    var cards = [];
    cards.push(room["deck"].deal().toString());

    room.river = cards;
    // fake_hole_cards_status = [true, true, true, true, true, true, true, true];
    return { "cards": cards }

};

exports.room_reserve_sit = function(message) {

}

exports.createRoom = function(creator, room_conf, gems, ip, port, ) {

};

exports.destroy = function(room_id){
	var room_info = rooms[room_id];
	if(room_info == null){
		return;
	}

	for(var i = 0; i < 4; i++){
		var user_id = roomInfo.seats[i].user_id;
		if(user_id > 0){
			delete user_location[user_id];
			db.set_room_id_of_user(user_id, null);
		}
	}

	delete rooms[room_id];
	total_rooms--;
	db.delete_room(room_id);
}

exports.get_total_rooms = function() {
    return total_rooms;
};

exports.get_room = function(room_id) {
    return rooms[room_id];
};
// rooms can be only created by admins
exports.is_creator = function(room_id, admin_id) {
    var room_info = rooms[room_id];
    if (room_info == null) {
        return false;
    }
    return room_info.conf.creator == admin_id;
};


exports.enter_room = function(room_id, user_id, user_name, callback) {
    var room = rooms[room_id];

};

exports.set_ready = function(user_id, value) {
    var room_id = exports.get_user_room(user_id);
    if (room_id == null) {
        return;
    }

    var room = exports.get_room(room_id);
    if (room == null) {
        return;
    }

    var seat_index = exports.get_user_seat(user_id);
    if (seat_index == null) {
        return;
    }

    var seat = room.seats[seat_index];
    seat.ready = value;
};

exports.is_ready = function(user_id) {
    var room_id = exports.get_user_room(user_id);
    if (room_id == null) {
        return;
    }

    var room = exports.get_room(room_id);
    if (room == null) {
        return;
    }

    var seat_index = exports.get_user_seat(user_id);
    if (seat_index == null) {
        return;
    }

    var seat = room.seats[seat_index];
    return seat.ready;
};

exports.get_user_room = function(user_id) {
    var location = user_location[user_id];
    if (location != null) {
        return location.seat_index;
    }
    return null;
};

exports.get_user_location = function() {
    return user_location;
};

exports.exit_room = function(user_id) {
    var location = user_location[user_id];
    if (location == null) {
        return;
    }

    var room_id = location.room_id;
    var seat_index = location.seat_index;
    var room = rooms[room_id];
    delete user_location[user_id];
    if (room == null || seat_index == null) {
        return;
    }

    var seat = room.seats[seat_index];
    seat.user_id = 0;
    seat.name = "";

    var num_of_players = 0;
    for (var i = 0; i < rooms.length; i++) {
        if (room.seats[i].user_id > 0) {
            num_of_players++;
        }
    }
    db.set_room_id_of_user(user_id, null);
    if (num_of_players == 0) {
        exports.destroy(room_id);
    }
};
