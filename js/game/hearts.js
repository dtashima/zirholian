var Passing = require('./passing.js');

module.exports = {
    HeartsGame : HeartsGame,
//    HeartsHand : HeartsHand;
}


function HeartsGame() {
}

HeartsGame.GAME_STATE_PLAYING = 'GAME_STATE_PLAYING';
HeartsGame.GAME_STATE_FINISHED = 'GAME_STATE_FINISHED';

HeartsGame.prototype.initNew = function(players,
                                        passingStrategy,
                                        jackOfDiamonds,
                                        bloodOnFirstTrick,
                                        maxPoints) {

    passingStrategy = typeof passingStrategy != "undefined" ? passingStrategy : null;
    jackOfDiamonds = typeof jackOfDiamonds != "undefined" ? jackOfDiamonds : false;
    bloodOnFirstTrick = typeof bloodOnFirstTrick != "undefined" ? bloodOnFirstTrick : true;
    maxPoints = typeof maxPoints != "undefined" ? maxPoints : 100;
    
    this.players = players;

    var defaultPassingStrategy = null;
    if(this.players.length == 3) {
        defaultPassingStrategy = Passing.PASSING_STRATEGY_DEFAULT_3_PLAYER;
    } else if (this.players.length == 5) {
        defaultPassingStrategy = Passing.PASSING_STRATEGY_DEFAULT_5_PLAYER;
    } else if (this.players.length == 4) {
        defaultPassingStrategy = Passing.PASSING_STRATEGY_DEFAULT;
    } else {
        throw "Invalid number of players: " + this.players.length;
    }

    if(passingStrategy != null)
        this.passingStrategy = passingStrategy;
    else
        this.passingStrategy = defaultPassingStrategy;

    
    this.jackOfDiamonds = jackOfDiamonds;
    this.bloodOnFirstTrick = bloodOnFirstTrick;
    this.maxPoints = maxPoints;

    this.hands = [];
    this.score = {};
    console.log("players: " + this.players);
    this.players.forEach(function(p) {
        this.score[p] = 0;
    }, this);
    console.log("score: " + JSON.stringify(this.score));

    var numScores = Object.keys(this.score).length;
    if (numScores != this.players.length)
        throw "Duplicate player names found. Number of scores: " + numScores + "; Number of players: " + this.players.length;

    this.firstPlayer = Math.floor(Math.random() * this.players.length);
    
    this.gameState = HeartsGame.GAME_STATE_PLAYING;
};

HeartsGame.prototype._nextPlayer = function(player) {
    if(this.players.indexOf(player) < 0) {
        throw "Player not found: " + player;
    }
    
    var n = this.players.indexOf(player);
    n += 1;
    n = n % this.players.length;
    return this.players[n];
};

/*

class HeartsGame(object):
    GAME_STATE_PLAYING = 'GAME_STATE_PLAYING'
    GAME_STATE_FINISHED = 'GAME_STATE_FINISHED'
    
    def __init__(self, players,
                 passingStrategy = None,
                 jackOfDiamonds = False,
                 bloodOnFirstTrick = True,
                 maxPoints = 100):
        self.players = players
        if len(self.players) == 3:
            defaultPassingStrategy = PASSING_STRATEGY_DEFAULT_3_PLAYER
        elif len(self.players) == 5:
            defaultPassingStrategy = PASSING_STRATEGY_DEFAULT_5_PLAYER
        elif len(self.players) == 4:
            defaultPassingStrategy = PASSING_STRATEGY_DEFAULT
        else:
            raise ValueError('Invalid number of players: {0}'.format(len(self.players)))
            
        self.passingStrategy = passingStrategy or defaultPassingStrategy
        self.jackOfDiamonds = jackOfDiamonds
        self.bloodOnFirstTrick = bloodOnFirstTrick
        self.maxPoints = maxPoints

        self.hands = []
        self.score = {p:0 for p in self.players}
        if len(self.score) != len(self.players):
            raise ValueError('Duplicate player names found.')

        random.seed()
        self.firstPlayer = random.randrange(len(self.players))
        self.gameState = HeartsGame.GAME_STATE_PLAYING

    def currentHand(self):
        numHands = len(self.hands)
        if numHands == 0:
            return None
        return self.hands[numHands-1]
    
    def nextHand(self):
        numHands = len(self.hands)
        if not self.hands[numHands-1].handState == HeartsHand.HAND_STATE_FINISHED:
            logging.info('current hand not finished.')
            return None
        numPlayers = len(self.players)
        passingMethod = self.passingStrategy.getMethod(numHands)
        dealer = numHands % numPlayers 
        
        hand = HeartsHand(self, dealer, passingMethod)
        self.hands.append(hand)
        return hand

    def _nextPlayer(self, player):
        if player not in self.players:
            raise ValueError('Player not found: ' + player)
        n = self.players.index(player)
        n += 1
        n = n % len(self.players)
        return self.players[n]

    def json_dict(self):
        return {
            'type' :                '_heartsGame',
            'players' :             self.players,
            'passingStrategy' :     self.passingStrategy.name,
            'jackOfDiamonds' :      self.jackOfDiamonds,
            'bloodOnFirstTrick' :   self.bloodOnFirstTrick,
            'maxPoints' :           self.maxPoints,
            'firstPlayer' :         self.firstPlayer,
            'gameState' :           self.gameState,
            'hands' :               [hand.json_dict() for hand in self.hands],
            'score' :               self.score,
            }
    def hearts_game_from_dict(d):
        '''
        Generates a HeartsGame object given a json dict.
        '''
        players = d['players']
        passingStrategy = PASSING_STRATEGIES.get(d['passingStrategy'])
        res = HeartsGame(players,
                         passingStrategy=passingStrategy,
                         jackOfDiamonds=d['jackOfDiamonds'],
                         bloodOnFirstTrick=d['bloodOnFirstTrick'],
                         maxPoints = d['maxPoints']
                         )

        hands = [HeartsHand.hearts_hand_from_dict(hd, res) for hd in d['hands']]
        res.hands = hands
        res.score = d['score']
        res.firstPlayer = d['firstPlayer']
        res.gameState = d['gameState']

        return res


class HeartsHand(object):
    HAND_STATE_STARTED =    'HAND_STATE_STARTED'
    HAND_STATE_PASSED =     'HAND_STATE_PASSED'
    HAND_STATE_FINISHED =   'HAND_STATE_FINISHED'
    
    def __init__(self, heartsGame, dealer, passingMethod):
        self.heartsGame = heartsGame
        self.players = self.heartsGame.players
        self.playerDict = {p:1 for p in self.players} # only for quick checks
        self.numPlayers = len(self.players)
        self.playerHands = {p:[] for p in self.players}
        self.tricks = [] # list of dicts(card -> player)
        self.tricksTaken = {p:[] for p in self.players}
        self.dealer = dealer
        self.passingMethod = passingMethod
        self.passes = {}
        self.actions = []

        deck = Deck()
        i = 0
        for card in deck:
            self.playerHands[self.players[i%self.numPlayers]].append(card)
            i += 1

        for p,cards in self.playerHands.items():
            cards.sort()
            
        self._startingHands = copy.deepcopy(self.playerHands)
        self.handState = HeartsHand.HAND_STATE_STARTED

    def addPlayerPasses(self, playerFrom, passes):
        '''
        playerFrom - userId of player doing the pass
        passes - dict of userId:list of cards to pass
        '''
        if self.handState != HeartsHand.HAND_STATE_STARTED:
            raise RuntimeError('Attempted pass when hand in state: {0}'.format(self.handState))
        playerFromIndex = self.players.index(playerFrom)
        legalPassTargets = [self.players[x] for x in \
                            [(i + playerFromIndex) % self.numPlayers for i in self.passingMethod.offsets] \
        ]
        logging.info('playerFrom: {0}, legalPassTargets: {1}'.format(playerFrom, legalPassTargets))
        for p,passCards in passes.items():
            for c in passCards:
                if not legalPassTargets:
                    raise RuntimeError('Too many passes.')
                legalPassTargets.remove(p)

        if legalPassTargets:
            raise RuntimeError('Not enough passes.')
                
        self.passes[playerFrom] = passes

        # check of all players have passed
        for p in self.players:
            if p not in self.passes:
                return

        self._executePass()

        self.tricks.append(collections.OrderedDict())

    def _executePass(self):
        # everyone has passed, execute passes
        logging.info('All players have passed, executing')
        for playerFrom, playerPass in self.passes.items():
            for playerTo, cards in playerPass.items():
                for card in cards:
                    logging.debug('playerFrom: {0} playerTo: {1} card:{2}'.format(playerFrom, playerTo, card))
                    self.playerHands[playerFrom].remove(card)
                    self.playerHands[playerTo].append(card)

        for player, hand in self.playerHands.items():
            hand.sort()
            if len(hand) != 13:
                raise RuntimeError('Error after pass, hand does not have 13 cards: {0}, {1}'
                                   .format(player, hand))
        self.handState = HeartsHand.HAND_STATE_PASSED

    def doAction(self, action):
        # check for valid play
        
        
        self.actions.append(action)
        currentTrick = self.tricks[-1]
        currentTrick[action.card] = action.player
        
        # check for last card
#        if len(currentTrick) == len(self.players):
#            taker = currentTrick.keys().sort()[-1]
            
    def isValidPlay(self, action, trick, playerHand):
        if len(trick) == 0:
            if len(self.tricks) == 1 and not self.game.bloodOnFirstTrick:
                if action.card.suit == 'H' or action.card == Card.get('S', 'Q'):
                    return False
            return True # all other opening plays are valid
        else:
            openingCard = trick        
                    
        
    def __str__(self):
        return 'Players: {0}\nHands: {1}\nTricks:{2}\nDealer:{3}\nPassingMethod:{4}' \
           .format(self.players, self.playerHands, self.tricks, self.dealer, self.passingMethod)

    def json_dict(self):
        return {
            'type' :            '_heartsHand',
            'players' :         self.players,
            'startingHands' :   {p:cards_to_json(h) for p, h in self._startingHands.items()},
            'tricksTaken' :     {p:cards_to_json(h) for p, h in self.tricksTaken.items()},
            'tricks' :          [{str(c) : p for (p, c) in d.items()} for d in self.tricks],
            'passingMethod' :   self.passingMethod.offsets,
            'dealer' :          self.dealer,
            'actions' :         [a.json_dict() for a in self.actions],
            'handState' :       self.handState
            }

    def hearts_hand_from_dict(d, heartsGame):
        if d['type'] != '_heartsHand':
            raise ValueError('Wrong type: ' + d['type'])
        dealer = d['dealer']
        passingMethod = PassingMethod(d['passingMethod'])
        res = HeartsHand(heartsGame, dealer, passingMethod)
        res._startingHands = {p:cards_factory(h) for p,h in d['startingHands'].items()}
        res.tricks = [{deck.Card.from_str(c):p for c,p in x } for x in d['tricks']]
        res.actions = [a for a in d['actions']]
        res.handState = d['handState']
        return res

     
def cards_to_json(cards):
    return [str(c) for c in cards]

def cards_factory(cards):
    return [Card.from_str(c) for c in cards]

class Action(object):
    def __init__(self, player, card):
        self.player = player
        self.card = card

    def json_dict(self):
        return {
            'player' : self.player,
            'card' :   str(self.card)
        }
                
*/
