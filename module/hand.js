class Hand {
  static MAX_NO_OF_CARDS = 7;
  var cards = new Array(MAX_NO_OF_CARDS);
  var noOfCards = 0;

  constructor() {

  }

  constructor(cards) {
    addCards(cards);
  }

  size() {
    return noOfCards;s
  }

  addCard(card) {

  }

  removeAllCards() {
    noOfCards = 0;
  }

  toString() {
    res = "";
    for (var i = 0; i < noOfCards; i++) {
      res += cards[i];
      if (i < (noOfCards - 1)) {
        res += ' ';
      }
    }
    return res;
  }
}
