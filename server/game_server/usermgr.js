var roomMgr = require('./roommgr');
var userList = {};
var userOnline = 0;

exports.bind = function(userId, socket) {
  userList[userId] = socket;
  userOnline++;
};

exports.del = function(userId) {
  delete userList[userId];
  userOnline--;
};

exports.get = function(userId) {
  return userList[userId];
};

exports.isOnline = function(userId) {
  var data = userList[userId];
  if (data != null) {
    return true;
  }
  return false
};

exports.getOnlineCount = function() {
  return userOnline;
};

exports.sendMsg = function(userId, event, msgdata) {
  console.log(event);
  var userInfo = userList[userId];
  if (userInfo == null) {
    return;
  }
  var so
};
