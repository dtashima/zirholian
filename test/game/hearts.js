var assert = require('assert');
var hearts_game = require('../../js/game/hearts.js');
var heartsdeck = require('../../js/game/deck.js');
var HeartsGame = hearts_game.HeartsGame;
var HeartsHand = hearts_game.HeartsHand;
var Card = heartsdeck.Card;

describe('Hearts Game Test', function() {
    var gameId = null;
    var game = null;
    beforeEach(function(done) {
        console.log('beforeEach');
        gameId = null;
        game = new HeartsGame();
        game.initNew(["aaa", "bbb", "ccc", "ddd"]);
        console.log(game);
        done();
    });

    afterEach(function(done) {
        console.log('teardown');
        done();
    });

    describe('#_nextPlayer()', function() {
        it('should get the next player', function(done) {
            assert.equal(game._nextPlayer("aaa"), "bbb");
            assert.equal(game._nextPlayer("bbb"), "ccc");
            assert.equal(game._nextPlayer("ccc"), "ddd");
            assert.equal(game._nextPlayer("ddd"), "aaa");
            done();
        });
    });

    describe('passing test', function() {
        var hand = null;
        before(function() {
            console.log('here: ' + game.passingStrategy.getMethod(0));
            hand = new HeartsHand(game, 0, game.passingStrategy.getMethod(0));
            hand.initNew();
            console.log('hand: ' + JSON.stringify(hand));
        });
        it('should fail when trying to pass in a completed game', function(done) {

            assert.equal(hand.handState, HeartsHand.HAND_STATE_STARTED);

            // test pass in wrong game state
            hand.handState = HeartsHand.HAND_STATE_FINISHED;
            assert.throws(() => {
                hand.addPlayerPasses('aaa', {'bbb' : hand.playerHands['aaa'].slice(0,3)});
            }, Error);
            done();
        });

        it('should fail when not enough cards are passed', function(done) {
            hand.handState = HeartsHand.HAND_STATE_STARTED;

            assert.throws(() => {
                hand.addPlayerPasses('aaa', {'bbb' : hand.playerHands['aaa'].slice(0,2)});
            }, Error);
            done();
        });

        it('should fail when too many cards are passed', function(done) {
            assert.throws(() => {
                hand.addPlayerPasses('aaa', {'bbb' : hand.playerHands['aaa'].slice(0,4)});
            }, Error);

            done();
        });

        it('should pass the cards correctly', function(done) {
            let aaapass = {'bbb' : hand.playerHands['aaa'].slice(0,3)};
            hand.addPlayerPasses('aaa', aaapass);
            assert(hand.passes['aaa'] == aaapass);

            let bbbpass = {'ccc' : hand.playerHands['bbb'].slice(0,3)};
            hand.addPlayerPasses('bbb', bbbpass);
            assert(hand.passes['bbb'] == bbbpass);

            let cccpass = {'ddd' : hand.playerHands['ccc'].slice(0,3)};
            hand.addPlayerPasses('ccc', cccpass);
            assert(hand.passes['ccc'] == cccpass);

            console.log(JSON.stringify(hand.playerHands['aaa']));

            let dddpass = {'aaa' : hand.playerHands['ddd'].slice(0,3)};
            hand.addPlayerPasses('ddd', dddpass);
            assert(hand.passes['ddd'] == dddpass);
            
            // passes done, should execute
            console.log(JSON.stringify(hand.playerHands['aaa']));
            assert(hand.playerHands['aaa'].indexOf(aaapass['bbb'][0]) < 0);
            assert(hand.playerHands['bbb'].indexOf(aaapass['bbb'][0]) >= 0);
            assert(hand.handState == HeartsHand.HAND_STATE_PASSED);
            done();
        });
    
    });

    describe('blood on first trick ok', function() {
        var hand = null;
        before(function() {
            game.bloodOnFirstTrick = true;
            hand = new HeartsHand(game, 0, game.passingStrategy.getMethod(0));
            const deck = new heartsdeck.Deck();
            deck.cards = [];
            deck.addCards(); // unshuffled
            hand.initNew(deck);

            hand.addPlayerPasses('aaa', {'bbb' : hand.playerHands['aaa'].slice(8,11)});
            hand.addPlayerPasses('bbb', {'ccc' : hand.playerHands['bbb'].slice(0,3)});
            hand.addPlayerPasses('ccc', {'ddd' : hand.playerHands['ccc'].slice(0,3)});
            hand.addPlayerPasses('ddd', {'aaa' : hand.playerHands['ddd'].slice(0,3)});
        });

        it('should not fail if blood on the first trick is allowed', function() {
            let a = new hearts_game.Action('aaa', Card.get(Card.CLUBS, '2'));
            let b = new hearts_game.Action('bbb', Card.get(Card.HEARTS, 'Q'));
            
            assert(hand.isValidPlay(a)[0], 'a can play 2 of clubs');
            hand.playCard(a);
            const bv = hand.isValidPlay(b);
            assert(bv[0], 'b tries to play Q of hearts, is ok');
            assert.equal(bv[1], null);

            let b2 = new hearts_game.Action('bbb', Card.get(Card.SPADES, 'Q'));
            const bv2 = hand.isValidPlay(b2);
            assert(bv2[0], 'b tries to play Q of spaces, is ok');
            assert.equal(bv2[1], null);

        });
    });
    
    describe('playing cards and taking tricks', function() {
        var hand = null;
        before(function() {
            game.bloodOnFirstTrick = false;
            hand = new HeartsHand(game, 0, game.passingStrategy.getMethod(0));
            const deck = new heartsdeck.Deck();
            deck.cards = [];
            deck.addCards(); // unshuffled
            hand.initNew(deck);

            hand.addPlayerPasses('aaa', {'bbb' : hand.playerHands['aaa'].slice(8,11)});
            hand.addPlayerPasses('bbb', {'ccc' : hand.playerHands['bbb'].slice(0,3)});
            hand.addPlayerPasses('ccc', {'ddd' : hand.playerHands['ccc'].slice(0,3)});
            hand.addPlayerPasses('ddd', {'aaa' : hand.playerHands['ddd'].slice(0,3)});
        });

        it('should have aaa be first to act', function() {
            assert(hand.nextToAct == 0);
        });

        it('should fail if blood on the first trick is not allowed', function() {
            console.log(`aaa hand: ${hand.playerHands['aaa']}`);
            console.log(`bbb hand: ${hand.playerHands['bbb']}`);
            console.log(`ccc hand: ${hand.playerHands['ccc']}`);
            console.log(`ddd hand: ${hand.playerHands['ddd']}`);

            const clubs_2 = Card.get(Card.CLUBS, '2');
            const a = new hearts_game.Action('aaa', clubs_2);
            const b = new hearts_game.Action('bbb', Card.get(Card.HEARTS, 'Q'));
            
            assert(hand.isValidPlay(a)[0], 'a can play 2 of clubs');
            hand.playCard(a);

            // make sure card played is in trick
            assert(typeof Object.values(hand.currentTrick().cards).find(x => { return x.valueOf() == clubs_2.valueOf(); } ) != 'undefined',
                   'Card played is not in trick.');

            // make sure card is no longer in player's hand
            assert(typeof Object.values(hand.playerHands['aaa']).find(x => { return x.valueOf() == clubs_2.valueOf(); } ) == 'undefined',
                  'Card played is still in player\'s hand');
            
            const bv = hand.isValidPlay(b);
            assert(!bv[0], 'b tries to play Q of hearts, fails');
            assert.equal(bv[1], HeartsHand.ERROR_NO_BLOOD_ON_FIRST_TRICK, 'error is no blood on first trick');

            let b2 = new hearts_game.Action('bbb', Card.get(Card.SPADES, 'Q'));
            const bv2 = hand.isValidPlay(b2);
            assert(!bv2[0], 'b tries to play Q of spaces, fails');
            assert.equal(bv2[1], HeartsHand.ERROR_NO_BLOOD_ON_FIRST_TRICK, 'error is no blood on first trick (QS)');
        });

        it('should fail if suit is not followed', function() {
            const b = new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, 'A'));
            const c = new hearts_game.Action('ccc', Card.get(Card.DIAMONDS, 'J'));
            const bv = hand.isValidPlay(b);
            assert(bv[0], 'b can play A of diamonds, ' + bv[1]);
            hand.playCard(b);

            const cv = hand.isValidPlay(c);
            assert(!cv[0], 'c tries to play J of diamonds, fails');
            assert(cv[1] == HeartsHand.ERROR_MUST_FOLLOW_SUIT, 'error is must follow suit');
            
        });

        it('should fail if player doesn\'t have the card', function() {
            const c = new hearts_game.Action('ccc', Card.get(Card.HEARTS, 'A'));
            const cv = hand.isValidPlay(c);

            assert(!cv[0], 'c cannot play AH');
            assert.equal(cv[1], HeartsHand.ERROR_MUST_HAVE_CARD);
        });

        it('should give trick to player with highest club', function() {
            const c = new hearts_game.Action('ccc', Card.get(Card.CLUBS, 'J'));
            hand.playCard(c);

            const d = new hearts_game.Action('ddd', Card.get(Card.CLUBS, 'Q'));
            hand.playCard(d);

            assert.equal(hand.nextToAct, 3, 'ddd is next to act.');
            assert.equal(hand.tricksTaken['ddd'].length, 1);
            
        });
            
    });
    
    describe('end of hand', function() {
        var hand = null;
        beforeEach(function() {
            hand = new HeartsHand(game, 0, game.passingStrategy.getMethod(0));
            const deck = new heartsdeck.Deck();
            deck.cards = [];
            deck.addCards(); // unshuffled
            hand.initNew(deck);

            hand.addPlayerPasses('aaa', {'bbb' : hand.playerHands['aaa'].slice(4,7)});
            hand.addPlayerPasses('bbb', {'ccc' : hand.playerHands['bbb'].slice(0,3)});
            hand.addPlayerPasses('ccc', {'ddd' : hand.playerHands['ccc'].slice(0,3)});
            hand.addPlayerPasses('ddd', {'aaa' : hand.playerHands['ddd'].slice(4,7)});

            console.log(`aaa hand: ${hand.playerHands['aaa']}`);
            console.log(`bbb hand: ${hand.playerHands['bbb']}`);
            console.log(`ccc hand: ${hand.playerHands['ccc']}`);
            console.log(`ddd hand: ${hand.playerHands['ddd']}`);
        });

        it('should end the hand with points tallied', function() {
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.CLUBS, '2')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.SPADES, 'K')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.CLUBS, 'J')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, 'K')));

            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, 'Q')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.CLUBS, 'A')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.HEARTS, 'Q')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.CLUBS, '7')));

            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.DIAMONDS, 'Q')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, 'T')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.DIAMONDS, 'J')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.DIAMONDS, '4')));

            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.DIAMONDS, '8')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, 'A')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.DIAMONDS, '7')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.HEARTS, 'A')));

            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.SPADES, '9')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.SPADES, 'T')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.SPADES, 'J')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.SPADES, '8')));

            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.SPADES, '7')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.SPADES, '4')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.SPADES, '5')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.SPADES, '6')));

            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, '4')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.CLUBS, '6')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.HEARTS, '8')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.CLUBS, '3')));

            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.HEARTS, '3')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.HEARTS, '4')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.HEARTS, 'K')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.HEARTS, 'T')));

            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.DIAMONDS, '3')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.HEARTS, '6')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.SPADES, 'Q')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, '2')));

            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.SPADES, '2')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, '9')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.SPADES, '3')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, 'K')));

            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.HEARTS, '7')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, '9')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.HEARTS, '5')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.HEARTS, '2')));

            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.HEARTS, 'J')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, '6')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.HEARTS, '9')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, '8')));

            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.CLUBS, 'T')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, '5')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.SPADES, 'A')));
            const points = hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, '5')));

            console.log(points);
            assert.equal(points['aaa'], 7, 'aaa\'s points don\'t match');
            assert.equal(points['bbb'], 1, 'bbb\'s points don\'t match');
            assert.equal(points['ccc'], 18,'ccc\'s points don\'t match');
            assert.equal(points['ddd'], 0, 'ddd\'s points don\'t match');
        });
        
        it('should give everyone 26 points if someone shoots the moon', function () {
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.CLUBS, '2')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.SPADES, '9')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.CLUBS, 'J')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, 'K')));

            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, 'Q')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.CLUBS, 'A')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.SPADES, '5')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.CLUBS, '7')));

            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.DIAMONDS, 'Q')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, '2')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.DIAMONDS, 'J')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.DIAMONDS, '4')));

            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.DIAMONDS, '8')));
            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, '9')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.DIAMONDS, '7')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.HEARTS, 'A')));

            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.SPADES, 'K')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.SPADES, 'T')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.SPADES, 'J')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.SPADES, 'Q')));

            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, 'A')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.DIAMONDS, '3')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.HEARTS, 'T')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.HEARTS, 'J')));

            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, 'K')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.HEARTS, 'K')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.HEARTS, '6')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.HEARTS, '7')));

            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, 'T')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.HEARTS, '9')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.HEARTS, '2')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.HEARTS, '3')));

            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, '6')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.HEARTS, '5')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.SPADES, '7')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.CLUBS, 'T')));

            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.DIAMONDS, '5')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.SPADES, 'A')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, '9')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.SPADES, '8')));

            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.HEARTS, 'Q')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.SPADES, '6')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, '8')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.CLUBS, '6')));

            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.HEARTS, '8')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.CLUBS, '3')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, '4')));
            hand.playCard(new hearts_game.Action('aaa', Card.get(Card.SPADES, '4')));

            hand.playCard(new hearts_game.Action('bbb', Card.get(Card.HEARTS, '4')));
            hand.playCard(new hearts_game.Action('ccc', Card.get(Card.SPADES, '2')));
            hand.playCard(new hearts_game.Action('ddd', Card.get(Card.CLUBS, '5')));
            const points = hand.playCard(new hearts_game.Action('aaa', Card.get(Card.SPADES, '3')));

            console.log(points);
            assert.equal(points['aaa'], 26, 'aaa\'s points don\'t match');
            assert.equal(points['bbb'], 0, 'bbb\'s points don\'t match');
            assert.equal(points['ccc'], 26,'ccc\'s points don\'t match');
            assert.equal(points['ddd'], 26, 'ddd\'s points don\'t match');

        });
    });

});


/*

class HeartsHandTest(unittest.TestCase):
    def setUp(self):
        self.game = HeartsGame(['aaa', 'bbb', 'ccc', 'ddd'])

    def test_nextPlayer(self):
        self.assertEqual(self.game._nextPlayer('aaa'), 'bbb')
        self.assertEqual(self.game._nextPlayer('bbb'), 'ccc')
        self.assertEqual(self.game._nextPlayer('ccc'), 'ddd')
        self.assertEqual(self.game._nextPlayer('ddd'), 'aaa')
        with self.assertRaises(ValueError):
            self.game._nextPlayer('asdf')
        
        
    def testHandPassing(self):
        hand = HeartsHand(self.game, 0, self.game.passingStrategy.getMethod(0))
        logging.info(hand)

        self.assertEqual(hand.handState, HeartsHand.HAND_STATE_STARTED)

        # test pass in wrong game state
        hand.handState = HeartsHand.HAND_STATE_FINISHED
        with self.assertRaises(RuntimeError):
            hand.addPlayerPasses('aaa', {'bbb' : hand.playerHands['aaa'][0:3]})

        hand.handState = HeartsHand.HAND_STATE_STARTED
        # not enough cards
        with self.assertRaises(RuntimeError):
            hand.addPlayerPasses('aaa', {'bbb' : hand.playerHands['aaa'][0:2]})

        # too many
        with self.assertRaises(RuntimeError):
            hand.addPlayerPasses('aaa', {'bbb' : hand.playerHands['aaa'][0:4]})

    def testPassLeft(self):
        hand = HeartsHand(self.game, 0, self.game.passingStrategy.getMethod(0))
        logging.info(hand)
        
        hand.addPlayerPasses('aaa', {'bbb' : hand.playerHands['aaa'][0:3]})
        hand.addPlayerPasses('bbb', {'ccc' : hand.playerHands['bbb'][0:3]})
        hand.addPlayerPasses('ccc', {'ddd' : hand.playerHands['ccc'][0:3]})
        hand.addPlayerPasses('ddd', {'aaa' : hand.playerHands['ddd'][0:3]})
        logging.info(hand)

    def testPassRight(self):
        hand = HeartsHand(self.game, 0, self.game.passingStrategy.getMethod(1))
        logging.info(hand)
        
        hand.addPlayerPasses('aaa', {'ddd' : hand.playerHands['aaa'][0:3]})
        hand.addPlayerPasses('bbb', {'aaa' : hand.playerHands['bbb'][0:3]})
        hand.addPlayerPasses('ccc', {'bbb' : hand.playerHands['ccc'][0:3]})
        hand.addPlayerPasses('ddd', {'ccc' : hand.playerHands['ddd'][0:3]})
        logging.info(hand)

    def testPassAcross(self):
        hand = HeartsHand(self.game, 0, self.game.passingStrategy.getMethod(2))
        logging.info(hand)
        
        hand.addPlayerPasses('aaa', {'ccc' : hand.playerHands['aaa'][0:3]})
        hand.addPlayerPasses('bbb', {'ddd' : hand.playerHands['bbb'][0:3]})
        hand.addPlayerPasses('ccc', {'aaa' : hand.playerHands['ccc'][0:3]})
        hand.addPlayerPasses('ddd', {'bbb' : hand.playerHands['ddd'][0:3]})
        logging.info(hand)

    def testPassCrazy(self):
        hand = HeartsHand(self.game, 0, self.game.passingStrategy.getMethod(3))
        logging.info(hand)
        
        hand.addPlayerPasses('aaa', {'bbb' : [hand.playerHands['aaa'][0]],
                                     'ccc' : [hand.playerHands['aaa'][1]],
                                     'ddd' : [hand.playerHands['aaa'][2]],
                                 })
        hand.addPlayerPasses('bbb', {'aaa' : [hand.playerHands['bbb'][0]],
                                     'ccc' : [hand.playerHands['bbb'][1]],
                                     'ddd' : [hand.playerHands['bbb'][2]],
                                 })
        hand.addPlayerPasses('ccc', {'aaa' : [hand.playerHands['ccc'][0]],
                                     'bbb' : [hand.playerHands['ccc'][1]],
                                     'ddd' : [hand.playerHands['ccc'][2]],
                                 })
        hand.addPlayerPasses('ddd', {'aaa' : [hand.playerHands['ddd'][0]],
                                     'bbb' : [hand.playerHands['ddd'][1]],
                                     'ccc' : [hand.playerHands['ddd'][2]],
                                 })
        logging.info(hand)

    def testHand(self):
        hand = HeartsHand(self.game, 0, self.game.passingStrategy.getMethod(0))
        logging.info(hand)
        
        hand.addPlayerPasses('aaa', {'bbb' : hand.playerHands['aaa'][0:3]})
        hand.addPlayerPasses('bbb', {'ccc' : hand.playerHands['bbb'][0:3]})
        hand.addPlayerPasses('ccc', {'ddd' : hand.playerHands['ccc'][0:3]})
        hand.addPlayerPasses('ddd', {'aaa' : hand.playerHands['ddd'][0:3]})

        hand.doAction(Action('aaa', hand.playerHands['aaa'][0]))

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()

        
*/
