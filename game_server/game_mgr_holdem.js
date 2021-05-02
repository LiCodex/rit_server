var room_mgr = require("./room_mgr");
var user_mgr = require("./user_mgr");


// number of hand ranking
const NO_OF_RANKINGS  = 6;
const MAX_NO_OF_PAIRS = 2;
const NO_OF_RANKS = 13;
const NO_OF_SUITE = 4;
const RANKING_FACTORS = [371293, 28561, 2197, 169, 13, 1];
var HAND_TYPE;
var HAND_VALUE;
var cards = [];
var rank_distribution = new Array(NO_OF_RANKS);
var suite_distribution = new Array(NO_OF_SUITE);
var no_of_pairs = 0;
var pairs = new Array(MAX_NO_OF_PAIRS);
var flush_suite = -1;
var flush_rank = -1;
var triple_rank = -1;
var wheeling_ace = false;
var quad_rank = -1;
var rankings = new Array(NO_OF_RANKINGS);


var board = new Array(5);
// in case deal twice
var board2 = new Array(5);
var active_players = new Array(8);


function calculate_distribution() {
    for (var card in cards) {
        rank_distribution[card.rank]++;
        suite_distribution[card.suite]++;
    }
};

function find_flush() {
    for (var i = 0; i < NO_OF_SUITE; i++) {
        if (suite_distribution[i] >= 5) {
            flush_suite = i;
            for (var card in cards) {
                if (card.suite == flush_suite) {
                    if (!wheeling_ace || card.rank != ACE) {
                        flush_rank = card.rank;
                        break;
                    }
                }
            }
        }
        break;
    }
}

function find_straight() {
    var in_straight = false;
    var rank = -1;
    var count = 0;
    for (var i = NO_OF_RANKINGS - 1; i >= 0 ;i--) {
        if (rank_distribution[i] == 0) {
            in_straight = false;
            count = 0;
        } else {
            if (!in_straight) {
                in_straight = true;
                rank = i;
            }
            count++;
            if (count >= 5) {
                straight_rank = rank;
                break;
            }
        }
    }
    if ((count == 4) && (rank = 5) && (rank_distribution[ACE] > 0)) {
        wheeling_ace = true;
        straight_rank = rank;
    }
};

function find_dups() {
    for (var i = NO_OF_RANKINGS - 1; i >= 0; i--) {
        if (rank_distribution[i] == 4) {
            quad_rank = i;
        } else if (rank_distribution[i] == 3) {
            triple_rank = i;
        } else if (rank_distribution[i] == 2) {
            if (no_of_pairs < MAX_NO_OF_PAIRS) {
                pairs[no_of_pairs++] = i;
            }
        }
    }
};

function calculate_high_card() {
    HAND_TYPE = HIGH_CARD;
    rankings[0] == HAND_TYPE.value;
    var index = 1;
    for (var card in cards) {
        rankings[index++] = card.rank;
        if (index > 5) {
            break;
        }
    }
};

function is_one_pair() {
    if (no_of_pairs == 1) {
        HAND_TYPE = ONE_PAIR;
        rankings[0] = HAND_TYPE.value;
        var pair_rank = pairs[0];
        rankings[1] = pair_rank;

        var index = 2;
        for (var card in cards) {
            var rank = card.rank;
            rankings[index++] = rank;
            if (index > 4) {
                break;
            }
        }
        return true;
    } else {
        return false;
    }
};

function is_two_pair() {
    if (no_of_pairs == 2) {
        hand_type = TWO_PAIRS;
        rankings[0] = hand_type.value;

        var high_rank = pairs[0];
        var low_rank = pairs[1];
        rankings[1] = high_rank;
        rankings[2] = low_rank;
        
        for (var card in cards) {
            var rank = card.rank;
            if ((rank != high_rank) && (rank != low_rank)) {
                rankings[3] = rank;
                break;
            }
        }
        return true;
    } else {
        return false;
    }
};

function is_three_of_a_kind() {
    if (triple_rank != -1) {
        hand_type = THREE_OF_A_KIND;
        rankings[0] = hand_type.value;
        rankings[1] = triple_rank;

        var index = 2;
        for (var card in cards) {
            var rank = card.rank;
            if (rank != triple_rank) {
                ranking[index++] = rank;
                if (index > 3) {
                    break;
                }
            }
        }
    } else {
        return false;
    }
};

function is_straight() {
    if (straight_rank != -1) {
        hand_type = STRAIGHT;
        rankings[0] = hand_type.value;
        rankings[1] = straight_rank;
        return true;
    } else {
        return false;
    }
};

function is_flush() {
    if (flush_suite != -1) {
        hand_type = FLUSH.value;
        rankings[0] = hand_type.value;
        var index = 1;
        for (var card in cards) {
            if (card.suite == flush_suite) {
                var rank = card.rank;
                if (index == 1) {
                    flush_rank = rank;
                }
                rankings[index++] = rank;
                if (index > 5) {
                    break;
                }
            }
        }
        return true;
    } else {
        return false;
    }
};

function is_full_house() {
    if ((triple_rank != -1) && (no_of_pairs > 0)) {
        hand_type = FULL_HOUSE;
        rankings[0] = hand_type.value;
        rankings[1] = triple_rank;
        rankings[2] = pairs[0];
        return true;
    } else {
        return false;
    }
};

function is_four_of_a_kind() {
    if (quad_rank != -1) {
        hand_type = FOUR_OF_A_KIND;
        rankings[0] = hand_type.value;
        rankings[1] = quad_rank;
        
        var index = 2;
        for (var card in cards) {
            var rank = card.rank;
            if (card != quad_rank) {
                rankings[index++] = rank;
                break;
            }
        }
        return true;
    } else {
        return false;
    }
}

function is_straight_flush() {
    if ((straight_rank != -1) && flush_rank == straight_rank) {
        var straight_rank2 = -1;
        var last_suite = -1;
        var last_rank = -1;
        var in_straight = 1;
        var in_flush = 1;
        for (var card in cards) {
            var rank = card.rank;
            var suit = card.suite;
            if (last_rank != -1) {
                var rank_diff = last_rank - rank;
                if (rank_diff == 1) {
                    in_straight++;
                    if (straight_rank2 == -1) {
                        straight_rank2 = last_rank;
                    }
                    if (suite == last_suite) {
                        in_flush++;
                    } else {
                        in_flush = 1;
                    }
                    if (in_straight >= 5 && in_flush >= 5) {
                        break;
                    }
                } else if(rank_diff == 0) {

                } else {
                    straight_rank2 = -1;
                    in_straigh = 1;
                    in_flush = 1;
                }

            }
            last_rank = rank;
            last_suite = suite;
        }

        if(in_straight >= 5 && in_flush >= 5) {
            if (straight_rank == ACE) {
                hand_type = ROYAL_FLUSH;
                rankings[0] = hand_type.value;
                return true;
            } else {
                hand_type = STRAIGHT_FLUSH;
                rankings[0] = hand_type.value;
                rankings[1] = straight_rank2;
                return true;
            }
        } else if (wheeling_ace && in_straight >= 4 && in_flush >= 4) {
            hand_type = STRAIGHT_FLUSH;
            rankings[0] = hand_type.value;
            rankings[1] = straight_rank2;
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

// this is to give notification to all players.
function notify_board_updated() {
    for (var player in players) {
        player.board_update(board, bet, pot);
    }
};

function reset_hand() {
    board.clear();
    pots.clear();
    notify_board_updated();
    active_players.clear();
    for (var player in players) {
        player.reset_hand();
        if (player.get_cash() >= big_blind) {
            active_players.push(player);
        }
    }

    // rotate dealer button
    dealer_position = (dealer_position + 1) % active_players.length;
    dealer = active_players.get(dealer_position);

    deck.shuffle();

};

function deal_hole_cards() {
    for (var player in players) {
        player.set_hold_cards(deck.deal(2));
    }
};

function get_context(chair_id) {
    var context = {};
    context.m = 'load_context';
    context.c = 'room';

    var data = {};
    data.my_chair_id = chair_id;
    data.actor_position = actor_position;
    data.timer = timer;
    data.ctx_seq = ctx_seq;
    data.round = round;
    data.config = config;
    data.state = state;
    data.dealer_position = dealer_position;
    data.room_key = room_key;
    data.owner = owner;
    data.pots = pots;
    data.board = board;
    //data.board2 = board2;

    context.data = data;
    return context;
};



function game_start() {
    state = 'playing';
    playing_state = 'start';
    if (round == 0) {
        created_time = datetime.now();
    }

    round++;

    table = tables.get_table_by_key(room_key);
    table.status = 2;
    table.save();

    for (var player in players) {
    //    res = 
    }
};



function check_start() {

};
