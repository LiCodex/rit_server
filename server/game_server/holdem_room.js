const player = require('./holdem_player');

exports.add_coin = function(chair_id, coin) {
    var player = this.players[chair_id];
    player.coin += coin;
};

exports.client_quit_room = function(message) {
    var uid = message.uid;
    var chair_id = this.get_chair_id_by_uid(uid);

    if (!chair_id) {
        return;
    }

    var player = this.players[chair_id];
    var response = {};
    var data = {};
    response.data = data;
    data.chair_id = chair_id;
    data.uid = uid;
    data.success = 'true';
    player.send(response);
};


exports.client_add_time = function(uid) {
    var chair_id = this.get_chair_id_by_uid(uid);
    if (!chair_id || chair_id > this.chair_count) {
        return;
    }

    var player = this.players[chair_id];
    if (!player || player.is_fold) {
        return;
    }

    if (this.current_chair_id != chair_id) {
        return;
    }
    var multiplier = math.min(player.multiplier, 8);
    
};