const Card = require('./card.js');

const HandEvaluator = class {
  static NO_OF_RANKINGS  = 6;
  static MAX_NO_OF_PAIRS = 2;
  static NO_OF_RANKS = 13;
  static NO_OF_SUITE = 4;
  static RANKING_FACTORS = [371293, 28561, 2197, 169, 13, 1];
  hand_type;
  hand_value = 0;
  cards = [];
  rank_distribution = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  suite_distribution = new Array(0, 0, 0, 0);
  no_of_pairs = 0;
  pairs = new Array(0, 0);
  flush_suite = -1;
  flush_rank = -1;
  triple_rank = -1;
  straight_rank = -1;
  wheeling_ace = false;
  quad_rank = -1;
  rankings = new Array(0, 0, 0, 0, 0, 0);

  constructor(community_cards, hole_cards) {
    let all_cards = [];
    let community = community_cards || [];
    let hole = hole_cards || [];
    for (let i = 0; i < community.length; i++) {
      all_cards.push(community[i]);
    }
    for (let i = 0; i < hole.length; i++) {
      all_cards.push(hole[i]);
    }
    this.cards = all_cards;
    console.log("rank_distribution1");
    console.log(this.rank_distribution);
    console.log("suite_distribution1");
    this.calculate_distribution();
    console.log("rank_distribution2");
    console.log(this.rank_distribution);
    console.log("suite_distribution2");
    this.find_straight();
    console.log("rank_distribution3");
    console.log(this.rank_distribution);
    console.log("suite_distribution3");
    this.find_flush();
    console.log("rank_distribution4");
    console.log(this.rank_distribution);
    console.log("suite_distribution4");
    this.find_dups();
    console.log("rank_distribution5");
    console.log(this.rank_distribution);
    console.log("suite_distribution5");

    let is_special_value = this.is_straight_flush()
                       || this.is_four_of_a_kind()
                       || this.is_full_house()
                       || this.is_flush()
                       || this.is_straight()
                       || this.is_three_of_a_kind()
                       || this.is_two_pair()
                       || this.is_one_pair();

    if (!is_special_value) {
      this.calculate_high_card();
    }

    console.log("ranking");
    console.log(this.rankings);
    for (var i = 0; i < HandEvaluator.NO_OF_RANKINGS; i++) {
      this.hand_value += this.rankings[i] * HandEvaluator.RANKING_FACTORS[i];
    }
  }

  get_value() {
    console.log("hand-value");
    return this.hand_value;
  }

  get_type() {
    console.log("hand type");
    return this.hand_type;
  }

  calculate_distribution() {
    console.log("rank_distribution7");
    console.log(this.rank_distribution);
    console.log("suite_distribution7");
    console.log(this.suite_distribution);

    for (var i = 0; i < this.cards.length; i++) {
      console.log("this.cards[i].rank");
      console.log(this.cards[i].rank);
      this.rank_distribution[this.cards[i].rank]++;
      this.suite_distribution[this.cards[i].suite]++;
    }
    console.log("rank_distribution8");
    console.log(this.rank_distribution);
    console.log("suite_distribution8");
    console.log(this.suite_distribution);
  };

  find_flush() {
    for (var i = 0; i < HandEvaluator.NO_OF_SUITE; i++) {
      if (this.suite_distribution[i] >= 5) {
        this.flush_suite = i;
        for (var i = 0; i < this.cards.length; i++) {
          if (this.cards[i].suite == this.flush_suite) {
            if (!this.wheeling_ace || this.cards[i].rank != Card.ACE) {
              this.flush_rank = this.cards[i].rank;
              break;
            }
          }
        }
        break;
      }
    }
  }

  find_straight() {
    var in_straight = false;
    var rank = -1;
    var count = 0;
    for (var i = HandEvaluator.NO_OF_RANKINGS - 1; i >= 0 ;i--) {
      if (this.rank_distribution[i] == 0) {
        in_straight = false;
        count = 0;
      } else {
        if (!in_straight) {
          in_straight = true;
          rank = i;
        }
        count++;
        if (count >= 5) {
          this.straight_rank = rank;
          break;
        }
      }
    }
    if ((count == 4) && (rank = Card.FIVE) && (this.rank_distribution[Card.ACE] > 0)) {
      this.wheeling_ace = true;
      this.straight_rank = rank;
    }
  };

  find_dups() {
    for (var i = HandEvaluator.NO_OF_RANKINGS - 1; i >= 0; i--) {
      if (this.rank_distribution[i] == 4) {
        this.quad_rank = i;
      } else if (this.rank_distribution[i] == 3) {
        this.triple_rank = i;
      } else if (this.rank_distribution[i] == 2) {
        if (this.no_of_pairs < HandEvaluator.MAX_NO_OF_PAIRS) {
          this.pairs[this.no_of_pairs++] = i;
        }
      }
    }
  };

  calculate_high_card() {
    this.hand_type = "HIGH_CARD";
    this.rankings[0] == this.type_to_rank(this.hand_type);
    var index = 1;
    console.log(this.cards);
    for (var i = 0; i < this.cards.length; i++) {
      this.rankings[index++] = this.cards[i].rank;
      if (index > 5) {
        break;
      }
    }
  };

  is_one_pair() {
    if (this.no_of_pairs == 1) {
      this.hand_type = "ONE_PAIR";
      this.rankings[0] = this.type_to_rank(this.hand_type);
      var pair_rank = this.pairs[0];
      this.rankings[1] = pair_rank;

      var index = 2;
      for (var i = 0; i < this.cards.length; i++) {
        var rank = this.cards[i].rank;
        this.rankings[index++] = rank;
        if (index > 4) {
          break;
        }
      }
      return true;
    } else {
      return false;
    }
  };

  is_two_pair() {
    if (this.no_of_pairs == 2) {
      this.hand_type = "TWO_PAIRS";
      this.rankings[0] = this.type_to_rank(this.hand_type);

      var high_rank = this.pairs[0];
      var low_rank = this.pairs[1];
      this.rankings[1] = high_rank;
      this.rankings[2] = low_rank;

      for (var i = 0; i < this.cards.length; i++) {
        var rank = this.cards[i].rank;
        if ((rank != high_rank) && (rank != low_rank)) {
          this.rankings[3] = rank;
          break;
        }
      }
      return true;
    } else {
      return false;
    }
  };

  is_three_of_a_kind() {
    if (this.triple_rank != -1) {
      this.hand_type = "THREE_OF_A_KIND";
      this.rankings[0] = this.type_to_rank(this.hand_type);
      this.rankings[1] = this.triple_rank;

      var index = 2;
      for (var i = 0; i < this.cards.length; i++) {
        var rank = this.cards[i].rank;
        if (rank != this.triple_rank) {
          this.rankings[index++] = rank;
          if (index > 3) {
            break;
          }
        }
      }
    } else {
      return false;
    }
  };

  is_straight() {
    if (this.straight_rank != -1) {
      this.hand_type = "STRAIGHT";
      this.rankings[0] = this.type_to_rank(this.hand_type);
      this.rankings[1] = this.straight_rank;
      return true;
    } else {
      return false;
    }
  };

  is_flush() {
    if (this.flush_suite != -1) {
      this.hand_type = "FLUSH";
      this.rankings[0] = this.type_to_rank(this.hand_type);
      var index = 1;
      for (var i = 0; i < this.cards.length; i++) {
        if (this.cards[i].suite == this.flush_suite) {
          var rank = this.cards[i].rank;
          if (index == 1) {
            this.flush_rank = rank;
          }
          this.rankings[index++] = rank;
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

  is_full_house() {
    if ((this.triple_rank != -1) && (this.no_of_pairs > 0)) {
      this.hand_type = "FULL_HOUSE";
      this.rankings[0] = this.type_to_rank(this.hand_type);
      this.rankings[1] = this.triple_rank;
      this.rankings[2] = this.pairs[0];
      return true;
    } else {
      return false;
    }
  };

  is_four_of_a_kind() {
    if (this.quad_rank != -1) {
      this.hand_type = "FOUR_OF_A_KIND";
      this.rankings[0] = this.type_to_rank(this.hand_type);
      this.rankings[1] = this.quad_rank;

      var index = 2;
      for (var i = 0; i < this.cards.length; i++) {
        var rank = this.cards[i].rank;
        if (this.cards[i] != this.quad_rank) {
          this.rankings[index++] = rank;
          break;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  is_straight_flush() {
    if ((this.straight_rank != -1) && this.flush_rank == this.straight_rank) {
      var straight_rank2 = -1;
      var last_suite = -1;
      var last_rank = -1;
      var in_straight = 1;
      var in_flush = 1;
      for (var i = 0; i < this.cards.length; i++) {
        var rank = this.cards[i].rank;
        var suite = this.cards[i].suite;
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
          } else if (rank_diff == 0) {
            // duplicate ranks
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
        if (this.straight_rank == Card.ACE) {
          this.hand_type = "ROYAL_FLUSH";
          this.rankings[0] = this.type_to_rank(this.hand_type);
          return true;
        } else {
          this.hand_type = "STRAIGHT_FLUSH";
          this.rankings[0] = this.type_to_rank(this.hand_type);
          this.rankings[1] = straight_rank2;
          return true;
        }
      } else if (this.wheeling_ace && in_straight >= 4 && in_flush >= 4) {
        this.hand_type = "STRAIGHT_FLUSH";
        this.rankings[0] = this.type_to_rank(this.hand_type);
        this.rankings[1] = straight_rank2;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  type_to_rank(type) {
    let mapping = { "ROYAL_FLUSH": 9, "STRAIGHT_FLUSH": 8, "FOUR_OF_A_KIND": 7, "FULL_HOUSE": 6, "FLUSH": 5, "STRAIGHT": 4, "THREE_OF_A_KIND": 3, "TWO_PAIRS": 2, "ONE_PAIR": 1, "HIGH_CARD": 0 } 0 };
    return mapping[type];
  }
}

module.exports = HandEvaluator
