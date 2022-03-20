const Deck = require("./deck.js");
const Pot = require("./pot.js");
const Card = require("./card.js");
const Room = require("../models/room");
const User = require("../models/user");
const HandEvaluator = require("./hand_evaluator");
const ObjectID = require("mongodb").ObjectID;
const jwt = require("jsonwebtoken");
const user_mgr = require("./user_mgr");

var rooms = [
  {
    _id: "608f829787c9b44b2c186f16",
    community_cards: [],
    name: "test",
    pots: [],
    deck: [],
    seat_count: 8,
    min_buy_in: 50,
    max_buy_in: 400,
    players_count: 0,
    last_bet_time: new Date(),
    XZTIMER: 15,
    smallblind: 1,
    bigblind: 2,
    current_action_player: 0,
    round: 0,
    players: [],
    all_players: [],
    action_declare_list: [],
    total_players_count: 0,
    ctx_seq: 0,
    state: "none"
  },
  {
    _id: "6119cbab01f8ca1b5e7ed509",
    name: "test_medium1",
    deck: [],
    seat_count: 8,
    min_buy_in: 50,
    max_buy_in: 400,
    players_count: 2,
    last_bet_time: null,
    XZTIMER: 15,
    smallblind: 1,
    bigblind: 2,
    total_players_count: 0,
    current_action_player: 0,
    round: 0,
    duaration: 90,
    players: [
      {
        uid: "61196590e0f26367a6ea43d4",
        hand_state: "default",
        game_state: "playing",
        chair_id: 0,
        money_on_the_table: 400
      },
      {
        uid: "61196878e0f26367a6ea43d5",
        hand_state: "default",
        game_state: "sit_out",
        chair_id: 1,
        money_on_the_table: 100
      }
    ],
    all_players: [],
    action_declare_list: []
  },
  {
    _id: "6119cbd101f8ca1b5e7ed50a",
    name: "test_medium2",
    deck: [],
    seat_count: 8,
    min_buy_in: 50,
    max_buy_in: 400,
    players_count: 2,
    last_bet_time: null,
    XZTIMER: 15,
    smallblind: 1,
    bigblind: 2,
    current_action_player: 0,
    round: 0,
    duaration: 90,
    players: [
      {
        uid: "61196590e0f26367a6ea43d4",
        hand_state: "default",
        game_state: "playing",
        chair_id: 0,
        money_on_the_table: 400
      },
      {
        uid: "61196878e0f26367a6ea43d5",
        hand_state: "default",
        game_state: "sit_out",
        chair_id: 1,
        money_on_the_table: 100
      }
    ],
    all_players: [],
    action_declare_list: []
  },
  {
    _id: "6119cbdb01f8ca1b5e7ed50b",
    name: "test_medium3",
    deck: [],
    seat_count: 8,
    min_buy_in: 50,
    max_buy_in: 400,
    players_count: 2,
    last_bet_time: null,
    XZTIMER: 15,
    smallblind: 1,
    bigblind: 2,
    current_action_player: 0,
    round: 0,
    duaration: 90,
    players: [
      {
        uid: "61196590e0f26367a6ea43d4",
        hand_state: "default",
        game_state: "playing",
        chair_id: 0,
        money_on_the_table: 400
      },
      {
        uid: "61196878e0f26367a6ea43d5",
        hand_state: "default",
        game_state: "sit_out",
        chair_id: 1,
        money_on_the_table: 100
      }
    ],
    all_players: [],
    action_declare_list: []
  }
];
var creating_rooms = {};
var user_location = {};
var total_rooms = 0;
const START_TIMER = 1;

function generate_room_id() {
  var room_id = "";
  for (let i = 0; i < 6; i++) {
    room_id += Math.floor(Math.random() * 10);
  }
  return room_id;
}

function active_player_count(players) {
  var res = 0;
  for (let i = 0; i < players.length; i++) {
    if (
      (players[i]["game_state"] == "playing" ||
        players[i]["game_state"] == "waiting") &&
      players[i]["money_on_the_table"] > 0
    ) {
      res++;
    }
  }
  return res;
}

async function check_start(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  // console.log("check start")
  var active_players = 0;
  for (var i = 0; i < room["players"].length; i++) {
    if (
      (room["players"][i]["game_state"] == "waiting" || room["players"][i]["game_state"] == "playing") &&
      room["players"][i]["money_on_the_table"] > 0
    ) {
      active_players++;
    }
  }
  console.log("in check start");
  console.log(room);
  if (active_players >= 2) {
    for (var i = 0; i < room["players"].length; i++) {
      if (room["players"][i]["game_state"] == "waiting")
      {
        room["players"][i]["game_state"] = "playing";
      }
    }
  }
  console.log("in check start11");
  console.log(room);
  if (active_players >= 2) {
    if (room["round"] == 0) {
      delay_action(room_id);
    }
    room["state"] = "start";
  }
}

function delay_action(room_id) {
  // console.log("delay action");
  var room = rooms.filter(room => room["name"] == "test")[0];
  game_betting(room_id);
  setTimeout(function() {
    // console.log("in timeout");
    if (room["game_finished"] != true) {
      delay_action(room["_id"]);
    }
  }, 1000);
}

function is_all_fold(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var active_player = room["players"].filter(
    player => player["game_state"] != "sit_out"
  );
  console.log("is_all_fold");
  console.log(active_player);
  var folded_player = active_player.filter(
    player => player["hand_state"] == "fold"
  );
  console.log(folded_player);
  if (active_player.length - folded_player.length == 1) {
    return true;
  } else {
    return false;
  }
}

function game_all_fold(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  // console.log("game all fold");
  // console.log(room["players"]);
  room["direct_settlement"] = true;
  // room["game_state"] = "game_result";
  game_result(room_id);
}

function action_declared(room_id) {
  console.log("in action declared");
  var room = rooms.filter(room => room["name"] == "test")[0];
  // var active_players = room["players"].filter(player => player["state"] != "sit_out" && player["state"] != "fold");
  for (var i = 0; i < room["players"].length; i++) {
    if (room["action_declare_list"] == null) {
      console.log("in action declared1");
      console.log(room);
      var is_declared = false;
    } else {
      var declare_list = room["action_declare_list"].filter(
        elem => elem["chair_id"] == room["players"][i]["chair_id"]
      );
      var is_declared = declare_list.length == 0 ? false : true;
    }

    if (is_declared == false) {
      if (is_active(room["players"][i]) && !is_all_in(room["players"][i])) {
        return false;
      }
    }
  }
  return true;
}

function is_active(player) {
  return (
    player["hand_state"] != "fold" &&
    player["hand_state"] != "sit_out" &&
    player["hand_state"] != "buy_in"
  );
}

function is_all_in(player) {
  return player["state"] == "all_in";
}

function has_all_in(players) {
  for (var i = 0; i < players.length; i++) {
    if (players[i]["state"] == "all_in") {
      return true;
    }
  }
  return false;
}

function game_actions(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  // room["XZTIMER"] = 15;
  room["last_bet_time"] = new Date();
  // console.log("in game actions last bet time");
  // console.log(room["last_bet_time"]);
  room["ctx_seq"] = room["ctx_seq"] ? 1 : room["ctx_seq"] + 1;
  room["timer"] = room["XZTIMER"] - (new Date() - room["last_bet_time"]) / 1000;

  console.log("game actions");
  console.log("prev current");
  console.log(room["current"]);

  var chair_id = get_next(room, room["current"]);
  room["current"] = chair_id;
  console.log("new current");
  console.log(room["current"]);

  var count = 0;
  for (var i = 0; i < room["players"].length; i++) {
    count++;
  }

  var pcur = room["players"].filter(
    player => player["chair_id"] == room["current"]
  )[0];
  pcur["state"] = "thinking";

  for (var i = 0; i < room["players"].length; i++) {
    room["players"][i]["actions"] = [];
  }

  var actions = pcur["actions"];
  // fold is always an action option
  actions.push({ op: "fold" });

  max_bet = max_betting(room["betting_list"]);
  my_bet = room["betting_list"].filter(
    bet => bet["chair_id"] == pcur["chair_id"]
  )[0]["betting_amount"];
  call_amount = max_bet - my_bet;
  if (call_amount == 0) {
    actions.push({ op: "check" });
  }

  // console.log("money on the table");
  // console.log(pcur["money_on_the_table"]);
  // console.log("call amount");
  // console.log(call_amount);

  if (call_amount > 0) {
    if (call_amount >= pcur["money_on_the_table"]) {
      actions.push({ op: "all_in", amount: pcur["money_on_the_table"] });
    } else {
      actions.push({ op: "call", amount: pcur["call_amount"] });
    }
  }
  // var pot = 0;
  // for (var i = 0; i < room["betting_list"].length; i++) {
  //   pot += room["betting_list"][i]["betting_amount"];
  // }

  var pot = get_total_pot(room_id);

  if (pcur["money_on_the_table"] > 2 * pot) {
    actions.push({ op: "raise", amount: 2 * pot, percentage: 1 });
    actions.push({ op: "raise", amount: 0 });
  }
  if (pcur["money_on_the_table"] > 2.5 * pot) {
    actions.push({ op: "raise", amount: 2.5 * pot, percentage: 2 });
  }
  if (pcur["money_on_the_table"] > 3 * pot) {
    actions.push({ op: "raise", amount: 3 * pot, percentage: 3 });
  }
  console.log("show actions");
  console.log(actions);
  pcur["action_type"] = "in_turn";
  broadcast_userupdate_includeme(room_id, room["current"]);
  var players_left = room["players"].filter(player => player["cards_dealt"] == 1 && player["hand_state"] != "fold");
  for (var i = 0; i < players.length; i++) {
    players[i]["action_type"] = "no_turn";
    players[i]["actions"] = [ { op: "fold"} ];
    // players[i]["actions"].push({ op: "call", amount: pot });

    max_bet = max_betting(room["betting_list"]);
    my_bet = room["betting_list"].filter(
      bet => bet["chair_id"] == player["chair_id"]
    )[0]["betting_amount"];
    call_amount = max_bet - my_bet;
    players[i]["action"].push({op: "call", amount: call_amount });
    broadcast_userupdate_includeme(room_id, player["chair_id"]);
  }
}

function max_betting(betting_list) {
  var res = 0;
  for (var i = 0; i < betting_list.length; i++) {
    res = Math.max(res, betting_list[i]);
  }
  return res;
}

function delay_game_start(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  if (room["last_started_at"] == null) {
    room["last_started_at"] = new Date();
    return;
  }

  if (new Date() - room["last_started_at"] <= START_TIMER) {
    return;
  }
  game_start(room_id);

}

function game_start(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  console.log("in game start");
  console.log(room);
  if (room["round"] == 0) {
    room["created_at"] = new Date();
  }
  room["round"] += 1;

  var player_count = 0;
  for (var i = 0; i < room["players"].length; i++) {
    var player = room["players"][i];
    if (player["money_on_the_table"] > 0) {
      player["state"] = "default";
      player_count += 1;
    } else {
      player["state"] = "sit_out";
    }
  }
  console.log("player count");
  console.log(player_count);

  if (room["button"] == null) {
    console.log("button null");
    room["button"] = rnd_button();
  } else {
    console.log("button not null");
    room["button"] = get_next(room, room["button"]);
  }
  console.log("in game start11");
  console.log(room);
  if (room["button"] != null) {
    // heads up

    if (player_count == 2) {
      room["smallblind_id"] = room["button"];
    } else {
      room["smallblind_id"] = get_next(room, room["button"]);
    }
    var player = room["players"].filter(
      player => player["chair_id"] == room["smallblind_id"]
    )[0];
    // console.log("bug fix chair_id");
    player["state"] = "smallblind";
    // console.log(player["chair_id"], player["state"]);
  }
  console.log("in game start22");
  console.log(room);
  // console.log("smallblind id");
  // console.log(room["smallblind_id"]);
  if (room["smallblind_id"] != null) {
    room["bigblind_id"] = get_next(room, room["smallblind_id"]);
    // console.log("bigblind id");
    // console.log(room["bigblind_id"]);
    var player = room["players"].filter(
      player => player["chair_id"] == room["bigblind_id"]
    )[0];
    // console.log("player");
    // console.log(player);
    player["state"] = "bigblind";
  }
  // console.log("actions");
  // console.log(player);
  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["actions"] != []) {
      room["players"][i]["actions"] = [];
    }
  }
  var response = {};
  response["m"] = "start";
  response["c"] = "room";
  broadcast_in_room(room_id, response, "");
  smallblind(room_id);
}

function game_flop(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];

  if (room["deal_rest"] == true) {
    return;
  }
  var is_action_declared = action_declared(room_id);
  if (is_action_declared == true) {
    deal_turn_card(room_id);
    return;
  }

  if (room["last_bet_time"] == null) {
    return;
  }

  if ((new Date() - room["last_bet_time"]) / 1000 >= room["XZTIMER"]) {
    time_out_fold(room_id);
  }
}

function rnd_button(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["game_state"] == "playing") {
      return room["players"][i]["chair_id"];
    }
  }
}

exports.room_join = async function(message) {
  console.log("message");
  console.log(message);
  var room_id = message.room_id;
  var o_id = new ObjectID(room_id);
  var uid = message.uid;
  var room = rooms.filter(room => room["_id"] == room_id)[0];
  // console.log("room");
  // console.log(room);

  console.log("user_id");
  console.log(uid);
  console.log(message);

  room["total_players_count"]++;
  player = { uid: uid };
  room["all_players"].push(player);

  Room.findOne({ _id: o_id }, function(err, room) {
    room.total_players_count += 1;
    room.save();
  });

  return { success: true, players: room["players"] };
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
    Room.findOne({ name: "test" }, function(err, room) {
      room.total_players_count -= 1;
      room.save();
    });
    return { success: true };
  } else {
    if (player["money_on_the_table"] > 0) {
      User.findOne({ _id: uid }, function(err, user) {
        user.coins += player["money_on_the_table"];
        user.save();
      });
    }

    room["players"] = room["players"].filter(player => player["uid"] != uid);
    room["all_players"] = room["all_players"].filter(
      player => player["uid"] != uid
    );
    room["players_count"]--;
    Room.findOne({ name: "test" }, function(err, room) {
      room.players_count -= 1;
      room.total_players_count -= 1;
      room.save();
    });
    return { success: true };
  }
};

exports.room_add_time = async function(message) {
  var room = rooms["test"];
  var chair_id = message.chair_id;
  var player = room["players"].filter(player => player[chair_id] == chair_id);
  if (player["hand_state"] == "fold") {
    return {
      success: false,
      message: "the player has folded the hole cards, cannot add time"
    };
  }
  if (room["current_action_player"] != chair_id) {
    return { success: false, message: "not current player" };
  }

  if (player["money_in_the_bank"] < room["smallblind"]) {
    return { success: false, message: "do not have enough in the bank" };
  }

  room["XZTIMER"] += 15;
  room["current_player_timer"] =
    room["XZTIMER"] - (new Date() - room["last_bet_time"]) / 1000;
  return { success: true, message: "15 seconds have been added" };
};

exports.room_sit = async function(message) {
  var uid = message.uid;
  var chair_id = message.chair_id;
  var room = rooms.filter(room => room["name"] == "test")[0];

  if (chair_id > room["seat_count"]) {
    return { success: false, message: "the chair_id exceeds room chair_count" };
  }

  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  if (player != undefined) {
    return { success: false, message: "there is already a player on the seat" };
  }
  //needs to read from the db
  player = {
    uid: uid,
    hand_state: "default",
    game_state: "waiting",
    chair_id: chair_id,
    money_on_the_table: 0
  };
  room["players"].push(player);
  room["players_count"]++;
  Room.findOne({ name: "test" }, function(err, room) {
    room.players_count += 1;
    room.save();
  });
  var response = {};
  response["m"] = "sit_broad_test";
  response["c"] = "room";
  var data = {};
  data["chair_id"] = chair_id;
  response["data"] = player;
  console.log("sit test");
  console.log(response);
  broadcast_in_room(room["_id"], response, chair_id);

  return { success: true, chair_id: chair_id };
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
    return { success: false, message: "user cannot be found" };
  } else {
    return { success: true, coins: user.coins, avatar: user.avatar };
  }
}

exports.room_standup = async function(message) {
  var uid = message.uid;
  var room = rooms.filter(room => room["name"] == "test")[0];

  var player = room["players"].filter(player => player["uid"] == uid)[0];
  if (player == undefined) {
    return { success: false, message: "user is not on the table" };
  }
  //needs to read from the db
  if (player["money_on_the_table"] > 0) {
    User.findOne({ _id: uid }, function(err, user) {
      user.coins += player["money_on_the_table"];
      user.save();
    });
  }

  room["players"] = room["players"].filter(player => player["uid"] != uid);
  room["players_count"]--;

  Room.findOne({ name: "test" }, function(err, room) {
    room.players_count -= 1;
    room.save();
  });
  //table to bank
  return { success: true, player: room["players"] };
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
}

function table_to_bank(player, amount) {
  // var res = false;
  if (player["money_in_the_bank"] < amount) {
    return false;
  } else {
    player["money_in_the_bank"] -= amount;
    player["money_on_the_table"] += amount;
    return true;
  }
}

exports.room_refresh = function() {
  var rooms = [
    {
      _id: "608f829787c9b44b2c186f16",
      name: "test",
      deck: [],
      seat_count: 8,
      min_buy_in: 50,
      max_buy_in: 400,
      players_count: 0,
      last_bet_time: new Date(),
      XZTIMER: 15,
      smallblind: 1,
      bigblind: 2,
      total_players_count: 0,
      current_action_player: 0,
      round: 0,
      players: []
    },
    {
      _id: "6119cbab01f8ca1b5e7ed509",
      name: "test_medium1",
      deck: [],
      seat_count: 8,
      min_buy_in: 50,
      max_buy_in: 400,
      players_count: 2,
      last_bet_time: new Date(),
      XZTIMER: 15,
      smallblind: 1,
      bigblind: 2,
      total_players_count: 0,
      current_action_player: 0,
      round: 0,
      players: [
        {
          uid: "61196590e0f26367a6ea43d4",
          hand_state: "default",
          game_state: "playing",
          chair_id: 0,
          money_on_the_table: 400
        },
        {
          uid: "61196878e0f26367a6ea43d5",
          hand_state: "default",
          game_state: "sit_out",
          chair_id: 1,
          money_on_the_table: 100
        }
      ]
    },
    {
      _id: "6119cbd101f8ca1b5e7ed50a",
      name: "test_medium2",
      deck: [],
      seat_count: 8,
      min_buy_in: 50,
      max_buy_in: 400,
      players_count: 2,
      last_bet_time: new Date(),
      XZTIMER: 15,
      smallblind: 1,
      bigblind: 2,
      current_action_player: 0,
      round: 0,
      players: [
        {
          uid: "61196590e0f26367a6ea43d4",
          hand_state: "default",
          game_state: "playing",
          chair_id: 0,
          money_on_the_table: 400
        },
        {
          uid: "61196878e0f26367a6ea43d5",
          hand_state: "default",
          game_state: "sit_out",
          chair_id: 1,
          money_on_the_table: 100
        }
      ]
    },
    {
      _id: "6119cbdb01f8ca1b5e7ed50b",
      name: "test_medium3",
      deck: [],
      seat_count: 8,
      min_buy_in: 50,
      max_buy_in: 400,
      players_count: 2,
      last_bet_time: new Date(),
      XZTIMER: 15,
      smallblind: 1,
      bigblind: 2,
      current_action_player: 0,
      round: 0,
      players: [
        {
          uid: "61196590e0f26367a6ea43d4",
          hand_state: "default",
          game_state: "playing",
          chair_id: 0,
          money_on_the_table: 400
        },
        {
          uid: "61196878e0f26367a6ea43d5",
          hand_state: "default",
          game_state: "sit_out",
          chair_id: 1,
          money_on_the_table: 100
        }
      ]
    }
  ];
  return { success: true };
};

exports.room_testing = function() {
  return { room: room };
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

function smallblind(room_id) {
  // console.log("in smallblind");
  var room = rooms.filter(room => room["name"] == "test")[0];
  console.log("in smallblind");
  console.log(room);
  room["state"] = "smallblind";
  room["ctx_seq"] += 1;
  room["current"] = room["smallblind_id"];

  if (room["smallblind_id"] != null) {
    var player = room["players"].filter(
      player => player["chair_id"] == room["smallblind_id"]
    )[0];
    console.log("money on the table was deducted test");
    console.log(player["money_on_the_table"]);
    player["money_on_the_table"] -= room["smallblind"];
    console.log(player["money_on_the_table"]);
    contribute_pot(room_id, room["smallblind"], room["smallblind_id"]);
    if (room["betting_list"] == null) {
      room["betting_list"] = [];
    }
    var elem = room["betting_list"].filter(
      bet => bet["chair_id"] == room["smallblind_id"]
    )[0];
    if (elem != null) {
      elem["betting_amount"] += room["smallblind"];
    } else {
      var record = {};
      record["chair_id"] = room["smallblind_id"];
      record["betting_amount"] = 0;
      record["betting_amount"] += room["smallblind"];
      room["betting_list"].push(record);
    }
  }
  console.log("testing betting list");
  console.log(room["betting_list"]);
  console.log(room["current"]);
  var response = {};
  response["m"] = "smallblind";
  response["c"] = "room";

  var data = {};
  data["betting_amount"] = room["smallblind"];
  data["chair_id"] = room["smallblind_id"];
  response["data"] = data;
  //broadcast
  broadcast_in_room(room_id, response, "");
  broadcast_userupdate_includeme(room_id, room["current"]);
  bigblind(room_id);
}

function bigblind(room_id) {
  // console.log("in smallblind");
  var room = rooms.filter(room => room["name"] == "test")[0];
  room["state"] = "bigblind";
  room["ctx_seq"] += 1;
  room["current"] = room["bigblind_id"];
  //room["last_bet_time"] = new Date();

  if (room["bigblind_id"] != null) {
    var player = room["players"].filter(
      player => player["chair_id"] == room["bigblind_id"]
    )[0];
    player["money_on_the_table"] -= room["bigblind"];
    contribute_pot(room_id, room["bigblind"], room["bigblind_id"]);
    if (room["betting_list"] == null) {
      room["betting_list"] = [];
    }
    var elem = room["betting_list"].filter(
      bet => bet["chair_id"] == room["bigblind_id"]
    )[0];
    if (elem != null) {
      elem["betting_amount"] += room["bigblind"];
    } else {
      var record = {};
      record["chair_id"] = room["bigblind_id"];
      record["betting_amount"] = 0;
      record["betting_amount"] += room["bigblind"];
      room["betting_list"].push(record);
    }
  }

  var response = {};
  response["m"] = "bigblind";
  response["c"] = "room";

  var data = {};
  data["betting_amount"] = room["bigblind"];
  data["chair_id"] = room["bigblind_id"];
  response["data"] = data;
  //broadcast
  broadcast_in_room(room_id, response, "");
  broadcast_userupdate_includeme(room_id, room["current"]);
  console.log("before deal hole cards");
  // console.log(room["game_state"]);
  deal_hole_cards(room_id);
}

exports.room_buy_in = async function(message) {
  console.log("in buy in");
  var uid = message.uid;
  var room_id = message.room_id;
  var amount = message.amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var chair_id = message.chair_id;
  var total_assets = 0;
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  var user = User.findOne({ _id: uid });
  if (amount == undefined) {
    return { success: false, amount: 0, message: "amount not provided" };
  } else if (player["money_on_the_table"] + amount > room["max_buy_in"]) {
    return {
      success: false,
      amount: player["money_on_the_table"],
      message: "added amount exceeds table max buy in"
    };
  } else if (user.coins < amount) {
    return {
      success: false,
      amount: player["money_on_the_table"],
      message: "do not have enough money in the bank"
    };
  } else {
    player["money_on_the_table"] += amount;
    player["game_state"] = "waiting";
    await User.findOne({ _id: uid }, function(err, user) {
      user.coins -= amount;
      total_assets = user.coins;
      console.log("total_assets1");
      console.log(total_assets);
      user.save();
    });
    console.log("before check start");
    console.log(room);
    check_start(room["_id"]);
    console.log("after check start");
    return {
      success: true,
      amount: player["money_on_the_table"],
      total_assets: total_assets,
      message: "success"
    };
  }
};

exports.room_fold = function(message) {
  var uid = message.uid;
  var chair_id = message.chair_id;
  var bet_amount = message.bet_amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var room_id = room["_id"];
  if (chair_id == null) {
    return { success: false, message: "chair_id not found" };
  }
  chair_id = parseInt(chair_id);
  if (chair_id != room["current"]) {
    return { success: false, message: "not current action player" };
  }
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  if (player["state"] == "fold") {
    return { success: false, message: "the player has folded the cards" };
  }

  player["declare_count"] += 1;
  player["last_bet_time"] = new Date();
  room["last_bet_time"] = new Date();
  player["hand_state"] = "fold";
  console.log("room fold last bet time");
  console.log(room);

  var response = {};
  response["m"] = "action";
  response["c"] = "room";
  var data = {};
  data["chair_id"] = chair_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = bet_amount;
  data["type"] = "fold";
  response["data"] = data;
  broadcast_in_room(room_id, response, chair_id);
  if (player["actions"] != []) {
    player["actions"] = [];
  }
  broadcast_userupdate_includeme(room_id, chair_id);
  var is_action_declared = action_declared(room_id);
  var all_fold = is_all_fold(room_id);
  console.log("is_action_declared");
  console.log(is_action_declared);
  console.log("all_fold");
  console.log(all_fold);
  if (!is_action_declared && !all_fold) {
    game_actions(room_id);
  }
};

exports.room_call = function(message) {
  var uid = message.uid;
  var chair_id = message.chair_id;
  var bet_amount = message.bet_amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var room_id = room["_id"];
  if (chair_id == null) {
    return { success: false, message: "chair_id not found" };
  }
  chair_id = parseInt(chair_id);
  if (chair_id != room["current"]) {
    return { success: false, message: "not current action player" };
  }
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  if (player["state"] == "fold") {
    return { success: false, message: "the player has folded the cards" };
  }

  player["declare_count"] += 1;
  player["last_bet_time"] = new Date();
  room["last_bet_time"] = new Date();
  player["hand_state"] = "call";
  console.log("room call last bet time");
  console.log(player["last_bet_time"]);

  var response = {};
  response["m"] = "action";
  response["c"] = "room";
  var data = {};
  data["chair_id"] = chair_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = bet_amount;
  data["type"] = "call";
  response["data"] = data;
  broadcast_in_room(room_id, response, chair_id);
  if (player["actions"] != []) {
    player["actions"] = [];
  }
  broadcast_userupdate_includeme(room_id, chair_id);
  var is_action_declared = action_declared(room_id);
  var all_fold = is_all_fold(room_id);
  if (!is_action_declared && !all_fold) {
    game_actions(room_id);
  }
};

exports.room_raise = function(message) {
  var uid = message.uid;
  var chair_id = message.chair_id;
  var bet_amount = message.bet_amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var room_id = room["_id"];
  if (chair_id == null) {
    return { success: false, message: "chair_id not found" };
  }
  chair_id = parseInt(chair_id);
  if (chair_id != room["current"]) {
    return { success: false, message: "not current action player" };
  }
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  if (player["state"] == "fold") {
    return { success: false, message: "the player has folded the cards" };
  }

  player["declare_count"] += 1;
  player["last_bet_time"] = new Date();
  room["last_bet_time"] = new Date();
  player["hand_state"] = "raise";
  console.log("raising here here here");
  console.log(room);

  var response = {};
  response["m"] = "action";
  response["c"] = "room";
  var data = {};
  data["chair_id"] = chair_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = bet_amount;
  data["type"] = "raise";
  response["data"] = data;
  broadcast_in_room(room_id, response, chair_id);
  if (player["actions"] != []) {
    player["actions"] = [];
  }
  broadcast_userupdate_includeme(room_id, chair_id);
  var is_action_declared = action_declared(room_id);
  var all_fold = is_all_fold(room_id);
  console.log("is action declared");
  console.log(is_action_declared);
  console.log("all_fold");
  console.log(all_fold);
  if (!is_action_declared && !all_fold) {
    game_actions(room_id);
  }
};

exports.room_all_in = function(message) {
  var uid = message.uid;
  var chair_id = message.chair_id;
  var bet_amount = message.bet_amount;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var room_id = room["_id"];
  if (chair_id == null) {
    return { success: false, message: "chair_id not found" };
  }
  chair_id = parseInt(chair_id);
  if (chair_id != room["current"]) {
    return { success: false, message: "not current action player" };
  }
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  if (player["state"] == "fold") {
    return { success: false, message: "the player has folded the cards" };
  }

  player["declare_count"] += 1;
  player["last_bet_time"] = new Date();
  room["last_bet_time"] = new Date();
  player["hand_state"] = "all_in";
  console.log("room all in last bet time");
  console.log(player["last_bet_time"]);

  var response = {};
  response["m"] = "action";
  response["c"] = "room";
  var data = {};
  data["chair_id"] = chair_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = bet_amount;
  data["type"] = "all_in";
  response["data"] = data;
  broadcast_in_room(room_id, response, chair_id);
  if (player["actions"] != []) {
    player["actions"] = [];
  }
  broadcast_userupdate_includeme(room_id, chair_id);
  var is_action_declared = action_declared(room_id);
  var all_fold = is_all_fold(room_id);
  if (!is_action_declared && !all_fold) {
    game_actions(room_id);
  }
};

exports.room_check = function(message) {
  var uid = message.uid;
  var chair_id = message.chair_id;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var room_id = room["_id"];
  if (chair_id == null) {
    return;
  }
  chair_id = parseInt(chair_id);
  if (chair_id != room["current"]) {
    return;
  }
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  if (player["state"] == "fold") {
    return;
  }

  player["declare_count"] += 1;
  player["last_bet_time"] = new Date();
  room["last_bet_time"] = new Date();
  player["hand_state"] = "check";
  console.log("room check last bet time");
  console.log(player["last_bet_time"]);

  var response = {};
  response["m"] = "action";
  response["c"] = "room";
  var data = {};
  data["chair_id"] = chair_id;
  data["betting_history"] = room["betting_history"];
  data["bet_amount"] = 0;
  data["type"] = "check";
  response["data"] = data;
  // console.log("here1");
  broadcast_in_room(room_id, response, chair_id);
  // console.log("here2")
  // clean up action for this player
  if (player["actions"] != []) {
    player["actions"] = [];
  }
  // console.log("here3");
  broadcast_userupdate_includeme(room_id, chair_id);
  // console.log("here4")
  var is_action_declared = action_declared(room_id);
  var all_fold = is_all_fold(room_id);
  if (!is_action_declared && !all_fold) {
    game_actions(room_id);
  }
};

function deal_hole_cards(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  room["game_state"] = "deal_hole_cards";
  room["ctx_seq"] = room["ctx_seq"] == null ? 1 : room["ctx_seq"] + 1;
  var deck = new Deck();
  var hole_cards = [];
  room["deck"] = deck;
  deck.shuffle();

  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["status"] != "sit_out") {
      hole_cards = [];
      hole_cards.push(room["deck"].deal());
      hole_cards.push(room["deck"].deal());
      room["players"][i]["hole_cards"] = hole_cards;
      room["players"][i]["cards_dealt"] = 1;

      var uid = room["players"][i]["uid"];
      var ws = user_mgr.get(uid);
      var response = {};
      var data = {};
      response["m"] = "deal_hole_cards";
      response["c"] = "room";
      response["data"] = data;
      for (let i = 0; i < hole_cards.length; i++) {
        hole_cards[i] = hole_cards[i].toString();
      }
      response["data"]["hole_cards"] = hole_cards;
      response["chair_id"] = room["players"][i]["chair_id"];
      console.log("before deal hole cards");
      ws.send(JSON.stringify(response));
      console.log("after deal hole cards");
    }
  }
  console.log("room info in deal hole cards");
  console.log(room);
  // room["game_state"] = "preflop";
  room["state"] = "preflop";
  room["action_declare_list"] = [];
  game_actions(room["_id"]);
}

function time_out_fold(room_id) {
  console.log("timeout fold ");
  var room = rooms.filter(room => room["name"] == "test")[0];
  room["ctx_seq"] += 1;

  var player = room["players"].filter(
    player => player["chair_id"] == room["current"]
  )[0];
  // var actions = player["actions"];
  player["hand_state"] = "fold";

  // player["declare_count"] =
  //   player["declare_count"] == null ? 1 : player["declare_count"] + 1;
  player["last_declared_at"] = new Date();
  room["last_bet_time"] = new Date();
  console.log("last bet time in time_out_fold");
  console.log(room["last_bet_time"]);
  room["action_declare_list"].push({
    chair_id: player["chair_id"],
    action_declared: true
  });

  var response = {};
  response["m"] = "time_out_fold";
  response["c"] = "room";
  var data = {};
  data["chair_id"] = room["current"];
  data["betting_list"] = room["betting_list"];

  response["data"] = data;
  broadcast_in_room(room_id, response, "");
  // actions = [];
  broadcast_userupdate_includeme(room_id, room["current"]);
  var is_action_declared = action_declared(room_id);
  var all_fold = is_all_fold(room_id);
  console.log("in timeout")
  console.log(is_action_declared);
  console.log(all_fold);
  if (!is_action_declared && !all_fold) {
    game_actions(room_id);
  } else {
    room["state"] = "game_result";
  }
}

function get_next(room, chair_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  room["players"].sort(
    (player1, player2) => player1["chair_id"] - player2["chair_id"]
  );
  console.log("get next");
  console.log(room);
  for (var i = 0; i < room["players"].length; i++) {
    console.log("sort testing");
    console.log(room["players"][i]["chair_id"]);
  }
  var current_index = 0;
  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["chair_id"] == chair_id) {
      console.log("current index0");
      console.log(current_index);
      current_index = i;
      console.log(i);
      console.log(current_index);
      break;
    }
  }
  console.log("current index1");
  console.log(current_index);
  current_index += 1;
  current_index = current_index % room["players"].length;
  console.log("current index2");
  console.log(current_index);
  console.log(room);

  return room["players"][current_index]["chair_id"];
}

function deal_flop_cards(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var cards = [];
  cards.push(room["deck"].deal().toString());
  cards.push(room["deck"].deal().toString());
  cards.push(room["deck"].deal().toString());
  room["flop"] = cards;
  if (room["community_cards"] == null) {
    room["community_cards"] = [];
  }
  room["community_cards"].concat(room["flop"]);
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
      console.log("before deal flop cards");
      ws.send(JSON.stringify(response));
      console.log("after deal flop cards");
    }
  }
}

exports.room_deal_turn_card = function(message) {
  var uid = message.uid;
  var room_id = message.room_id;
  var room = rooms.filter(room => room["name"] == "test")[0];

  var cards = [];
  cards.push(room["deck"].deal().toString());
  room["turn"] = cards;
  if (room["community_cards"] == null) {
    room["community_cards"] = [];
    room["community_cards"].concat(room["turn"]);
  }
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
      console.log("before deal turn cards");
      ws.send(JSON.stringify(response));
      console.log("after deal turn cards");
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
  if (room["community_cards"] == null) {
    room["community_cards"] = [];
    room["community_cards"].concat(room["river"]);
  }
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
      console.log("before deal river action cards");
      ws.send(JSON.stringify(response));
      console.log("after deal river cards");
    }
  }
  // fake_hole_cards_status = [true, true, true, true, true, true, true, true];
  //return { "cards": cards }
};

exports.room_reserve_sit = function(message) {};

exports.createRoom = function(creator, room_conf, gems, ip, port) {};

exports.destroy = function(room_id) {
  var room_info = rooms[room_id];
  if (room_info == null) {
    return;
  }

  for (var i = 0; i < 4; i++) {
    var user_id = roomInfo.seats[i].user_id;
    if (user_id > 0) {
      delete user_location[user_id];
      db.set_room_id_of_user(user_id, null);
    }
  }

  delete rooms[room_id];
  total_rooms--;
  db.delete_room(room_id);
};

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
};

function get_context(room_id, chair_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  var response = {};
  response["c"] = "room";
  response["m"] = "load_context";
  var data = {};
  data["chair_id"] = chair_id;
  data["current"] = room["current"];
  data["timer"] = room["timer"];
  data["ctx_seq"] = room["ctx_seq"];
  data["round"] = room["round"];
  data["game_state"] = room["game_state"];
  data["button"] = room["button"];
  data["owner"] = room["owner"];
  data["betting_list"] = room["betting_list"];
  data["community_cards"] = room["community_cards"];
  data["actions"] = player["actions"];
  data["players"] = [];
  data["pots"] = room["pots"];

  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["chair_id"] == chair_id) {
      data["players"].push(get_full_player_info(room["_id"], chair_id));
    } else {
      data["players"].push(get_basic_player_info(room["_id"], chair_id));
    }
  }

  response["data"] = data;
  return response;
}

exports.room_load_context = async function(message) {
  var room_id = message.room_id;
  var o_id = new ObjectID(room_id);
  var user_id = message.user_id;
  var room = rooms.filter(room => room["name"] == "test")[0];

  return { success: true, room: room };
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
  console.log("all fold in game betgting");
  console.log(all_fold);
  console.log(room);
  // only one player exists and
  if (all_fold == true && room["game_state"] != "game_result") {
    game_all_fold();
    return;
  }
  var is_action_declared = action_declared(room_id);
  var all_in = has_all_in(room["players"]);
  console.log("is action declared");
  console.log(is_action_declared);
  console.log("all in");
  // console.log(all_in);
  console.log(room);
  if (
    is_action_declared == true &&
    all_in == true &&
    room["state"] != "game_result"
  ) {
    console.log("in direct settlement");
    direct_settlement();
    return;
  }
  // include dealing hole cards in start
  if (room["state"] == "start") {
    console.log("in game start");
    console.log(room);
    delay_game_start(room_id);
    return;
  }
  if (room["state"] == "preflop") {
    console.log("preflop time_state");
    console.log(room);
    preflop_action(room_id);
    return;
  }
  if (room["state"] == "flop") {
    flop_action(room_id);
    return;
  }
  if (room["state"] == "turn") {
    turn_action(room_id);
    return;
  }
  if (room["state"] == "river") {
    river_action(room_id);
    return;
  }
  if (room["state"] == "game_result") {
    game_result(room_id);
    return;
  }
}

function sort_room(room) {
  room.sort(function(a, b) {
    return a["chair_id"] - b["chair_id"];
  });
}

function all_players_fold() {
  var active_count = 0;
  var room = rooms.filter(room => room["name"] == "test")[0];
  for (var i = 0; i < room["players"].length; i++) {
    active_count++;
  }

  return active_count == 1;
}

exports.user_showhands = function(message) {
  var uid = message.uid;
  var show_status = message.data.show_status;
  var chair_id = message.chair_id;
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  if (room["room_status"] != "game_result") {
    return {
      success: false,
      message: "room status is not game result, cannot show card yet"
    };
  }
  for (var i = 0; i < room["players"].length; i++) {
    if (room["players"][i]["status"] != "sit_out") {
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
    return {
      success: false,
      message: "room status is not game result, cannot show card yet"
    };
  }
  var res = [];
  for (var i = 0; i < room["players"].length; i++) {
    var tmp = {
      chair_id: room["players"][i]["chair_id"],
      hole_cards: room["players"][i]["hole_cards"]
    };
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

function broadcast_userupdate_includeme(room_id, chair_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  for (var i = 0; i < room["players"].length; i++) {
    var response = {};
    response["m"] = "userupdate";
    response["c"] = "room";
    var data = {};

    if (chair_id == room["players"][i]["chair_id"]) {
      console.log("in chair_id1");
      console.log(chair_id);
      console.log(room["players"][i]);
      data = get_full_player_info(room["_id"], chair_id);
      if (!room["players"][i]["actions"]) {
        data["actions"] = [];
      } else {
        data["actions"] = room["players"][i]["actions"];
      }
    } else {
      console.log("in chair_id2");
      console.log(chair_id);
      data = get_basic_player_info(room["_id"], chair_id);
      data["actions"] = [];
    }

    if (player["hand_finished"]) {
      console.log("hand finished");
      data["actions"] = [];
    }

    data["timer"] = room["timer"];
    data["ctx_seq"] = room["ctx_seq"];
    data["button"] = room["button"];
    data["chair_id"] = chair_id;
    data["smallblind_id"] = room["smallblind_id"];
    data["bigblind_id"] = room["bigblind_id"];
    data["current"] = room["current"];
    data["community_cards"] = room["community_cards"];
    response["data"] = data;
    var uid = room["players"][i]["uid"];
    var ws = user_mgr.get(uid);
    ws.send(JSON.stringify(response));
    console.log("response in broadcast");
    console.log(chair_id);
    console.log(response);
  }
}

function delay_betting(room_id) {
  game_betting(room_id);
  setTimeout(function() {
    var room = rooms.filter(room => room["name"] == "test")[0];
    if (room["finished"] != true) {
      delay_betting(room_id);
    }
  }, 1000);
}

function preflop_action(room_id) {
  console.log("in preflop action");
  var room = rooms.filter(room => room["name"] == "test")[0];
  if (room["deal_rest"]) {
    console.log("in deal_rest");
    return;
  }

  var is_action_declared = action_declared(room_id);
  if (is_action_declared) {
    console.log("in preflop action11");
    deal_flop_cards(room_id);
    return;
  }
  console.log("last bet time2");
  console.log(room["last_bet_time"]);
  if (room["last_bet_time"] == undefined) {
    console.log("in checking time out fold22");
    console.log(room);
    return;
  }
  if ((new Date() - room["last_bet_time"]) / 1000 > room["XZTIMER"]) {
    console.log("in checking time out fold33");
    console.log(room);
    // console.log((new Date() - room["last_bet_time"]) / 1000);
    time_out_fold(room_id);
  }
}

function turn_action(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  if (room["deal_rest"]) {
    return;
  }
  var is_action_declared = action_declared(room_id);
  if (is_action_declared) {
    exports.room_deal_turn_cards(room_id);
    return;
  }

  if (room["last_bet_time"] == undefined) {
    return;
  }
  if ((new Date() - room["last_bet_time"]) / 1000 > room["XZTIMER"]) {
    time_out_fold(room_id);
  }
}

function river_action(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  if (room["deal_rest"]) {
    return;
  }
  var is_action_declared = action_declared(room_id);
  if (is_action_declared) {
    exports.room_deal_river_cards(room_id);
    return;
  }

  if (room["last_bet_time"] == undefined) {
    return;
  }
  if ((new Date() - room["last_bet_time"]) / 1000 > room["XZTIMER"]) {
    time_out_fold(room_id);
  }
}

function game_result(room_id) {
  let room = rooms.filter(room => room["name"] == "test")[0];
  console.log("in game result");
  console.log(room);
  room["state"] = "game_result";
  room["last_game_result_time"] = new Date();
  room["player_scores"] = [];
  console.log("before do show down");
  do_showdown(room_id);
  console.log("after do show down");
  // console.log("here1");
  // console.log(room["players"]);
  //
  // for (let i = 0; i < room["players"].length; i++) {
  //   let player = room["players"][i];
  //   let community_cards = room["community_cards"].map(card_string =>
  //     string_to_card(card_string)
  //   );
  //   room["player_scores"] = room["player_scores"] || [];
  //   if (is_active(player)) {
  //     let player_score = {};
  //     let hole_cards = player["hole_cards"].map(card_string =>
  //       string_to_card(card_string)
  //     );
  //     let hand_evaluator = new HandEvaluator(community_cards, hole_cards);
  //     let score = hand_evaluator.get_value();
  //     let type = hand_evaluator.get_type();
  //     player_score["chair_id"] = player["chair_id"];
  //     player_score["score"] = score;
  //     player_score["type"] = type;
  //     player_score["hole_cards"] = player["hole_cards"];
  //   }
  // }
  //
  // console.log("here2");
  // console.log(room["players"]);
  //
  // let player_show_cards = [];
  // for (let i = 0; i < room["players"].length; i++) {
  //   let player = room["players"][i];
  //   if (player["show_card_status"] != 0) {
  //     let elem = {};
  //     elem["chair_id"] = player["chair_id"];
  //     elem["hole_cards"] = player["hole_cards"];
  //     elem["show_cards_status"] = player["show_card_status"];
  //     player_show_cards.push(elem);
  //   }
  // }
  //
  // console.log("here3");
  // console.log(room["players"]);
  // let showing_players = new Set();
  // // determin showing player, all in players first
  // for (let i = 0; i < room["pots"].length; i++) {
  //   let pot = room["pots"][i];
  //   let contributors = pot.get_contributors();
  //   for (let j = 0; j < contributors.length; j++) {
  //     if (
  //       !showing_players.has(contributors[j]["chair_id"]) &&
  //       is_all_in(contributors[j])
  //     ) {
  //       showing_players.add(contributors[j]);
  //     }
  //   }
  // }
  //
  // console.log("here4");
  // console.log(room["players"]);
  // // add last aggressor
  // if (room["last_aggressor"] != null) {
  //   if (!showing_players.has(room["last_agressor"]["chair_id"])) {
  //     show_players.add(room["last_agressor"]["chair_id"]);
  //   }
  // }
  //
  // console.log("here5");
  // console.log(room["players"]);

  for (let i = 0; i < room["players"].length; i++) {
    let player = room["players"][i];
    // console.log("player information");
    // console.log(player);
    let response = {};
    response["m"] = "hand_finished";
    response["c"] = "room";
    // console.log("here6");
    // console.log(room["players"]);
    let context = get_context(room_id, player["chair_id"]);
    let data = context["data"];
    data["actions"] = [];
    data["player_scores"] = room["player_scores"];
    data["winner_hole_cards"] = room["winner_hole_cards"];

    data["pots"] = room["pots"];
    response["data"] = data;
    var uid = player["uid"];
    var ws = user_mgr.get(uid);
    ws.send(JSON.stringify(response));
    if (player["game_state"] != "offline") {
      player["game_state"] = "waiting";
    }
    player["hand_finished"] = true;
    broadcast_userupdate_includeme(room_id, player["chair_id"]);
  }

  // console.log("here7");
  // console.log(room["players"]);
  // and finally remaining players, starting from left of the button
  reset_room(room_id);
  console.log("in game result reset reset complete");
}

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
      User.findOne({ _id: uid }, function(err, user) {
        user.coins += player["money_on_the_table"];
        user.save();
      });
    }
  }
  room["state"] = "dismiss";
  room["finished"] = true;
}

function broadcast_in_room(room_id, response, chair_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  console.log("player");
  console.log(player);
  if (player == undefined) {
    var uid = undefined;
  } else {
    var uid = player["uid"];
  }

  console.log("uid");
  console.log(uid);
  for (var i = 0; i < room["all_players"].length; i++) {
    if (room["all_players"][i]["uid"] == uid) {
      continue;
    }
    console.log("all_players");
    console.log(room["all_players"]);
    var user = room["all_players"][i]["uid"];
    var ws = user_mgr.get(user);
    ws.send(JSON.stringify(response));
  }
}

function broadcast_userupdate_onlyme(room_id, chair_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  if (player) {
    var response = {};
    response["m"] = "userupdate";
    response["c"] = "room";

    //var uid = player["uid"];
    var data = get_full_player_info(room_id, chair_id);
    data["timer"] = room["timer"];
    data["ctx_seq"] = room["ctx_seq"];
    data["button"] = room["button"];
    data["chair_id"] = chair_id;
    data["flag"] = "only_me";
    data["game_state"] = room["game_state"];
    data["smallblind_id"] = room["smallblind_id"];
    data["bigblind_id"] = room["bigblind_id"];
    data["current"] = room["current"];
    data["community_cards"] = room["community_cards"];
    //run it twice community cards
    var actions = player["actions"] || [];
    data["actions"] = actions;
    response["data"] = data;

    var uid = player["uid"];
    var ws = user_mgr.get(uid);
    ws.send(JSON.stringify(response));
  }
}

function get_full_player_info(room_id, chair_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];
  console.log("get_full_player_info");
  console.log(player);
  console.log(chair_id);
  var data = {};
  data["chair_id"] = chair_id;
  data["community_cards"] = room["community_cards"];
  data["type"] = "full_info";
  //data["show_timer_button"] = player["show_timer_button"];
  data["money_on_the_table"] = player["money_on_the_table"];
  data["state"] = player["state"];
  data["hole_cards"] = player["hole_cards"];
  return data;
}

function get_basic_player_info(room_id, chair_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var player = room["players"].filter(
    player => player["chair_id"] == chair_id
  )[0];

  var data = {};
  data["chair_id"] = chair_id;
  data["community_cards"] = room["community_cards"];
  data["type"] = "basic_info";
  data["money_on_the_table"] = player["money_on_the_table"];
  data["state"] = player["state"];
  // data["hole_cards"] = player["hole_cards"];
  return data;
}

function reset_room(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  console.log("before reset");
  console.log(room);
  reset_players(room);
  room["community_cards"] = [];
  room["deck"] = [];
  room["timer"] = -1;
  room["state"] = "start";
  room["smallblind_id"] = null;
  room["bigblind_id"] = null;
  room["pots"] = [];
  room["direct_settlement"] = false;
  room["deal_rest"] = null;
  room["last_started_at"] = null;
  room["last_game_result_time"] = null;
  room["betting_list"] = [];
  room["action_declare_list"] = [];
  console.log("reset_room");
  console.log(room);
}

function contribute_pot(room_id, amount, contributor) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var pots = room["pots"];
  for (var i = 0; i < room["pots"].length; i++) {
    pot = room["pots"][i];
    if (!pot.has_contributor(contributor)) {
      var pot_bet = pot.get_bet();
      if (amount >= pot_bet) {
        //regular call bet or raise
        pot.add_contributor(contributor);
        amount -= pot.get_bet();
      } else {
        //partial all in, redistribugte the pot
        room["pots"].push(pot.split(room["current"], amount));
        amount = 0;
      }
    }
    if (amount <= 0) {
      break;
    }
  }
  if (amount > 0) {
    var pot = new Pot(amount);
    pot.add_contributor(contributor);
    pots.push(pot);
  }
}

function do_showdown(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var showing_players = [];
  console.log("do_showdown");
  for (var i = 0; i < room["pots"].length; i++) {
    pot = room["pots"][i];
    contributors = pot.get_contributors();
    for (var j = 0; j < contributors.length; j++) {
      if (
        !showing_players.include(contributors[j]) &&
        contributors[j].is_all_in()
      ) {
        showing_players.push(contributors[j]);
      }
    }
  }
  console.log("do_showdown11");
  console.log(showing_players);
  // adding last agressor
  if (room["last_agressor"] != null) {
    if (!showing_players.includes(room["last_agressor"])) {
      showing_players.push(room["last_agressor"]);
    }
  }
  var active_players = room["players"].filter(player => player["hand_state"] != "fold");
  console.log("do_showdown22");
  console.log(active_players);
  // finally remaining players starting from small blind to the button
  var pos = (room["button"] + 1) % active_players.length;
  while (showing_players.length < active_players.length) {
    var player = active_players[0];
    if (!showing_players.includes(player)) {
      showing_players.push(player);
    }
    pos = (pos + 1) % active_players.length;
  }
  //key is hand value, value is a list of players
  var ranked_players = {};

  room["players_scores"] = room["players_scores"] || [];
  for (var i = 0; i < room["players"].length; i++) {
    var player = room["players"][i];
    var player_hole_cards = player["hole_cards"].map(card => string_to_card(card));
    if (is_active(player)) {
      console.log("in is active");
      var hand = new HandEvaluator(
        room["community_cards"],
        player_hole_cards
      );
      console.log(hand.get_value());
      if (hand.get_value() in ranked_players) {
        ranked_players[hand.get_value()].push(room["players"][i]);
      } else {
        ranked_players[hand.get_value()] = [room["players"][i]];
      }
    }
  }

  var total_pot = get_total_pot(room_id);
  console.log("total_pot");
  console.log(total_pot);
  console.log(ranked_players);
  var pot_division = {};
  var ranked_values = Object.keys(ranked_players);
  //console.log("ranked_values");
  //console.log(ranked_values);
  for (var i = 0; i < ranked_values.length; i++) {
    var winners = ranked_players[ranked_values[i]];
    //console.log("winners");
    //console.log(winners);
    //console.log(room["pots"]);
    for (var j = 0; j < room["pots"].length; j++) {
      var pot = room["pots"][j];
      var no_of_winners = 0;
      for (var k = 0; k < winners.length; k++) {
        if (pot.has_contributor(winners[k]["chair_id"])) {
          no_of_winners++;
        }
      }
      //console.log(":no_of_winners");
      //console.log(no_of_winners);
      if (no_of_winners > 0) {
        var pot_share = pot.get_value() / no_of_winners;
        //console.log("pot_share");
        //console.log(pot.get_value());
        //console.log(no_of_winners);
        pot_share = pot_share;
        for (var m = 0; m < winners.length; m++) {
          if (pot.has_contributor(winners[m]["chair_id"])) {
            var old_share = pot_division[winners[m]["chair_id"]];
            //console.log("old_share");
            //console.log(old_share);
            if (old_share != undefined) {
              //console.log("here1");
              pot_division[winners[m]["chair_id"]] += pot_share;
            } else {
              //console.log("here2");
              pot_division[winners[m]["chair_id"]] = pot_share;
            }
          }
        }
        // room["pots"] = [];
      }
    }
  }
  console.log("pot_division");
  console.log(pot_division);

  Object.entries(pot_division).forEach(entry => {
    if (entry != undefined) {
      const [seat, amount] = entry;
      var winner_seat = parseInt(seat);
      var winner = room["players"].filter(room => room["chair_id"] == winner_seat)[0];
      console.log("winner");
      console.log(winner);
      console.log(amount);
      console.log(winner["money_on_the_table"]);
      winner["money_on_the_table"] += amount;
      console.log(winner);
      broadcast_userupdate_includeme(room_id, winner["chair_id"]);
    }
  });

}

function get_total_pot(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  var total_pot = 0;
  for (var i = 0; i < room["pots"].length; i++) {
    total_pot += room["pots"][i].get_value();
  }
  return total_pot;
}

function reset_players(room_id) {
  var room = rooms.filter(room => room["name"] == "test")[0];
  for (let i = 0; i < room["players"].length; i++) {
    let player = room["players"][i];
    if (player["game_state"] != "offline") {
      player["hand_state"] = "default";
      player["game_state"] = "default";
      player["state"] = "default";
      player["actions"] = [];
      player["hand_finished"] = false;
      player["cards_dealt"] = 0;
    }
  }
}

// function string_to_card(card_string) {
//   var rank = card_string.substring(1, 3);
//   var suite = card_string.substring(0, 1);
//   return new Card(parseInt(rank), parseInt(suite));
// }

function string_to_card(card_string) {
  var rank = card_string.substring(1, 3);
  var suite = card_string.substring(0, 1);
  // console.log("string_to_card");
  // console.log(rank);
  // console.log(suite);
  return new Card(parseInt(rank), parseInt(suite) - 1);
}
