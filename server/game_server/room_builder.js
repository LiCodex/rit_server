const core = require('./core');
const holdem_room = require('./holdem_room');

exports.build_room = function(type, key, uid, config) {
    if (type == 'holdem') {
        room = holdem_room.new(session_id, key, uid, config);
    }
    return room;
};