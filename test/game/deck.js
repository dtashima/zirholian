var assert = require('assert');
var deck = require('../../js/game/deck.js');
var Card = deck.Card

describe('Basic deck test', function() {
    
    beforeEach(function(done) {
        done();
    });

    afterEach(function(done) {
        done();
    });

    describe('#deck basics()', function() {
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
    
});

