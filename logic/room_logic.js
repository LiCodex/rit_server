exports.load_room = function(redis, room_id) {
    var room_key = key_utils.get_model_key('room', room_id);
    var room = new RoomModel(room_key, redis);
    room.read();
    return room;
}

exports.del_room = function(redis, room_id) {
    var room_key = key_utils.get_model_key('room', room_id);
    var room = new RoomModel(room_key, redis);
    room.read();

    var rooms = key_utils.get_room_list_key(room.size, 'admin');
    redis:zrem(rooms, room_id);

    if (room_key) {
        redis:del(room_key);
    }

    var main_key = key_utils.get_room_main_key(room_id);
    if (main_key) {
        redis:del(main_key);
    }
}

exports.register_room = function(redis, data) {
    var room_id = id_generator.gen_rand(redis, keys_utils.get_room_main_key);
    redis:set(keys_utils.get_room_main_key(room_id), 1);
    var room_key = keysutils.get_model_key('room',id);
    var room = new RoomModel(room_key, redis);
    room.read();


    room.id = data.id;
    room.time = data.time;
    room.chair_count = data.chair_count;
    room.min_coin = data.min_coin;
    room.max_coin = data.max_coin;
    room.small_blind = data.small_blind;
    room.big_blind = data.big_blind;
    room.type = data.type;
    room.size = data.size;
    room.ante = data.ante;

    room:save();

    return room;
}

exports.get_admin_room_list = function(redis, size, is_empty) {

}

exports.get_jackpot_list = function() {
    
}