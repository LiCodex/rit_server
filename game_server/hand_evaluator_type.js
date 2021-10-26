const HandEvaluatorType = class {
  static ROYAL_FLUSH = 9;
  static STRAIGHT_FLUSH = 8;
  static FOUR_OF_A_KIND = 7;
  static FULL_HOUSE = 6;
  static FLUSH = 5;
  static STRAIGHT = 4;
  static THREE_OF_A_KIND = 3;
  static TWO_PAIRS = 2;
  static ONE_PAIR = 1;
  static HIGH_CARD = 0;
}

module.exports = HandEvaluatorType
