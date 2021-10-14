const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    name: String,
    owner: { type: Schema.Types.ObjectId, ref: 'Owner' },
    deck: [String],
    seat_count: Number,
    players_count: Number,
    total_players_count: Number,
    room_status: String,
    starting_time: Date,
    end_time: Date,
    button_position: Number,
    round: Number,
    min_buy_in: Number,
    max_buy_in: Number,
    last_action_timestamp: Date,
    small_blind: Number,
    big_blind: Number,
    current_action_player: Number,
    player: [Object]
});

module.exports = mongoose.model('room', RoomSchema);


 // {"test": {"deck": [], "room_status": "running", "button_position": 0, "room_type": "holdem", "seat_count": 8, "min_buy_in": 50, "max_buy_in": 400, "player_count": 2, "last_action_timestamp": new Date(), "XZTIMER": 15, "small_blind": 1, "bid_blind": 2, "current_action_player": 0, "round": 0, "players": [{"hand_state": "default", "game_state": "playing", "seat_id": 0, "money_on_the_table": 1000, "money_in_the_bank": 3000}, { "hand_state": "default", "game_state": "sit_out", "seat_id": 1, "money_on_the_table": 1000, "money_in_the_bank": 1000}]}};
