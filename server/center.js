// var RedisClustr = require('redis-clustr');
// var RedisClient = require('redis');
const dotenv = require('dotenv');

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
}

exports.room_join = function(room_key) {
    console.log(message);
    // Room.find(ObjectId(room_key));  
    // var players = []; 
    // var player1 = {'uid': 1, 'chair_id': 0, 'username': 'test1', 'coin': 100 };
    // players.push(player1);
    // var player2 = {'uid': 2, 'chair_id': 1, 'username': 'test2', 'coin': 121 };
    // players.push(player2);
    // var player3 = {'uid': 3, 'chair_id': 2, 'username': 'test3', 'coin': 1210 };
    // players.push(player3);
    // var player4 = {'uid': 4, 'chair_id': 3, 'username': 'test4', 'coin': 1000 };
    // players.push(player4);
    // var player5 = {'uid': 5, 'chair_id': 4, 'username': 'test5', 'coin': 133 };
    // players.push(player5);
    // var player6 = {'uid': 6, 'chair_id': 5, 'username': 'test6', 'coin': 11 };
    // players.push(player6);
    // var player7 = {'uid': 7, 'chair_id': 6, 'username': 'test7', 'coin': 1336 };
    // players.push(player7);
    // var player8 = {'uid': 8, 'chair_id': 7, 'username': 'test8', 'coin': 1221 };    
    // players.push(player8);
    var o_id = new ObjectID(room_key);
    console.log(o_id);
    try {
        let rooms = await Room.findOne({ _id: o_id });
    } catch (err) {
        let rooms = {};
    }
    return rooms;
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
    data.my_chair_id = chair_id;
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

exports.update_user = function(message) {

};

exports.room_rejoin = function(message) {
    var uid = message.uid;
    var chair_id = message.chair_id;

    if (chair_id != null) {
        var player = players[chair_id];
        player.online();


    }
};  

exports.check_rejoin = function() {

};

exports.add_time = function(message) {
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

exports.user_show_hands = function(message) {
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

    if (!player.offline()) {
        player.send(response);
    }
    return;
};

// exports.winner_show_hands = function () {

// };

exports.other_player_action = function() {

};

exports.pot_win_money = function() {

};


exports.bet_money = function() {

};

exports.game_over = function () {

};