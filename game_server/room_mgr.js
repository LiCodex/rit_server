//var db = require('../utils/db');
const Deck = require('./deck.js');
var rooms = {"test": {"deck": [], "players": [{"seat_id": 0, "money_on_the_table": 1000, "money_in_the_bank": 3000}, {"seat_id": 1, "money_on_the_table": 1000, "money_in_the_bank": 1000}]}};
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


exports.room_sit = function(message) {
    var uid = message.uid;
    var amount = message.amount;

};


exports.room_refresh = function() {
  rooms = {"test": {"deck": [], "players": [{"seat_id": 0, "money_on_the_table": 1000, "money_in_the_bank": 3000}, {"seat_id": 1, "money_on_the_table": 1000, "money_in_the_bank": 1000}]}};
  return { success: true }
};

exports.room_action_buy_in = function(message) {
    var uid = message.uid;
    var room_id = message.room_id;
    var amount = message.chips;
    var room = rooms["test"];
    var seat_id = message.seat_id;
    var player = room["players"].filter(player => player["seat_id"] == seat_id);
    console.log("money in the bank")
    console.log(player["money_in_the_bank"]);
    if (amount == undefined) {
      return { success: false, added_amount: 0, message: "amount not provided"}
    }
    else if (player["money_in_the_bank"] < amount) {
      console.log("not enough money");
      console.log(amount);
      return { success: false, added_amount: 0, message: "do not have enough money" }
    } else {
      player["money_on_the_table"] += amount;
      player["money_in_the_bank"] -= amount;
      console.log("has enough money");
      console.log(amount);
      return { success: true, added_amount: amount, message: "success" }
    }
};

exports.room_call = function() {
  rooms = {"test": {"deck": [], "players": [{"seat_id": 0, "money_on_the_table": 1000, "money_in_the_bank": 3000}, {"seat_id": 1, "money_on_the_table": 1000, "money_in_the_bank": 1000}]}};
  return { success: true }
};


exports.room_deal_hole_cards = function(message) {
    var uid = message.uid;
    var deck = new Deck();
    // var room = rooms[]
    deck.shuffle();
    rooms["test"]["deck"] = deck;
    console.log("deck");
    console.log(deck)
    var hole_cards = [];
    hole_cards.push(rooms["test"]["deck"].deal().toString());
    hole_cards.push(rooms["test"]["deck"].deal().toString());
    console.log("hole cards");
    console.log(hole_cards);
    rooms["test"]["fake_hole_cards_status"] = [true, true, true, true, true, true, true, true];
    //save to db
    return { "hole_cards": hole_cards, "player_hole_cards_status": rooms["test"]["fake_hole_cards_status"] }

};

exports.room_deal_flop_cards = function(message) {
    var uid = message.uid;
    var room_id = message.room_id;
    var room = rooms["test"];

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
    var room = rooms["test"];

    var cards = [];
    cards.push(room["deck"].deal().toString());

    room.turn = cards;
    // fake_hole_cards_status = [true, true, true, true, true, true, true, true];
    return { "cards": cards }

};

exports.room_deal_river_card = function(message) {
    var uid = message.uid;
    var room_id = message.room_id;
    var room = rooms["test"];

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
