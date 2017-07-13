
module.exports = {
    Card: Card,
    Deck: Deck,
    nice_sort: nice_sort
};

Card.SPADES = 'S';
Card.HEARTS = 'H';
Card.DIAMONDS = 'D';
Card.CLUBS = 'C';
Card.SUITS = [Card.CLUBS, Card.DIAMONDS, Card.SPADES, Card.HEARTS];
Card.RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

Card.CARDS = {};

function Card(suit, rank) {

    Card._check(suit, rank);
    this.suit = suit;
    this.rank = rank;
}

Card._check = function(suit, rank){
    if(Card.RANKS.indexOf(rank) < 0) {
        throw new Error('Rank ' + rank + ' unknown.');
    }
    if(Card.SUITS.indexOf(suit) < 0) {
        throw new Error('Suit ' + suit + ' unknown.');
    }
}

Card.get = function(suit, rank) {
    var card = Card.CARDS[[suit, rank]];
    if(card == null) {
        card = new Card(suit, rank);
        Card.CARDS[[suit, rank]] = card;
    }

    return card;
}


/*
    def from_str(s):
        suit = s[0]
        rank = s[1]
        return Card.get(suit, rank)
*/
Card.prototype.toString = function () {
    return this.suit + this.rank;
}
// used for sorting cards within a hand (purely cosmetic, order
// doesn't affect game play except within a suit)
Card.prototype.valueOf = function() {
    return (Card.SUITS.indexOf(this.suit) * 13) + Card.RANKS.indexOf(this.rank);
}

function Deck() {
    this.cards = [];
    for(var i = 0; i < Card.SUITS.length; i++) {
        for(var j = 0; j < Card.RANKS.length; j++) {
            var card = Card.get(Card.SUITS[i], Card.RANKS[j]);
            this.cards.push(card);
        }
    }
    
    this.cards = shuffle(this.cards);
}

Deck.prototype.toString = function () {
    var out = "";
    for(var i = 0; i < this.cards.length; i++) {
        out += this.cards[i].toString();
    }
    return out;
}

function shuffle(array) {
    var m = array.length, t, i;
    while(m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

// Sorts by suit, then rank
function nice_sort(card1, card2) {
    return card1.valueOf() - card2.valueOf();
}

