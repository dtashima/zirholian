const Passing = require('./passing.js');
const heartsdeck = require('./deck.js');
const Card = heartsdeck.Card;

module.exports = {
    HeartsGame : HeartsGame,
    HeartsHand : HeartsHand,
    Action :     Action
};


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

    let defaultPassingStrategy = null;
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

    this.handIds = [];
    this.score = {};
    console.log("players: " + this.players);
    this.players.forEach(function(p) {
        this.score[p] = 0;
    }, this);
    console.log("score: " + JSON.stringify(this.score));

    const numScores = Object.keys(this.score).length;
    if (numScores != this.players.length)
        throw "Duplicate player names found. Number of scores: " + numScores + "; Number of players: " + this.players.length;

    this.firstPlayer = Math.floor(Math.random() * this.players.length);
    
    this.gameState = HeartsGame.GAME_STATE_PLAYING;
};

HeartsGame.prototype._nextPlayer = function(player) {
    if(this.players.indexOf(player) < 0) {
        throw "Player not found: " + player;
    }
    
    let n = this.players.indexOf(player);
    n += 1;
    n = n % this.players.length;
    return this.players[n];
};

// wrapper for HeartsHand.playCard
//HeartsGame.prototype.playCard = function(action) {
    

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

*/

function HeartsHand(heartsGame, dealerIndex, passingMethod) {
    this.gameId = heartsGame.id;
    this.bloodOnFirstTrick = heartsGame.bloodOnFirstTrick;
    this.dealerIndex = dealerIndex;
    this.passingMethod = passingMethod;
    this.players = heartsGame.players;
    this.numPlayers = this.players.length;
    this.playerHands = new Object();
    this.players.map(player => {
        this.playerHands[player] = new Array();
    });
    this.passes = new Object();
    this.tricks = new Array(); // Array of objects (player -> card)
    this.tricks.push(new HeartsTrick()); // initialize with first empty trick

    this.tricksTaken = new Object(); // (player -> array of tricks)
    this.players.forEach(player => this.tricksTaken[player] = new Array());
    this.nextToAct = this.dealerIndex;
}

// deal cards, initialize hands
HeartsHand.prototype.initNew = function(deck) {
    if(typeof deck == 'undefined') {
        deck = new heartsdeck.Deck();
    }

    for(let i = 0; i < deck.cards.length; i++) {
        let card = deck.cards[i];
        this.playerHands[this.players[i % this.numPlayers]].push(card);
    }
        
    this.players.forEach(player => {
        this.playerHands[player].sort(heartsdeck.nice_sort);
    });
            
//        this._startingHands = copy.deepcopy(this.playerHands);
    this.handState = HeartsHand.HAND_STATE_STARTED;
};


HeartsHand.HAND_STATE_STARTED =  'HAND_STATE_STARTED';
HeartsHand.HAND_STATE_PASSED =   'HAND_STATE_PASSED';
HeartsHand.HAND_STATE_FINISHED = 'HAND_STATE_FINISHED';

// returns current trick
HeartsHand.prototype.currentTrick = function() {
    return this.tricks.slice(-1)[0];
};

/*
  playerFrom - username of player doing the pass
  passes - has of username:list of cards to pass
*/
HeartsHand.prototype.addPlayerPasses = function(playerFrom, passes) {
    if(this.handState != HeartsHand.HAND_STATE_STARTED) {
        throw new Error('Attempted pass when hand in state: ' +
                        this.handState);
    }
    var playerFromIndex = this.players.indexOf(playerFrom);
    console.log('passing method: ' + this.passingMethod.offsets);
    var legalPassTargets = this.passingMethod.offsets.map(i => {
        return (i + playerFromIndex) % this.numPlayers;
    })
        .map(x => {
            return this.players[x];
        });

    console.log('playerFrom: ' + playerFrom + ', legalPassTargets: ' +
                legalPassTargets + ', passes: ' +
                JSON.stringify(passes));

    // do checks
    Object.keys(passes).forEach(k => {
        let passee = k;
        let passCards = passes[k];
        passCards.forEach(c => {
            if(legalPassTargets.length == 0) {
                throw new Error('Too many passes.');
            }
            let n = legalPassTargets.indexOf(k);
            if(n < 0) {
                throw new Error('pass target not found: ' + k);
            }
            legalPassTargets.splice(n, 1);
        });
    });

    if(legalPassTargets.length > 0) {
        throw new Error('Not enough passes.');
    }

    // set this pass
    this.passes[playerFrom] = passes;

    // check if all players have passed
    if(!this.players.every(x => {
        return this.passes.hasOwnProperty(x);
    })) {
        return;
    }

    this._executePass();
    
};

HeartsHand.prototype._executePass = function() {
    console.log('All players have passed, executing');
    Object.keys(this.passes).forEach(playerFrom => {
        let playerPass = this.passes[playerFrom];
        console.log('playerFrom: ' + playerFrom + ' playerPass: ' + JSON.stringify(playerPass));
        Object.keys(playerPass).forEach(playerTo => {
            let cards = playerPass[playerTo];
            cards.forEach(card => {
                let n = this.playerHands[playerFrom].indexOf(card);
                /*
                console.log('asdfadsf: ' +
                            this.playerHands[playerFrom] + ' to: ' +
                            this.playerHands[playerTo] + ' card: ' +
                            JSON.stringify(card) + ' n: ' + n);
*/
                this.playerHands[playerFrom].splice(n, 1);
                this.playerHands[playerTo].push(card);
                /*
                console.log('asdfadsf: ' +
                            this.playerHands[playerFrom] + ' to: ' +
                            this.playerHands[playerTo] + ' card: ' +
                            JSON.stringify(card) + ' n: ' + n);
*/
            });
        });
    });

    Object.keys(this.playerHands).forEach(player => {
        const hand = this.playerHands[player];
        hand.sort(heartsdeck.nice_sort);
//        console.log(JSON.stringify(this.playerHands[player]));
        if(hand.length != 52/this.players.length) {
            throw new Error('Error after pass, hand does not have the right number of cards.');
        }

        this.handState = HeartsHand.HAND_STATE_PASSED;
        const c2 = Card.get(Card.CLUBS, '2');
        for(let i = 0; i < this.players.length; i++) {
            if(this.playerHands[this.players[i]][0] == c2) {
                this.nextToAct = i;
                break;
            }
        }
    });
};

HeartsHand.ERROR_NOT_YOUR_TURN = 'ERROR_NOT_YOUR_TURN';
HeartsHand.ERROR_NO_BLOOD_ON_FIRST_TRICK = 'ERROR_NO_BLOOD_ON_FIRST_TRICK';
HeartsHand.ERROR_MUST_FOLLOW_SUIT = 'ERROR_MUST_FOLLOW_SUIT';
HeartsHand.ERROR_MUST_HAVE_CARD = 'ERROR_MUST_HAVE_CARD';

// returns a tuple of boolean (is valid), and an error string
HeartsHand.prototype.isValidPlay = function(action) {
    const trick = this.currentTrick();
    const player = action.player;
    const playerHand = this.playerHands[player];
    console.log('isValidPlay: ' + JSON.stringify(action));
    console.log(`next to act: ${this.nextToAct}; player: ${this.players.indexOf(player)}`);

    // confirm player has card
    const hasCard = playerHand.find(x => { return x.valueOf() == action.card.valueOf(); } );
    if(typeof hasCard == 'undefined') {
        return [false, HeartsHand.ERROR_MUST_HAVE_CARD];
    }
    
    // check to see if it's your turn
    if(this.nextToAct != this.players.indexOf(player)) {
        return [false, HeartsHand.ERROR_NOT_YOUR_TURN];
    }
       
    // check for blood on first trick
    if(this.tricks.length == 1 && !this.bloodOnFirstTrick
       && action.card.isBlood()) {
        return [false, HeartsHand.ERROR_NO_BLOOD_ON_FIRST_TRICK];
    }

    // check to see if suit is followed
    if(Object.keys(trick.cards).length > 0) {
        const suitLed = trick.suitLed;
        if(action.card.suit != suitLed) {
            if(typeof playerHand.find(x => { return x.suit == suitLed; }) != 'undefined') {
                return [false, HeartsHand.ERROR_MUST_FOLLOW_SUIT];
            }
        }
    }
    
    return [true, null];
    
};

HeartsHand.prototype.playCard = function(action) {
    const trick = this.currentTrick();
    const player = action.player;

    console.log(`next to act: ${this.nextToAct}; player: ${this.players.indexOf(player)}`);
    const valid = this.isValidPlay(action);
    if(!valid[0]) {
        throw new Error('Not valid action: ' + valid[1]);
    }

    trick.playCard(action);
    this.playerHands[player].splice(this.playerHands[player].indexOf(action.card), 1);

    // determine who takes the trick
    if(Object.keys(trick.cards).length == this.players.length) {
        var taker = null;
        var highest = null;
        Object.keys(trick.cards).forEach(player => {
            const card = trick.cards[player];
            if(card.suit == trick.suitLed && (highest == null || highest.rankIndex() < card.rankIndex())) {
                taker = player;
                highest = card;
            }
        });
        console.log('playcard: ' + taker + ' ' + highest + ' ' + this.players.indexOf(taker));
        this.nextToAct = this.players.indexOf(taker);
        this.tricks.push(new HeartsTrick());
        this.tricksTaken[taker].push(trick);

        if(this.playerHands[taker].length == 0) {
            return this.endHand();
        }
        return;
    }
    
    this.nextToAct = (this.nextToAct + 1) % this.players.length;
};

HeartsHand.prototype.endHand = function() {
    // count points
    var points = new Object();
    Object.keys(this.tricksTaken).forEach(player => {
        const tricks = this.tricksTaken[player];
        var n = 0;
        tricks.forEach(trick => {
            Object.values(trick.cards).forEach(c => {
                if(c.suit == Card.HEARTS) {
                    n += 1;
                } else if(c.suit == Card.SPADES && c.rank == 'Q') {
                    n += 13;
                }
            });
        });

        points[player] = n;
    });

    console.log('Hand over: ' + JSON.stringify(points));

    // check for shooting
    const shooter = Object.keys(points).find(player => {
        const p = points[player];
        return p == 26;
    });

    if(typeof shooter != 'undefined') {
        points = new Object();
        points[shooter] = 0;
        this.players.forEach(p => {
            if(p != shooter) {
                points[p] = 26;
            }
        });
    }
    return points;
};

function Action(player, card) {
    this.player = player;
    this.card = card;
}

Action.prototype.json_dict = function() {
    return {
        'player' : this.player,
        'card' :   this.card.toString()
    };
};

function HeartsTrick() {
    this.cards = new Object();
    this.suitLed = null;
}

HeartsTrick.prototype.playCard = function(action) {
    this.cards[action.player] = action.card;
    if(Object.keys(this.cards).length == 1) {
        this.suitLed = action.card.suit;
    }
}

/*
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
