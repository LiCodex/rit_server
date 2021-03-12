const core = require('./core');

const USERSTATE = {
    bigblind: 0,
    smallblind: 1,
    call: 2,
    fold: 3,
    check: 4,
    raise: 5,
    allin: 6,
    thinking: 7,
    buychip: 8,
    leave: 9,
    wait: 10,
    inturn: 11,
    default: 20
};

exports.send = function(message) {
    cloned_message = { ...message };
    if (!this.is_offline && this.session_id) {
        cloned_message.src = 'server';
        cloned_message.room_id = this.room_id;
        cloned_message.data.ctx_seq = this.room.ctx_seq;
        core.send_to_client(this.session_id, res);
    }
};

exports.update_session = function(session_id) {
    this.session_id = session_id;
    this.is_offline = false;
};

exports.offline = function() {
    this.if_offline = true;
    this.userstate = 9;
};

exports.online = function() {
    this.if_offline = false;
    this.userstate = 20;
};

exports.set_userstate = function(type) {
    this.userstate = USERSTATE[type];
};

exports.get_userstate = function() {
    return this.userstate;
};

exports.is_fold = function() {
    return this.userstate == USERSTATE['fold'];
};

exports.is_allin = function () {
    return this.userstate == this.USERSTATE['allin'];
};

exports.is_buyin = function () {
    return this.userstate == this.USERSTATE['buyin'];
};

exports.is_active = function () {
    return (this.userstate != this.USERSTATE['fold']) && (this.userstate != this.USERSTATE['wait']) && (this.userstate !=this.USERSTATE['buyin']);
};

exports.is_wait = function () {
    return this.userstate == this.USERSTATE['wait'];
};

exports.is_offline = function () {
    return this.userstate == this.USERSTATE['leave'];
};

exports.get_full_details = function () {
    var res = {};
    res.chair_id = this.chair_id;
    res.name = this.info.name;
    res.offline = this.is_offline;
    res.state = this.state;
    res.type = 'full';
    res.silver = this.silver;
    res.gold = this.gold;
    res.ip = this.ip;
    res.uid = this.uid;
    res.userstate = this.userstate;
    res.hole_cards = this.hole_cards;
    res.community_cards = this.community_cards;
    res.buyin = this.buyin;
    res.time_multiplier = this.time_multiplier;

    if (this.hand_finished) {
        res.hole_cards = {};
    }

    res.btn = this.btn;
    res.bigblind = this.bigblind;
    res.smallblind = this.smallblind;
    return res;
};

exports.get_brief_details = function(){
    var res = {};
    res.chair_id = this.chair_id;
    res.name = this.info.name;
    res.offline = this.is_offline;
    res.state = this.state;
    res.type = 'full';
    res.silver = this.silver;
    res.gold = this.gold;
    res.ip = this.ip;
    res.uid = this.uid;
    res.userstate = this.userstate;
    res.hole_cards = this.hole_cards;
    res.community_cards = this.community_cards;
    res.buyin = this.buyin;
    res.time_multiplier = this.time_multiplier;

    if (this.hand_finished) {
        res.hole_cards = {};
    }

    res.btn = this.btn;
    res.bigblind = this.bigblind;
    res.smallblind = this.smallblind;
    return res;
};

exports.reset = function() {

};
exports.new = function() {

};

