class holdemHandEvaluator {
    static NO_OF_RANKINGS = 6;
    static MAX_NO_OF_PAIRS = 2;
    static RANKING_FACTOR = [371293, 28561, 2197, 169, 13, 1];
    constructor () {
        var type;
        var value = 0;
        var cards = [];
        var rankDist = new Array(4);
        var suitDist = new Array(4);
        var noOfPairs = 0;
        var pairs = new Array(MAX_NO_OF_PAIRS);
        var flushSuit = -1;
        var flushRank = -1;
        var straightRank = -1;
        var wheelingAce = false;
        var tripleRank = -1;
        var quadRank = -1;
        var ranking = new Array[NO_OF_RANKINGS];
    }

    calculateDistributions() {
        for (var i = 0; i < this.cards.length; i++) {
            this.rankDist[cards[i].getRank()]++;
            this.suitDist[cards[i].getSuit()]++;
        }
    }

    
    
    

}


