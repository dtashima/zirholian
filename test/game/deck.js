var assert = require('assert');
var deck = require('../../js/game/deck.js');
var Card = deck.Card;
var Deck = deck.Deck;

describe('Basic deck test', function() {
    
    beforeEach(function(done) {
        done();
    });

    afterEach(function(done) {
        done();
    });

    describe('#card basics()', function() {
        it('should have static fields', function(done) {
            assert.equal('C',  Card.CLUBS);
            done();
        });
        it('should check for correct suits and ranks', function(done) {
            var c = new Card(Card.CLUBS, '2');
            assert.throws(function() {
                new Card(Card.CLUBS, 'x');
            }, Error, "Error thrown");
            
            assert.throws(function() {
                new Card('A', '2');
            }, Error, "Error thrown");

            done();
        });
    });

    describe('#get', function() {
        it('should return the requested card', function(done) {
            var c = Card.get(Card.HEARTS, '5');
            assert.equal(Card.HEARTS,  c.suit);
            assert.equal('5',  c.rank);

            var d = Card.get(Card.HEARTS, '5');
            assert(c == d);

            assert(Card.CARDS[[Card.HEARTS, '5']] != null);

            done();

        });
    });

    describe('#valueOf', function() {
        it('should compare cards correctly', function(done) {
            var c1 = Card.get(Card.HEARTS, '5');
            var c2 = Card.get(Card.HEARTS, '5');
            var c3 = Card.get(Card.HEARTS, '6');
            var c4 = Card.get(Card.SPADES, '6');
            assert(c1 == c2);
            assert(c2 < c3);
            assert(c3 > c4);

            done();
        });
    });

    describe('#deck basics', function() {
        it('should create a randomized deck.', function(done) {
            var d1 = new Deck();
            var d2 = new Deck();
            var s1 = d1.toString();
            var s2 = d2.toString();
            console.log('deck 1: ' + s1);
            console.log('deck 2: ' + s2);
            assert(s1 != s2);

            done();
        });
    });
                
    
});

