var crypto = require('./crypto');
const mongoose = require('mongoose');
const User = require("../models/user");
const History = require("../models/history");

exports.is_user_exist = function(phone) {
    var user = await User.find({ phone: phone });
    if (user.length > 0) {
      return true;
    } else {
      return false;
    }
};

exports.create_user = function(phone, password, coins) {
  if (exports.is_user_exist(phone)) {
    return false;
  }
  let user = new User();
  user.phone = phone;
  user.password = password;
  user.coins = (coins == null) ? 0 : coins;
  user.save();
  return true;
}

exports.get_user_info = function(phone) {
  var user = await User.find({ phone: phone });
  if (user.length > 0) {
    return user;
  } else {
    return {};
  }
}

exports.add_user_coins = function(phone, coins) {
  User.findOne({phone: phone}, function (err, user) {
    user.coins += coins;
    user.save(function (err) {
      if(err) {
        console.error('ERROR!');
      }
    });
  });
}


exports.get_user_coins = function(phone) {
  var user = await User.find({ phone: phone });
  if (user.length > 0) {
    return { success: true, coins: user.coins };
  } else {
    return { success: false, coins: 0 };
  }
}

exports.get_user_history = function(user_id) {
  var history = await History.find({ user_id: user_id });
  return history;
}


exports.is_room_exist = function(room_id){
  var room = await Room.find({ id: room_id });
  if (room != undefined) {
    return true;
  } else {
    return false;
  }
};

exports.set_room_id_of_user = function(user_id, room_id) {
  User.findOne({id: user_id}, function (err, user) {
    user.room_id = room_id;
    user.save(function (err) {
      if(err) {
        console.error('ERROR!');
      }
    });
  });
};


exports.delete_room = function(room_id) {
  Room.deleteOne({ id: room_id }, function (err) {
    if(err) console.log(err);
    console.log("Successful deletion");
  });
};


exports.archive_room = function(room_id) {

};
