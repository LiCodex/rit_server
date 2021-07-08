const card = require('./card');

class Deck {
    static NO_OF_CARDS = 52;
    cards;
    next_card_index = 0;

    constructor() {
        cards = [];
        var index = 0;
        for (var suite = card.Card.NO_OF_SUITES - 1; suite >= 0; suite--) {
            for (var rank = card.Card.NO_OF_RANKS - 1; rank >= 0; rank--) {
                cards[index++] = new card.Card(suite, rank);
            }
        }
    }

    shuffle() {
        for (var old_index = 0; old_index < NO_OF_CARDS; old_index++) {
            var new_index = getRandomInt(NO_OF_CARDS);
            tmp_card = card[old_index];
            card[old_index] = card[new_index];
            card[new_index] = tmp_card;
        }
        next_card_index = 0;
    }

    reset() {
        next_card_index = 0;
    }

    deal() {
        if (next_card_index + 1 > NO_OF_CARDS) {
            throw 'no cards left in the deck';
        }
        return cards[next_card_index++];
    }

    deal(no_of_cards){
        if (no_of_cards < 1) {
            throw 'no_of_cards < 1';
        }
        if (next_card_index + no_of_cards >= NO_OF_CARDS) {
            throw 'No cards in the deck';
        }

        dealt_cards = [];
        for (var i = 0; i < no_of_cards; i++) {
            dealt_cards.push(cards[next_card_index++]);
        }

        return dealt_cards;
    }
}
