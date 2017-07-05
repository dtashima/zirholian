var assert = require('assert');
var hearts_game = require('../../js/game/hearts.js');
var HeartsGame = hearts_game.HeartsGame;

describe('Hearts Game Test', function() {
    var gameId = null;
    var game = null;
    beforeEach(function(done) {
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
