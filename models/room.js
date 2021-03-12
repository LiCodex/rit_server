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
    player_bank: [Number],
    player_name: [String],
    player_avatar: [Number],
    table_chips: [Number],
    remaining_time: [Number]
});

module.exports = mongoose.model('room', RoomSchema);
