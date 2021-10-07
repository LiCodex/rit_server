//var db = require('../utils/db');
const Deck = require('./deck.js');
const Room = require('../models/room');
const User = require('../models/user');
const ObjectID = require('mongodb').ObjectID;
const jwt = require("jsonwebtoken");
const user_mgr = require('./user_mgr');

var rooms = [{"_id": "608f829787c9b44b2c186f16", "name": "test", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "players_count": 0, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": []},{"_id": "6119cbab01f8ca1b5e7ed509", "name": "test_medium1", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "players_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "total_players_count": 0, "current_action_player": 0, "round": 0, "duaration": 90, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "chair_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "chair_id": 1, "money_on_the_table": 100}]}, {"_id": "6119cbd101f8ca1b5e7ed50a", "name": "test_medium2", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "players_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "duaration": 90, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "chair_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "chair_id": 1, "money_on_the_table": 100}]}, {"_id": "6119cbdb01f8ca1b5e7ed50b", "name": "test_medium3", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "players_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "duaration": 90, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "chair_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "chair_id": 1, "money_on_the_table": 100}]} ];
var creating_rooms = {};

var user_location = {};
var total_rooms = 0;
var START_TIMER = 1;

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

async function check_start(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  console.log("check start")
  var active_players = 0;
  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["game_state"] != "sit_out" && room["players"][i]["money_on_the_table"] > 0) {
      active_players++;
    }
  }
  if (active_players >= 2) {
    room["time_state"] = 'start';
    delay_action(room_id);
  }

};

function delay_action(room_id) {
  console.log("delay action");
  var room = rooms.filter(room => room["name"] == "test")[0];

  game_action(room["_id"]);
  setTimeout(function() {
    console.log("in timeout");
    if (room["game_finished"] != true) {
      delay_action(room["_id"]);
    }
  }, 1000);
};

function is_all_fold(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var active_player = room["players"].filter(player => player["state"] != "sit_out");
  var folded_player = active_player.filter(player => player["state"] == "fold");
  if (active_player.length - folded_player.length == 1) {
    return true;
  } else {
    return false;
  }
};

function game_player_all_fold(room_id) {
  game_result(room_id);
};

function action_declared(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  // var active_players = room["players"].filter(player => player["state"] != "sit_out" && player["state"] != "fold");
  for (var i = 0; i < room["players"].length; i++) {
    if (room["action_declare_list"] == null) {
      var is_declared = false;
    } else {
      var declare_list = room["action_declare_list"].filter(elem => elem["chair_id"] == room["players"][i]["chair_id"]);
      var is_declared = declare_list.length == 0 ? false: true;
    }

    if (is_declared == false) {
      if (is_active(room["players"][i]) && !is_all_in(room["players"][i])) {
        return false;
      }
    }
  }
  return true;
};

function is_active(player) {
  return player["state"] != "fold" && player["state"] != "sit_out" && player["state"] != "buy_in";
};

function is_all_in(player) {
  return player["state"] == "all_in"
};

function has_all_in(players) {
  for (var i = 0; i < players.length; i++) {
    if (players[i]["state"] == "all_in") {
      return true;
    }
  }
  return false;
};

function game_action(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var all_fold = is_all_fold(room_id);
  if (all_fold && room["hand_state"] == "game_result") {
    game_player_all_fold(room_id);
  }

  var is_action_declared = action_declared();
  var has_player_all_in = has_all_in(room["players"]);

  if (is_action_declared && has_player_all_in && room["time_state"] == "game_result")
  {
    if (room["hand_state"] == "game_result") {
      return;
    } else {
      direct_settlement(room_id);
      return;
    }
  }
  if (room["time_state"] == "start") {
    delay_game_start(room_id);
    return;
  }
  if (room["time_state"] == "preflop") {
    game_preflop(room_id);
    return;
  }
  if (room["time_state"] == "flop") {
    game_flop(room_id);
    return;
  }
  if (room["time_state"] == "turn") {
    game_turn(room_id);
    return;
  }
  if (room["time_state"] == "river") {
    game_river(room_id);
    return;
  }
  if (room["time_state"] == "game_result") {
    game_result(room_id);
    return;
  }
};

function delay_game_start(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  if (room["last_acted_at"] == null) {
    room["last_acted_at"] = Date.now();
    return;
  }

  if (Date.now() - room["last_acted_at"] <= START_TIMER) {
    return;
  }

  if (room["game_state"] != "start") {
    game_start(room_id);
    return;
  }
};

function game_start(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  //room["game_state"] = "playing";
  room["game_state"] = "playing";
  room["hand_state"] = "start";

  if (room["rounds"] == 0) {
    room["created_at"] = Date.now();
  }
  room["round"] += 1;

  var player_count = 0;
  for (var i = 0; i < room["players"].length; i++) {
    var player = room["players"][i];
    if (player["money_on_the_table"] > 0) {
      player["state"] = "default";
      player_count += 1;
    }
  }

  if (room["button"] == null) {
    room["button"] = rnd_button();
  } else {
    room["button"] = get_next(room, room["button"]);
  }

  if (room["button"]) {
    // heads up
    if (player_count == 2) {
      room["smallblind_id"] = room["button"];
    } else {
      room["smallblind_id"] = get_next(room, room["button"]);
    }
    var player = room["players"].filter(player => player["chair_id"] == room["smallblind_id"])[0];
    console.log("bug fix chair_id");
    player["state"] = "smallblind";
    console.log(player["chair_id"], player["state"]);
  }
  console.log("smallblind id");
  console.log(room["smallblind_id"]);
  if (room["smallblind_id"])
  {
    room["bigblind_id"] = get_next(room, room["smallblind_id"]);
    console.log("bigblind id");
    console.log(room["bigblind_id"]);
    var player = room["players"].filter(player => player["chair_id"] == room["bigblind_id"])[0];
    console.log("player");
    console.log(player);
    player["state"] = "bigblind";
  }
  console.log("actions");
  console.log(player);
  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["actions"] != []) {
      console.log(room["players"][i]["actions"]);
      room["players"][i]["actions"] = [];
    }
  }
  var response = {};
  response["m"] = "start";
  response["c"] = "room";
  broadcast_in_room(room_id, response);

  smallblind();

};

function game_preflop(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  // if all the rest of the cards need to be dealt without more action
  if (room["deal_rest"] == true) {
    return;
  }
  var is_action_declared = action_declared();
  if (is_action_declared == true) {
    deal_flop_cards(room_id);
    return;
  }

  if (room["last_bet_time"] == null) {
    return;
  }

  if ((Date.now() - room["last_bet_time"] >= room["XZTIMER"])) {
    time_out_fold(room_id);
  }
};

function time_out_fold(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  room["ctx_seq"] += 1;
  var actions = room["player"].filter(player => player["chair_id"] == chair_id)[0]["actions"];
  var player = room["player"].filter(player => player["chair_id"] == chair_id)[0];
  player["declare_count"] += 1;
  player["last_declared_at"] = Date.now();
  room["last_acted_at"] = Date.now();
  room["action_declare_list"].push({chair_id: chair_id, action_declared: true});
};
//
function broadcast_user_update(room_id, chair_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(player => player["chair_id"] == chair_id)[0];
  for (var i = 0; i < room["players"].length; i++) {
    var response = {};
    response["m"] = "user_update";
    response["c"] = "room";
    var data = {};
    data["timer"] = room["timer"];
    data["ctx_seq"] = room["ctx_seq"];
    data["button"] = room["button"];
    data["chair_id"] = room["chair_id"];
    data["smallblind_id"] = room["smallblind_id"];
    data["bigblind_id"] = room["bigblind_id"];
    data["current"] = room["current"];
    data[""]
  }

};

function game_flop(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];

  if (room["deal_rest"] == true) {
    return;
  }
  var is_action_declared = action_declared();
  if (is_action_declared == true) {
    deal_turn_card(room_id);
    return;
  }

  if (room["last_bet_time"] == null) {
    return;
  }

  if ((Date.now() - room["last_bet_time"] >= room["XZTIMER"])) {
    time_out_fold(room_id);
  }
};

function game_actions(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  // reset timer
  room["XZTIMER"] = 15;
  room["ctx_seq"] += 1;
  room["last_acted_at"] = Date.now();
  room["timer"] = room["XZTIMER"] - (Date.now() - room["last_acted_at"]);

  var chair_id = get_next(room, room["current"]);
  room["current"] = chair_id;

  var current_player = room["players"][chair_id];
  current_player["state"] = "thinking";
  for (var i = 0; i < room["players"].length; i++) {
    console.log("game action");
  }
};

function rnd_button(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["game_state"] == "playing") {
      return room["players"][i]["chair_id"];
    }
  }
};

exports.room_join = async function(message) {
    var room_id = message.room_id;
    var o_id = new ObjectID(room_id);
    var user_id = message.user_id;
    var room = rooms.filter(room => room["_id"] == room_id)[0];
    console.log("room");
    console.log(room);

    room["total_players_count"] += 1;

    Room.findOne({ _id: o_id }, function (err, room) {
      room.total_players_count += 1;
      room.save();
    });

    return { success: true, players: room["players"] }
};

exports.room_quit = async function(message) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var uid = message.uid;
  console.log("room players");
  console.log(room["players"]);
  var player = room["players"].filter(player => player["uid"] == uid)[0];
  console.log("player");
  console.log(player);

  if (player == undefined) {
    Room.findOne({ name: "test" }, function (err, room) {
      room.total_players_count -= 1;
      room.save();
    });
    return { success: true }
  } else {
    if (player["money_on_the_table"] > 0) {
      User.findOne({ _id: uid }, function (err, user) {
        user.coins += player["money_on_the_table"];
        user.save();
      });
    }

    room["players"] = room["players"].filter(player => (player["uid"] != uid));
    room["players_count"]--;
    Room.findOne({ name: "test" }, function (err, room) {
      room.players_count -= 1;
      room.total_players_count -= 1;
      room.save();
    });
    return { success: true }
  }

};

exports.room_add_time = async function(message) {
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

exports.room_sit = async function(message) {
  var uid = message.uid;
  var chair_id = message.chair_id;
  var room = rooms.filter(room => room["name"] == "test")[0];

  if (chair_id > room["seat_count"]) {
    return { success: false, message: "the chair_id exceeds room chair_count" }
  }

  var player = room["players"].filter(player => player["chair_id"] == chair_id)[0];
  if (player != undefined) {
    return { success: false, message: "there is already a player on the seat" }
  }
  //needs to read from the db
  player = {"uid": uid, "hand_state": "default", "game_state": "waiting", "chair_id": chair_id, "money_on_the_table": 0 }
  room["players"].push(player);
  room["players_count"]++;
  Room.findOne({ name: "test" }, function (err, room) {
    room.players_count += 1;
    room.save();
  });

  return { success: true, chair_id: chair_id }
  // check_start(room["_id"]);
};

exports.hall_user_profile = async function(message) {
  var result;
  res = user_coins_helper(message.uid);
  await Promise.resolve(res).then(function(val) {
    console.log("val");
    console.log(val);
    result = val;
  });
  return result;

};

async function user_coins_helper(uid) {
  var user = await User.findOne({ _id: uid });
  if (user == undefined) {
    return { success: false, message: "user cannot be found" }
  } else {
    return { success: true, coins: user.coins, avatar: user.avatar }
  }
};



exports.room_standup = async function(message) {
  var uid = message.uid;
  var room = rooms.filter(room => room["name"] == "test")[0];

  var player = room["players"].filter(player => player["uid"] == uid)[0];
  if (player == undefined) {
    return { success: false, message: "user is not on the table" }
  }
  //needs to read from the db
  if (player["money_on_the_table"] > 0) {

    User.findOne({ _id: uid }, function (err, user) {
      user.coins += player["money_on_the_table"];
      user.save();
    });
  }

  room["players"] = room["players"].filter(player => (player["uid"] != uid));
  room["players_count"]--;

  Room.findOne({ name: "test" }, function (err, room) {
    room.players_count -= 1;
    room.save();
  });
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
  var rooms = [{"_id": "608f829787c9b44b2c186f16", "name": "test", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "players_count": 0, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": []},{"_id": "6119cbab01f8ca1b5e7ed509", "name": "test_medium1", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "players_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "total_players_count": 0, "current_action_player": 0, "round": 0, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "chair_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "chair_id": 1, "money_on_the_table": 100}]}, {"_id": "6119cbd101f8ca1b5e7ed50a", "name": "test_medium2", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "players_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "chair_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "chair_id": 1, "money_on_the_table": 100}]}, {"_id": "6119cbdb01f8ca1b5e7ed50b", "name": "test_medium3", "deck": [], "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "players_count": 2, "last_action_timestamp": Date.now(), "XZTIMER": 15, "small_blind": 1, "big_blind": 2, "current_action_player": 0, "round": 0, "players": [{"uid": "61196590e0f26367a6ea43d4", "hand_state": "default", "game_state": "playing", "chair_id": 0, "money_on_the_table": 400}, { "uid": "61196878e0f26367a6ea43d5", "hand_state": "default", "game_state": "sit_out", "chair_id": 1, "money_on_the_table": 100}]} ];
  return { success: true }
};

exports.room_testing = function() {
  return { room: room }
};

exports.index_login = function(message) {
  var token = message.jwt;
  // console.log(token);
  var decoded = jwt.decode(token);
  // console.log(decoded);
  var response = {};
  response.uid = decoded._id;
  response.room_id = "";
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
    button = rnd_button(room["_id"]);
    room["button"] = button;
    room["players"]["button"] = true;
  } else {
    room["button"] = get_next(room, room["button"]);
  }

  if (room["button"] != undefined) {
  }
  smallblind();
};

function smallblind() {
  // console.log("in smallblind");
  var room = rooms.filter(room => room["name"] == "test")[0];
  room["hand_state"] = "small_blind";
  room["ctx_seq"] += 1;
  room["current"] = room[smallblind_id];

  if (room["smallblind_id"] != null) {
    var player = room["players"].filter(player => player["chair_id"] == room[smallblind_id]);
    player["money_on_the_table"] -= room["small_blind"];
    room["betting_list"][smallblind_id] = room["betting_list"][smallblind_id] ? room["betting_list"][smallblind_id] : 0;
    room["betting_list"][smallblind_id] += small_blind;
  }

  var response = {};
  response["m"] = "small_blind";
  response["c"] = "room";

  var data = {};
  data["betting_amount"] = room["small_blind"];
  data["chair_id"] = room["smallblind_id"];
  response["data"] = data;
  //broadcast
  broadcast_in_room(room_id, response);
  broadcast_userupdate(room["current"]);
  bigblind();
};

function bigblind() {
  // console.log("in smallblind");
  var room = rooms.filter(room => room["name"] == "test")[0];
  room["hand_state"] = "big_blind";
  room["ctx_seq"] += 1;
  room["current"] = room[bigblind_id];

  if (room["bigblind_id"] != null) {
    var player = room["players"].filter(player => player["chair_id"] == room[smallblind_id]);
    player["money_on_the_table"] -= room["small_blind"];
    room["betting_list"][smallblind_id] = room["betting_list"][smallblind_id] ? room["betting_list"][smallblind_id] : 0;
    room["betting_list"][smallblind_id] += small_blind;
  }

  var response = {};
  response["m"] = "big_blind";
  response["c"] = "room";

  var data = {};
  data["betting_amount"] = room["big_blind"];
  data["chair_id"] = room["bigblind_id"];
  response["data"] = data;
  //broadcast
  broadcast_in_room(room_id, response);
  broadcast_userupdate(room["current"]);
  deal_hole_cards();
};



exports.room_buy_in = async function(message) {
  var uid = message.uid;
  var room_id = message.room_id;
  var amount = message.amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var chair_id = message.chair_id;
  var total_assets = 0;
  var player = room["players"].filter(player => player["chair_id"] == chair_id)[0];
  var user = User.findOne({_id: uid});
  if (amount == undefined) {
    return { success: false, amount: 0, message: "amount not provided"}
  }
  else if (player["money_on_the_table"] + amount > room["max_buy_in"]) {
    return { success: false, amount: player["money_on_the_table"] , message: "added amount exceeds table max buy in" }
  } else if(user.coins < amount) {
    return { success: false, amount: player["money_on_the_table"] , message: "do not have enough money in the bank" }
  }
  else {
    player["money_on_the_table"] += amount;
    player["game_state"] = "playing";
    await User.findOne({ _id: uid }, function (err, user) {
      user.coins -= amount;
      total_assets = user.coins;
      console.log("total_assets1");
      console.log(total_assets);
      user.save();
    });
    // console.log("total_assets2");
    // console.log(total_assets);
    console.log("before check start");
    check_start(room["_id"]);
    console.log("after check start");
    return { success: true, amount: player["money_on_the_table"], total_assets: total_assets, message: "success" }
  }
};

exports.room_fold = function(message) {
  var uid = message.uid;
  var chair_id = message.chair_id;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(player => player["chair_id"] == chair_id)[0];
  if (chair_id == undefined) {
    return { success: false, message: "chair_id not found" }
  }
  chair_id = parseInt(chair_id);
  if (chair_id != room["current_action_player"]) {
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
  data["chair_id"] = chair_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = 0;
  data["action"] = "fold";
  response["data"] = data;
  //broadcast_to_online_user(response);

  //room["actions"][chair_id] = [];

  return { success: true }
};

exports.room_call = function(message) {
  var uid = message.uid;
  var chair_id = message.chair_id;
  var bet_amount = message.bet_amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(player => player["chair_id"] == chair_id)[0];
  if (chair_id == undefined) {
    return { success: false, message: "chair_id not found" }
  }
  chair_id = parseInt(chair_id);
  if (chair_id != room["current_action_player"]) {
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
  data["chair_id"] = chair_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = message.bet_amount;
  data["action"] = "call";
  response["data"] = data;
  //broadcast_to_online_user(response);

  //room["actions"][chair_id] = [];

  return { success: true, data: data }
};

exports.room_raise = function(message) {
  var uid = message.uid;
  var chair_id = message.chair_id;
  var bet_amount = message.bet_amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  console.log("players");
  console.log(room["players"]);
  var player = room["players"].filter(player => player["chair_id"] == chair_id)[0];
  console.log("player");
  console.log(player);
  if (chair_id == undefined) {
    return { success: false, message: "chair_id not found" }
  }
  chair_id = parseInt(chair_id);
  if (chair_id != room["current_action_player"]) {
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
  data["chair_id"] = chair_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = message.bet_amount;
  data["action"] = "raise";
  response["data"] = data;
  //broadcast_to_online_user(response);

  //room["actions"][chair_id] = [];
  console.log("data");
  console.log(data);
  return { success: true, data: data }
};

exports.room_all_in = function(message) {
  var uid = message.uid;
  var chair_id = message.chair_id;
  var bet_amount = message.bet_amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(player => player["chair_id"] == chair_id)[0];
  if (chair_id == undefined) {
    return { success: false, message: "chair_id not found" }
  }
  chair_id = parseInt(chair_id);
  if (chair_id != room["current_action_player"]) {
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
  data["chair_id"] = chair_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = bet_amount;
  data["action"] = "all_in";
  response["data"] = data;

  return { success: true, data: data }
};


function deal_hole_cards(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var deck = new Deck();
  var hole_cards = [];
  room["deck"] = deck;
  deck.shuffle();

  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["status"] != "sit_out") {
      hole_cards = [];
      hole_cards.push(room["deck"].deal().toString());
      hole_cards.push(room["deck"].deal().toString());
      room["players"][i]["hole_cards"] = hole_cards;

      var uid = room["players"][i]["uid"];
      var ws = user_mgr.get(uid);
      var response = {};
      var data = {};
      response["m"] = "deal_hole_cards";
      response["c"] = "room";
      response["data"] = data;
      response["data"]["hole_cards"] = hole_cards;
      console.log("before deal hole cards");
      ws.send(JSON.stringify(response));
      console.log("after deal hole cards");
    }
  }
  room["game_state"] = "preflop";
  room["time_state"] = "preflop";
  room["action_declare_list"] = [];
  //game_action();
  // console.log("deal hole cards");
  // console.log(room);
};

// function game_action() {
//   var room = rooms.filter(room => room["name"] == "test")[0];
//   room["ctx_seq"] = (room["ctx_seq"] == undefined) ? 1 : room["ctx_seq"] + 1;
//   room["last_action_timestamp"] = Date.now();
//
//   room["current"] = room["smallblind_id"];
//   //var chair_id = room["smallblind_id"];
//   console.log("current chair_id");
//   console.log(room);
//   var player_cur = room["players"].filter(player => player["chair_id"] == (room["smallblind_id"]))[0];
//   player_cur["hand_state"] = "thinking";
//   for (var i = 0; i < room["players"].length; i++) {
//     if (room["players"][i]["status"] != "sit_out") {
//       hole_cards = [];
//       hole_cards.push(room["deck"].deal().toString());
//       hole_cards.push(room["deck"].deal().toString());
//       room["players"][i]["hole_cards"] = hole_cards;
//
//       var uid = room["players"][i]["uid"];
//       var ws = user_mgr.get(uid);
//       var response = {};
//       response["m"] = "room";
//       response["c"] = "start_timer";
//       var data = {};
//       data["started_at"] = Date.now();
//       data["duaration"] = room["XZTIMER"];
//       data["chair_id"] = player_cur["chair_id"];
//       response.data = data;
//       ws.send(JSON.stringify(response));
//     }
//   }
//   wait_for_action();
//
// };

function wait_for_action() {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var time_out = setTimeout(function() {
    time_out_fold();
  }, XZTIMER * 1000);
};

function time_out_fold() {
  console.log("timeout");
  var room = rooms.filter(room => room["name"] == "test")[0];
  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["status"] != "sit_out") {
      var uid = room["players"][i]["uid"];
      var ws = user_mgr.get(uid);
      var response = {};
      response["m"] = "room";
      response["c"] = "time_out";
      var data = {};
      data["message"] = "15s has passed has to fold";
      response.data = data;
      ws.send(JSON.stringify(response));
    }
  }
}

function get_next(room, chair_id) {
  room["players"].sort((player1, player2) => player1["chair_id"] - player2["chair_id"]);
  console.log("room");
  console.log(room["players"]);
  for (var i = 0; i < room["players"].length; i++) {
    console.log("sort testing");
    console.log(room["players"][i]["chair_id"]);
  }
  var current_index = 0
  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["chair_id"] == chair_id) {
      current_index = i;
      break;
    }
  }
  current_index += 1;
  current_index = (current_index - 1)%room["players"].length + 1;
  console.log("current index");
  console.log(current_index);
  console.log(room["players"]);
  
  return room["players"][current_index]["chair_id"];
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
    for (var i = 0; i < room["players"].length; i++) {
      if (room["players"][i]["status"] != "sit_out") {

        var uid = room["players"][i]["uid"];
        var ws = user_mgr.get(uid);
        var response = {};
        var data = {};
        response["m"] = "deal_flop_cards";
        response["c"] = "room";
        response["data"] = data;
        response["data"]["card_array"] = cards;
        console.log("before deal hole cards");
        ws.send(JSON.stringify(response));
        console.log("after deal hole cards");
      }
    }
    // fake_hole_cards_status = [true, true, true, true, true, true, true, true];
    //return { "cards": cards }

};


exports.room_deal_turn_card = function(message) {
    var uid = message.uid;
    var room_id = message.room_id;
    var room = rooms.filter(room => room["name"] == "test")[0];

    var cards = [];
    cards.push(room["deck"].deal().toString());

    room["turn"] = cards;
    for (var i = 0; i < room["players"].length; i++) {
      if (room["players"][i]["status"] != "sit_out") {

        var uid = room["players"][i]["uid"];
        var ws = user_mgr.get(uid);
        var response = {};
        var data = {};
        response["m"] = "deal_turn_card";
        response["c"] = "room";
        response["data"] = data;
        response["data"]["card_array"] = cards;
        console.log("before deal hole cards");
        ws.send(JSON.stringify(response));
        console.log("after deal hole cards");
      }
    }
    // fake_hole_cards_status = [true, true, true, true, true, true, true, true];
    //return { "cards": cards }

};

exports.room_deal_river_card = function(message) {
    var uid = message.uid;
    var room_id = message.room_id;
    var room = rooms.filter(room => room["name"] == "test")[0];

    var cards = [];
    cards.push(room["deck"].deal().toString());

    room["river"] = cards;
    for (var i = 0; i < room["players"].length; i++) {
      if (room["players"][i]["status"] != "sit_out") {

        var uid = room["players"][i]["uid"];
        var ws = user_mgr.get(uid);
        var response = {};
        var data = {};
        response["m"] = "deal_river_card";
        response["c"] = "room";
        response["data"] = data;
        response["data"]["card_array"] = cards;
        console.log("before deal hole cards");
        ws.send(JSON.stringify(response));
        console.log("after deal hole cards");
      }
    }
    // fake_hole_cards_status = [true, true, true, true, true, true, true, true];
    //return { "cards": cards }

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

exports.room_show_hand = async function(message) {
    var room_id = message.room_id;
    var o_id = new ObjectID(room_id);
    var user_id = message.user_id;
    var room = rooms.filter(room => room["name"] == "test")[0];

    // Room.findOne({ _id: o_id }, function (err, room) {
    //   room.total_players_count += 1;
    //   room.save();
    // });

    //return { success: true, card1: , card2: }
};

function get_context(room_id) {
  var room_id = message.room_id;
  var o_id = new ObjectID(room_id);
  var user_id = message.user_id;
  var room = rooms.filter(room => room["name"] == "test")[0];

  return { success: true, room: room }
}

exports.room_load_context = async function(message) {
  var room_id = message.room_id;
  var o_id = new ObjectID(room_id);
  var user_id = message.user_id;
  var room = rooms.filter(room => room["name"] == "test")[0];

  return { success: true, room: room }
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
};

function game_betting(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var all_fold = is_all_fold(room_id);
  // only one player exists and
  if (all_fold == true && room["game_state"] != "game_result") {
    game_all_fold();
    return;
  }
  var action_declared = is_action_declared();
  var all_in = is_all_in();
  if (action_declared == true && all_in == true && room["game_state"] != "game_result") {
    direct_settlement();
    return;
  }
  if (room["state"] == "preflop") {
    preflop_action();
    return;
  }
  if (room["state"] == "flop") {
    flop_action();
    return;
  }
  if (room["state"] == "turn") {
    turn_action();
    return;
  }
  if (room["state"] == "river") {
    river_action();
    return;
  }
};

function sort_room(room) {
  room.sort(function(a, b) {return a["chair_id"] - b["chair_id"]});
};

function all_players_fold() {
  var active_count = 0;
  var room = rooms.filter(room => room["name"] == "test")[0];
  for (var i = 0; i < room["players"].length; i++) {
    active_count++;
  }

  return active_count == 1;
};

exports.user_showhands = function(message) {
  var uid = message.uid;
  var show_status = message.data.show_status;
  var chair_id = message.chair_id;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(player => player["chair_id"] == chair_id)[0];
  if (room["room_status"] != "game_result") {
    return { success: false, message: "room status is not game result, cannot show card yet" }
  }
  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["status"] != "sit_out") {
      // room["players"][i]["hole_cards"] = hole_cards;
      var uid = room["players"][i]["uid"];
      var ws = user_mgr.get(uid);
      var response = {};
      response["m"] = "room";
      response["c"] = "showcard";
      var data = {};
      data["show_status"] = show_status;
      data["chair_id"] = chair_id;
      data["hole_cards"] = player["hole_cards"];
      response.data = data;
      ws.send(JSON.stringify(response));
    }
  }
};

exports.winner_showhands = function(message) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  //var player = room["players"].filter(player => player["chair_id"] == chair_id)[0];
  if (room["room_status"] != "game_result") {
    return { success: false, message: "room status is not game result, cannot show card yet" }
  }
  var res = [];
  for (var i = 0; i < room["players"].length; i++) {
    var tmp = { "chair_id": room["players"][i]["chair_id"], "hole_cards": room["players"][i]["hole_cards"] }
    res << tmp;
  }
  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["status"] != "sit_out") {
      var uid = room["players"][i]["uid"];
      var ws = user_mgr.get(uid);
      var response = {};
      response["m"] = "";
      response["c"] = "winner_showhands";
      var data = {};
      data["player_hole_cards"] = res;
      response.data = data;
      ws.send(JSON.stringify(response));
    }
  }
};

function broadcast_userupdate(chair_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(player => player["chair_id"] == chair_id)[0];
  for (var i = 0; i < room["players"].length; i++) {
    var response = {};
    response["m"] = "user_update";
    response["c"] = "room";
    var data = {};
    data["timer"] = room["timer"];
    data["ctx_seq"] = room["ctx_seq"];
    data["button"] = room["button"];
    data["chair_id"] = room["chair_id"];
    data["smallblind_id"] = room["smallblind_id"];
    data["bigblind_id"] = room["bigblind_id"];
    data["current"] = room["current"];
    var community_cards = [];
    if (room["flop"] != [] && room["flop"] != null) {
      community_cards.push(room["flop"]);
    }
    if (room["turn"] != [] && room["turn"] != null) {
      community_cards.push(room["turn"]);
    }
    if (room["river"] != [] && room["river"] != null) {
      community_cards.push(room["river"]);
    }
    data["community_cards"] = community_cards;
    response["data"] = data;
    var uid = room["players"][i]["uid"];
    var ws = user_mgr.get(uid);
    ws.send(JSON.stringify(response));
  }
};

function delay_betting() {
  game_betting();
  setTimeout(function() {
    var room = rooms.filter(room => room["name"] == "test")[0];
    if (room["finished"] != true) {
      delay_betting();
    }
  }, 1000);
};


function preflop_action(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  if (room["deal_rest"]) {
    return;
  }
  var is_action_declared = action_declared();
  if (is_action_declared) {
    exports.room_deal_flop_cards(room_id);
    return;
  }

  if (room["last_bet_time"] == undefined) {
    return;
  }
  if (Date.now() - room["last_bet_time"] > room["XZTIMER"]) {
    time_out_fold(room_id);
  }

};

function turn_action(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  if (room["deal_rest"]) {
    return;
  }
  var is_action_declared = action_declared();
  if (is_action_declared) {
    exports.room_deal_turn_cards(room_id);
    return;
  }

  if (room["last_bet_time"] == undefined) {
    return;
  }
  if (Date.now() - room["last_bet_time"] > room["XZTIMER"]) {
    time_out_fold(room_id);
  }
};

function river_action(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  if (room["deal_rest"]) {
    return;
  }
  var is_action_declared = action_declared();
  if (is_action_declared) {
    exports.room_deal_river_cards(room_id);
    return;
  }

  if (room["last_bet_time"] == undefined) {
    return;
  }
  if (Date.now() - room["last_bet_time"] > room["XZTIMER"]) {
    time_out_fold(room_id);
  }
};


function game_result(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  if (room["last_game_result_time"] == undefined) {
    return;
  }
  if (Date.now() - room["created_at"] >= room["duaration"] * 60) {
    game_dismiss(room_id);
  } else {
    game_reset(room_id);
    active_players = active_player_count(room_id);
    if (active_players >= 2) {
      room["time_state"] = "start";
    }

  }

};

function game_dismiss(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  for (var i = 0; i < room["players"].length; i++) {
    var response = {};
    var data = {};
    response["m"] = "game_dismiss";
    response["c"] = "room";
    var uid = room["players"][i]["uid"];
    var ws = user_mgr.get(uid);
    ws.send(JSON.stringify(response));
    var player = room["players"][i];
    if (player["money_on_the_table"] > 0) {
      User.findOne({ _id: uid }, function (err, user) {
        user.coins += player["money_on_the_table"];
        user.save();
      });
    }
  }
  room["state"] = "dismiss";
  room["finished"] = true;
};


function broadcast_in_room(room_id, response) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  for (var i = 0; i < room["players"].length; i++) {
    var uid = room["players"][i]["uid"];
    var ws = user_mgr.get(uid);
    ws.send(JSON.stringify(response));
  }
};
