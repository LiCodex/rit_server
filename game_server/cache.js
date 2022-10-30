var rooms = [
  {
    _id: "608f829787c9b44b2c186f16",
    community_cards: [],
    name: "test",
    pots: [],
    deck: [],
    seat_count: 8,
    min_buy_in: 50,
    max_buy_in: 400,
    players_count: 0,
    last_bet_time: new Date(),
    XZTIMER: 20,
    smallblind: 1,
    bigblind: 2,
    current: 0,
    round: 0,
    players: [],
    all_players: [],
    action_declare_list: [],
    total_players_count: 0,
    ctx_seq: 0,
    state: "none"
  },
  {
    _id: "6119cbab01f8ca1b5e7ed509",
    name: "test_medium1",
    deck: [],
    seat_count: 8,
    min_buy_in: 50,
    max_buy_in: 400,
    players_count: 2,
    last_bet_time: null,
    XZTIMER: 20,
    smallblind: 1,
    bigblind: 2,
    total_players_count: 0,
    current: 0,
    round: 0,
    duaration: 90,
    players: [
      {
        uid: "61196590e0f26367a6ea43d4",
        hand_state: "default",
        game_state: "playing",
        chair_id: 0,
        money_on_the_table: 400
      },
      {
        uid: "61196878e0f26367a6ea43d5",
        hand_state: "default",
        game_state: "sit_out",
        chair_id: 1,
        money_on_the_table: 100
      }
    ],
    all_players: [],
    action_declare_list: []
  },
  {
    _id: "6119cbd101f8ca1b5e7ed50a",
    name: "test_medium2",
    deck: [],
    seat_count: 8,
    min_buy_in: 50,
    max_buy_in: 400,
    players_count: 2,
    last_bet_time: null,
    XZTIMER: 20,
    smallblind: 1,
    bigblind: 2,
    current: 0,
    round: 0,
    duaration: 90,
    players: [
      {
        uid: "61196590e0f26367a6ea43d4",
        hand_state: "default",
        game_state: "playing",
        chair_id: 0,
        money_on_the_table: 400
      },
      {
        uid: "61196878e0f26367a6ea43d5",
        hand_state: "default",
        game_state: "sit_out",
        chair_id: 1,
        money_on_the_table: 100
      }
    ],
    all_players: [],
    action_declare_list: []
  },
  {
    _id: "6119cbdb01f8ca1b5e7ed50b",
    name: "test_medium3",
    deck: [],
    seat_count: 8,
    min_buy_in: 50,
    max_buy_in: 400,
    players_count: 2,
    last_bet_time: null,
    XZTIMER: 20,
    smallblind: 1,
    bigblind: 2,
    current: 0,
    round: 0,
    duaration: 90,
    players: [
      {
        uid: "61196590e0f26367a6ea43d4",
        hand_state: "default",
        game_state: "playing",
        chair_id: 0,
        money_on_the_table: 400
      },
      {
        uid: "61196878e0f26367a6ea43d5",
        hand_state: "default",
        game_state: "sit_out",
        chair_id: 1,
        money_on_the_table: 100
      }
    ],
    all_players: [],
    action_declare_list: []
  }
];

exports.get_rooms = function() {
    return rooms;
};

exports.get_room = function(room_id) {
    return rooms;
};