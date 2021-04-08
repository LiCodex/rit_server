const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OwnerSchema = new Schema({
    name: String,
    photo: String
});

module.exports = mongoose.model('owner', OwnerSchema);