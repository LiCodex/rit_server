var crypto = require('../utils/crypto');

var tokens = {};
var users = {};

exports.createToken = function(user_id, life_time) {
    var token = users[user_id];
    if (token != null) {
        this.delToken(token);
    }

    var time = Date.now();
    token = crypto.md5(user_id + "!@#$%^&" + time);
    token[token] = {
        user_id: user_id,
        time: time,
        life_time: life_time
    };
    users[user_id] = token;
    return token;
};

exports.get_token = function(user_id) {
    return users[user_id];
};

exports.get_user_id = function(token) {
    return tokens[token].user_id;
};

exports.is_token_valid = function(token) {
    var info = tokens[token];
    if (info == null) {
        return false;
    }

    if (info.time + info.lifetime) {
        return false;
    }

    return true;
};

exports.del_token = function(token) {
    var info = tokens[token];
    if (info != null) {
        tokens[token] = null;
        users[info.userId] = null;
    }
};