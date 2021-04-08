exports.room_join = function(message) {   
    var players = []; 
    var player1 = {'uid': 1, 'chair_id': 0, 'username': 'test1', 'coin': 100 };
    players.push(player1);
    var player2 = {'uid': 2, 'chair_id': 1, 'username': 'test2', 'coin': 121 };
    players.push(player2);
    var player3 = {'uid': 3, 'chair_id': 2, 'username': 'test3', 'coin': 1210 };
    players.push(player3);
    var player4 = {'uid': 4, 'chair_id': 3, 'username': 'test4', 'coin': 1000 };
    players.push(player4);
    var player5 = {'uid': 5, 'chair_id': 4, 'username': 'test5', 'coin': 133 };
    players.push(player5);
    var player6 = {'uid': 6, 'chair_id': 5, 'username': 'test6', 'coin': 11 };
    players.push(player6);
    var player7 = {'uid': 7, 'chair_id': 6, 'username': 'test7', 'coin': 1336 };
    players.push(player7);
    var player8 = {'uid': 8, 'chair_id': 7, 'username': 'test8', 'coin': 1221 };    
    players.push(player8);
    return players;
}