const Card = class {
    static NO_OF_RANKS = 13;
    static NO_OF_SUITES = 4;

    static ACE = 14;
    static KING = 13;
    static QUEUE = 12;
    static JACK = 11;
    static TEN = 10;
    static NINE = 9;
    static EIGHT = 8;
    static SEVEN = 7;
    static SIX = 6;
    static FIVE = 5;
    static FOUR = 4;
    static THREE = 3;
    static TWO = 2;

    static SPADE = 3;
    static HEART = 2;
    static CLUB = 1;
    static DIAMOND = 0;

    RANK_SYMBOLS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];
    SUITE_SYMBOLS = ["d", "c", "h", "s"];

    rank;
    suite;

    constructor(rank ,suite) {
        if (rank < 0 || rank > Card.NO_OF_RANKS + 1) {
            throw "invalid rank";
        }
        if (suite < 0 || suite > Card.NO_OF_SUITES - 1) {
            throw "invalid suite";
        }
        this.rank = rank;
        this.suite = suite;
    }

    toString() {
      if (this.rank + 2 < 10) {
        return (this.suite + 1).toString() + "0" + (this.rank + 2).toString();
      } else {
        return (this.suite + 1).toString() + (this.rank + 2).toString();
      }
    }
}

module.exports = Card
