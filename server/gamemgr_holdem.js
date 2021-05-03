var roomMgr = require('./roommgr');
var userMgr = require('./usermgr');
var holdemutil = require('./holdemutil');
var db = require('./utils/db');
var crypto = require('../utils/crypto');


var XZTIMER = 15
var STARTTIMER = 1
var GAMEOVERTIME = 4
var DEALCARDTIMER = 5
var BXTIMER = 30
//var BAOXIANFLG = true

function add_score(chair_id, amount) {
    var player = this.players[chair_id];
    player.coin = player.coin + amount;
}

function cmd_client_room_quit(message) {
    var uid = message.uid;
    var chair_id = get_chair_id_by_uid(uid);

    if (chair_id == null) {
        return
    }

    var player = this.players[chair_id];
    var response = {};
    var data = {};
    response.data = data;
    response.m = message.m;
    response.c = message.c;

    data.chair_id = chair_id;
    data.uid = uid;
    data.ok = true;
    player.send(reqponse);

    //上分

    //下人

    self.players[chair_id] = null;

    for (var player in this.players) {
        send_context(player);
    }

    game_room_context_to_center();
}

function cmd_client_room_rejoin(message) {
    var uid = message.uid;
    var chair_id = get_chair_id_by_uid(uid);
    if (chair_id != null) {
        var player = this.players[chair_id];
        player.online();

        if (this.linestate[chair_id] != null) {
            player.userstate = this.linestate[chair_id];
        }

        response = get_context(chair_id);
        response.m = 'loadcontext';
        response.action_flag = 'rejoin';
        player.update_session(message.session_id);
        player.send(response);
        broadcast_user_include_me(chair_id);
    }    
}

function cmd_client_room_showcard(message) {
    var uid = message.uid;
    var showcard_status = message.data.showcard_status;
    var chair_id = get_chair_id_by_uid(uid);

    if (chair_id == null || chair_id > this.chair_count) {
        return;
    }

    var player = this.players[chair_id];
    if (player == null || !player.if_fold()) {
        return;
    }

    if (showcard_status == null) {
        return;
    }

    showcard_status = int(showcard_status);

    if (player.showcard_status == showcard_status) {
        player.showcard_status = 0;
    } else {
        player.showcard_status = showcard_status;
    }
    // dkanpai needs a better name
    player.dkanpai = true;

    var response = {};
    response.m = 'showcard';
    response.c = 'room';
    
    var data = {};
    data.chair_id = chair_id;
    data.cards = player.hole_cards;
    data.showcard_status = showcard_status;

    response.data = data;
    if (!player.is_offline) {
        player.send(response);
    }
    return;
}

function cmd_client_room_chooseshowcard(message) {
    var uid = message.uid;
    var chair_id = get_chair_id_by_uid(uid);

    if (chair_id == null || chair_id > this.chair_count) {
        return;
    }

    var player = this.players[chair_id];
    if (player == null || !player.if_fold()) {
        return;
    }

    var response = {};
    response.m = 'chooseshowcard';
    response.c = 'room';

    var data = {};
    data.chair_id = chair_id;
    data.cards = player.hole_cards;
    data.showcard_status = player.showcard_status;
    response.data = data;
    
    if (!player.is_offline) {
        player.send(response);
    }
    return;
}

function cmd_client_room_addtime(message) {
    var uid = message.uid;
    var chair_id = get_chair_id_by_uid(uid);

    if (chair_id == null || chair_id > this.chair_count) {
        return;
    }

    var player = this.players[chair_id];
    if (player == null || !player.if_fold()) {
        return;
    }

    if (this.current != chair_id) {
        return;
    }

    var multiplier = Math.min(player.multiplier, 8);
    if (player.coin < multiplier * config.smallblind) {
        var response = {};
        response.m = 'addtime';
        response.c = 'room';

        var data = {};
        data.err = 1;
        data.msg = 'do not have enough coin';
        response.data = data;
        if (!player.if_offline()) {
            player.send(response);
            return;
        }
    }

    XZTIMER = XZTIMER + 15;
    // os time needs to be fixed
    this.timer = XZTIMER - (os.time() - self.last_bet_time);

    var response = {};
    response.m = 'addtime';
    response.c = 'room';

    var data = {};
    data.err = 0;
    data.msg = 'success';

    response.data = data;
    if (!player.is_offline()) {
        player.send(response);
    }

    player.multiplier = player.multiplier + 1;
    player.multiplier = Math.min(player.multiplier, 8);

    broadcast_user_update_include_me(this.current);
    for (var player in players) {
        if (player != null && player.seat_id != this.current) {
            is_active = player.is_active();
            if (is_active) {
                player.show_btn = true;
                broadcast_user_update_only_me(player.seat_id);
            }
        }
    }
    return;
}

function cmd_client_room_loadcontext(message) {
    var uid = message.uid;
    var chair_id = get_chair_id_by_uid(uid);

    if (chair_id) {
        var response = get_context(chair_id);
        var player = this.players[chair_id];
        player.send(response);
    }
}

function message_err(chair_id, m, c, msg) {
    var player = this.players[chair_id];
    var response = {};
    var data = {};
    response.m = m;
    response.c = c;
    response.data = data;
    data.msg = msg;
    data.err = 1;
    player.send(response);
}

// function cmd_client_room_create() {

// }

function cmd_client_room_join(message) {
    var uid = message.uid;
    var old_chair_id = get_chair_id_by_uid(uid);
    var session_id = message.session_id;
    var info = message.data.info;

    // check whether someone has sit on the table
    if (old_chair_id) {
        var player = get_player_by_chair_id(old_chair_id);
        player.updateinfo();
        player.update_session(uid, old_chair_id, session_id);
    } else {
        var chair_id = rnd_chair();
        var need_coin = 0;
        if (chair_id < this.chair_count) {
            //needs to load
            var user;
            need_coin = config.max_coin;
            var res = user.decrease_bank_coin(need_coin);
            if (res.ok == 'ok') {
                uidkey.set(uid, this.room_id);
                room_info = roomlogic.load_room(REDIS, this.key);
                room_info.add_player(1);
            } else {
                //do not have enough coins
                this.stand_index++;
                chair_id = this.stand_index;
            }
        } else {
            this.stand_index++;
            chair_id = this.stand_index;
        }
    }

    var player = player.new(this.room_id, uid, chair_id, message, session_id, info);
    player.coin = need_coin;
    player.room = this;
    this.players[chair_id] = player;

    var response = {};
    response.m = message.m;
    response.c = message.c;
    var data = {};
    data.room_id = this.room_id;
    data.room_type = 'holdem';
    player.send(response);

    broadcast_user_update_by_chair_id_except_me(chair_id);
    game_room_context_to_center();

    check_start();
}

function init_default() {
    var count = 0;
    for (var player in this.players) {
        if (player && player.coin > 0) {
            count++;
        }
    }

    if (count < 2) {
        for (var player in this.players) {
            if (player) {
                player.set_user_state('default');
            }
        }
    }
}
function gameover() {
    if (this.last_gameover_time != null) {
        return;
    }

    var cur_time = Date.now();
    this.room.config.time = 30;
    
    if (cur_time - this.start_time >= 60) {
        game_dismiss();
    } else {
        reset();
        for (var player in players) {
            context = get_context(player.chair_id);
            context.action_flag = 'reset';
            player.send(context);
        }
    }
    //var = check
}
function game_start() {
    this.state = 'playing';
    this.play_state = 'start';

    if (this.round == 0) {
        this.start_time = ;
    }  
}


function check_start() {
    if (this.state == 'none') {
        return false;
    }

    var count = 0;
    for (var player in players) {
        // may need to add player coin as well
        if (player.coin > 0) {
            count++;
        }
    }

    if (count >= 2) {
        if (this.round == 0) {
            this.delay_betting();
        }
        this.time_state = 'start';
    } 
}

function shuffle(game) {
    var cards = {};

}