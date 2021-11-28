const Pot = class{
  bet;
  contributors;

  constructor(bet) {
    this.bet = bet;
    this.contributors = new Set();
  }

  get_bet() {
    return this.bet;
  }

  get_contributors() {
    return this.contributors;
  }
  // player supposed to be {chair_id: n, player_id}
  add_contributor(player) {
    this.contributors.add(player);
  }

  has_contributor(player) {
    return this.contributors.has(player);
  }

  get_value() {
    return this.bet * this.contributors.length;
  }

  // keep the main pot and return the new splitted pot
  split(player, partial_bet) {
    var pot = new Pot(this.bet - partial_bet);
    for (var i = 0; i < this.contributors.length; i++) {
      pot.add_contributor(player);
    }
    this.bet = partial_bet;
    this.contributors.add(player);
    return pot;
  }

  clear() {
    this.bet = 0;
    this.contributors.clear();
  }
}

module.exports = Pot
