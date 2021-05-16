// var RedisClustr = require('redis-clustr');
// var RedisClient = require('redis');
const dotenv = require('dotenv');
const jwt = require("jsonwebtoken");

dotenv.config();

var room_key_to_room_id = {};

function deal_community_cards(phase_name, no_of_cards) {
    for (var i = 0; i < no_of_cards; i++) {
        board.add(deck.deal());
    }
    notify_board_update();
}

function check_start() {
    if (state != "none") {

    }
};

function get_chair_id_by_uid(uid) {

};

exports.room_check = function(message) {
    var uid = message.uid;
    var chair_id = get_chair_id_by_uid(uid);

    if (chair_id != null) {

    }
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
    return response;
}

exports.room_join = function(message) {
    var rooms = load_room_info();
    // console.log(room_key);
    var uid = message.uid;
    var existing_chair_id = get_chair_id_by_uid(uid);
    var session_id = message.session_id;
    var room_id = message.room_id;
    var info = message.data.info;

    if (existing_chair_id != null) {
        var player = get_player_by_chair_id(existing_chair_id);
        player.update_info(message.data.info);
        player.update_session_id(session_id);
        update_session(uid, existing_chair_id, session_id);
    } else {
        var chair_id = rnd_chair();
        var cash_needed = 0;
        if (chair_id < chair_count) {
            var user = users[user_id];
            cash_needed = config.max_coin;
            var res = user.bring_cash_to_table(cash_needed);
            if (res.ok == 'ok') {
                uid_room_map[uid] = room_id;
                room = rooms[room_id];
                room.add_player(1);
            }

        }

        var player = Player.new(room_id, uid, chair_id, session_id, info);
        player.cash = coin_needed;
        player.room = rooms[room_id];
        players[chair_id] = player;
    
        var response = {};
        response.m = message.m;
        response.c = message.c;
        var data = {};
        data.room_id = room_id;
        data.room_type = 'holdem';
        response.data = data;
        return response;
        // player.send(response);
        // notify_update(chair_id);
        // check_start();
    }
}

async function load_room_info() {
    var rooms = {};
    var rs = await Room.find();
    console.log("rs");
    console.log(rs);
    for (var i in rs) {
      //total_rooms++;
      console.log("room.players");
      console.log(rs[i]);
      rooms[rs[i]._id] = {"players": rs[i].players, "status": rs[i].room_status, "stake": rs[i].stake, "name": rs[i].name, "blind_type": rs[i].blind_type, "starting_time": rs[i].starting_time}
    }
    console.log("rs1");
    console.log(rooms);
    return rooms;
  }

function check_start() {
    if (state != 'none') {
        return;
    }

    var count = 0;
    for (var i = 0; i < chair_count; i++) {
        var player = players[i];
        if (player != null && player.cash > 0) {
            count++;
        }
    }

    if (count >= 2) {
        if (round == 0) {
            delay_bet();
        }
        time_state = 'start';
    }
}

function game_start(room) {
    room.state = 'playing';
    room.play_state = 'start';

    if (room.round == 0) {
        room.create_time = Date.now();
    }

    room.round++;

    var player_count = 0;
    for (var i = 0; i < room.chair_count; i++) {
        var player = room.players[i];
        if (player != null && player.cash > 0) {
            player.state = 'playing';
            player.set_user_state('default');
            player_count++;
        }
    }

    if (room.button_position == -1) {
        room.button_position = rnd_button();
        room.players[room.button_position].btn = true; 
    } else {
        room.button_position = get_next(room.button_position);
    }
}
// exports.room_dismiss = function(message) {
//     var room_id = room_key_to_room_id[message.data.key];
//     if (room_id == null) {
//         return
//     }

//     delete()    
// }

function start() {
    reset_game();
    while(!game_over) {
        play_hand();
    }
    console.log("game over");
};

function reset_game() {
    dealer_position = -1;
    actor_position = -1;
    game_over = false;
    for (var player in players) {
        
    }
};

function get_context(chair_id, room_id) {
    var context = {};
    context.m = 'load_context';
    context.c = 'room';

    var data = {};
    data.chair_id = chair_id;
    data.current = current;
    data.timer = timer;
    data.ctx_seq = ctx_seq;
    data.round = round;
    data.config = config;
    data.state = state;
    data.btn = btn;
    data.room_key = room_key;
    data.owner = owner;
    data.bet_list = bet_list;
    data.community_cards = community_cards;
    // skip run twice for now

    players = rooms[room_id].players;
    data.players = players;
    return data;
};

exports.room_load_context = function(message) {
    var uid = message.uid;
    var chair_id = message.chair_id;
    var room_id = message.room_id;

    if (chair_id != null) {
        context = get_context(chair_id, room_id);
        var player = players[chair_id];
        player.send(context);
    }
};

exports.room_update_user = function(message) {
    
};

exports.room_rejoin = function(message) {
    var uid = message.uid;
    var chair_id = message.chair_id;

    if (chair_id != null) {
        var player = players[chair_id];
        player.online();


    }
};  

exports.room_check_rejoin = function(message) {
    var data = {}
    data.res = false;
    return data;
};

exports.room_add_time = function(message) {
    var uid = message.uid;
    var chair_id = message.chair_id;
    if (chair_id == null || chair_id > chair_count) {
        throw 'invalid chair id';
    } 

    var player = players[chair_id];
    if (player == null || player.has_cards) {
        return;
    }

    if (action_player != chair_id) {
        return;
    }

    var multiplier = Math.min(multiplier, 8);
    if (player.cash < multiplier * small_blind) {
        var response = {};
        response.m = 'add_time';
        response.c = 'room';
        var data = {};
        data.err = 1;
        data.msg = 'not enought coins';
        response.data = data;
        if (player.online()) {
            player.send(response);
        }
        return;
    }

    XZTIMER = XZTIMER + 15;
    timer = XZTIMER - (datetime.now() - last_bet_time);

    var response = {};
    response.m = 'add_time';
    response.c = 'room';
    var data = {};
    data.err = 0;
    data.msg = 'time added successfully';

    response.data = data;
    if (player.online()) {
        player.send(response);
    }

    player.multiplier++;
    player.multiplier = Math.min(player.multiplier, 8);

    notify_update();
};



exports.update_dealer_position = function() {
    dealer_position = (dealer_position + 1) % active_players.lenght;
    dealer = active_players.get(dealer_position);
};

exports.room_user_showhands = function(message) {
    var uid = message.uid;
    var show_status = message.data.show_status;
    var chair_id = message.chair_id;
    if (chaid_id == null || chair_id > chair_count) {
        return;
    }

    var player = players[chair_id];
    if (player == null || !player.is_fold()) {
        return;
    }

    var response = {};
    response.m = 'show_hands';
    response.c = 'room';

    var data = {};
    data.chair_id = chair_id;
    data.hole_cards = player.hole_cards;
    data.show_status = player.show_status;
    response.data = data;

    return response;
    // if (!player.offline()) {
    //     player.send(response);
    // }
    // return;
};

// exports.winner_show_hands = function () {

// };

exports.room_other_player_action = function() {

};

exports.pot_win_money = function() {

};


exports.room_bet_money = function() {

};

exports.game_over = function () {

};

function room_player_raise(message) {

}