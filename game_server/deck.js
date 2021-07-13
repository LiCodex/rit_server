const Card = require('./card.js');

const Deck = class{
    static NO_OF_CARDS = 52;
    cards;
    next_card_index = 0;

    constructor() {
        this.cards = [];
        var index = 0;
        for (var suite = Card.NO_OF_SUITES - 1; suite >= 0; suite--) {
            for (var rank = Card.NO_OF_RANKS - 1; rank >= 0; rank--) {
                this.cards[index++] = new Card(rank, suite);
            }
        }
        console.log("this.cards");
        console.log(this.cards);
    }

    shuffle() {
        for (var old_index = 0; old_index < Deck.NO_OF_CARDS; old_index++) {
            var new_index = this.getRandomInt(Deck.NO_OF_CARDS);
            var tmp_card = this.cards[old_index];
            this.cards[old_index] = this.cards[new_index];
            this.cards[new_index] = tmp_card;
        }
        this.next_card_index = 0;
    }

    reset() {
        this.next_card_index = 0;
    }

    deal() {
        if (this.next_card_index + 1 > Deck.NO_OF_CARDS) {
            throw 'no cards left in the deck';
        }
        console.log("this.next_card_index");
        console.log(this.next_card_index);
        return this.cards[this.next_card_index++];
    }

    // deal(no_of_cards){
    //     if (no_of_cards < 1) {
    //         throw 'no_of_cards < 1';
    //     }
    //     if (this.next_card_index + no_of_cards >= Deck.NO_OF_CARDS) {
    //         throw 'No cards in the deck';
    //     }
    //
    //     var dealt_cards = [];
    //     for (var i = 0; i < no_of_cards; i++) {
    //         dealt_cards.push(cards[this.next_card_index++]);
    //     }
    //
    //     return dealt_cards;
    // } 

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}

module.exports = Deck
