const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    name: String,
    owner: { type: Schema.Types.ObjectId, ref: 'Owner' },
    stake: String,
    players: String,
    type: String,
    room_status: Number,
    starting_time: Date,
    end_time: Date  
});

module.exports = mongoose.model('room', RoomSchema);