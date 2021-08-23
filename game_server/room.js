const Room = class{
  id;
  name;
  owner;
  created_at;
  club_id;
  players;
  status;
  started_at;
  time_duaration;
  chair_counts;
  min_buy_in;
  max_buy_in;
  small_blind;
  big_blind;
  type;
  remaining_time;
  ante;

  constructor() {

  }

  add_player() {
    this.player_counts--;
  }

  remove_player() {
    this.player_counts--;
  }


}

module.exports = Room
