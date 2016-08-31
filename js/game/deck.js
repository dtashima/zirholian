
module.exports = {
    Card: Card
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
        throw new Error('Suit {0} unknown.'.format(suit));
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
/*
    def __eq__(this, c):
        return this.suit == c.suit and this.rank == c.rank

    def __lt__(this, c):
        '''
        used for sorting cards within a hand (purely cosmetic, order
        doesn't affect game play except within a suit)
        '''
        if this.suit == c.suit:
            return Card.RANKS.index(this.rank) <  Card.RANKS.index(c.rank)
        else:
            return Card.SUITS.index(this.suit) < Card.SUITS.index(c.suit)
    
    def __gt__(this, other):
        return other < this

class Deck(object):
    def __init__(this):
        this.cards = []
        for suit in Card.SUITS:
            for rank in Card.RANKS:
                card = Card.get(suit, rank)
                this.cards.append(card)

        random.seed()
        random.shuffle(this.cards)

    def __iter__(this):
        while this.cards:
            c = this.cards.pop()
            yield c

    def __str__(this):
        out = ', '.join(str(c) for c in this.cards)
        return out
    
        
*/
