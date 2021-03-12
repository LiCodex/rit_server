const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    name: String,
    owner: { type: Schema.Types.ObjectId, ref: 'Owner' },
    stake: String,
    players: Number,
    room_type: Number,
    room_status: Number,
    starting_time: Date,
    end_time: Date,
    blind_type: String,
    seat_status: [Number],
    button_position: Number,
    next_button_position: Number,
    player_bank: String,
    player_name: String,
    player_avatar: String,
    table_chips: String,
    remaining_time: String  
});

module.exports = mongoose.model('room', RoomSchema);
