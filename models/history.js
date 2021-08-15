const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HistorySchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    room_id: { type: Schema.Types.ObjectId, ref: 'Room' }
});

module.exports = mongoose.model('history', HistorySchema);
