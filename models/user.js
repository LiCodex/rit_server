const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

const UserSchema = new Schema({
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  coins: { type: Number, required: true, default: 0 },
  owner: { type: Schema.Types.ObjectId, ref: 'Owner' },
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  name: String,
  area_code: Number,
  avatar: { type: Number, required: true, default: 1 }
});

UserSchema.pre("save", function (next) {
  let user = this;
  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }

      bcrypt.hash(user.password, salt, null, function (err, hash) {
        if (err) {
          return next(err);
        }

        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.methods.comparePassword = function (password, next) {
  let user = this;
  return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model("User", UserSchema);
