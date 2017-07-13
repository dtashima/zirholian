
function PassingMethod(offsets) {
    this.offsets = offsets;
}

var PASSING_METHOD_LEFT = new PassingMethod([1,1,1]); // 3 cards to the left
var PASSING_METHOD_RIGHT = new PassingMethod([-1,-1,-1]); // 3 cards to the right
var PASSING_METHOD_ACROSS = new PassingMethod([2,2,2]); // 3 cards across (4 players)
var PASSING_METHOD_HOLD = new PassingMethod([]); // hold
var PASSING_METHOD_CRAZY = new PassingMethod([1, 2, -1]); // one to each player (4 players)
var PASSING_METHOD_2_LEFT = new PassingMethod([2,2,2]); // 3 cards 2 players to the left (5 players)
var PASSING_METHOD_2_RIGHT = new PassingMethod([-2,-2,-2]); // 3 cards 2 players to the right (5 players)

PassingMethod.prototype.toString = function() {
    if(this.offsets != null)
        return this.offsets.toString();
    else
        return "";
}

var PASSING_STRATEGIES = {};

function PassingStrategy(name, methods) {
    this.name = name;
    this.methods = methods;
    PASSING_STRATEGIES[name] = this;
}

PassingStrategy.prototype.getMethod = function(handNumber) {
    return this.methods[handNumber % this.methods.length];
}

PassingStrategy.prototype.toString = function() {
    return this.name + ": " + this.methods.toString();
}

var PASSING_STRATEGY_DEFAULT = new PassingStrategy('PASSING_STRATEGY_DEFAULT',
                                               [PASSING_METHOD_LEFT,
                                                PASSING_METHOD_RIGHT,
                                                PASSING_METHOD_ACROSS,
                                                PASSING_METHOD_CRAZY]);

var PASSING_STRATEGY_HOLD = new PassingStrategy('PASSING_STRATEGY_HOLD',
                                            [PASSING_METHOD_LEFT,
                                             PASSING_METHOD_RIGHT,
                                             PASSING_METHOD_ACROSS,
                                             PASSING_METHOD_HOLD]);

var PASSING_STRATEGY_DEFAULT_3_PLAYER = new PassingStrategy('PASSING_STRATEGY_DEFAULT_3_PLAYER',
                                                        [PASSING_METHOD_LEFT,
                                                         PASSING_METHOD_RIGHT,
                                                         PASSING_METHOD_HOLD]);

var PASSING_STRATEGY_DEFAULT_5_PLAYER = new PassingStrategy('PASSING_STRATEGY_DEFAULT_5_PLAYER',
                                                        [PASSING_METHOD_LEFT,
                                                         PASSING_METHOD_RIGHT,
                                                         PASSING_METHOD_2_LEFT,
                                                         PASSING_METHOD_2_RIGHT,
                                                         PASSING_METHOD_HOLD]);


module.exports = {
    PassingMethod : PassingMethod,
    PASSING_STRATEGIES : PASSING_STRATEGIES,
    PASSING_METHOD_LEFT : PASSING_METHOD_LEFT,
    PASSING_METHOD_RIGHT : PASSING_METHOD_RIGHT,
    PASSING_METHOD_ACROSS : PASSING_METHOD_ACROSS,
    PASSING_METHOD_HOLD : PASSING_METHOD_HOLD,
    PASSING_METHOD_CRAZY : PASSING_METHOD_CRAZY,
    PASSING_METHOD_2_LEFT : PASSING_METHOD_2_LEFT,
    PASSING_METHOD_2_RIGHT : PASSING_METHOD_2_RIGHT,
    PASSING_STRATEGY_DEFAULT : PASSING_STRATEGY_DEFAULT,
    PASSING_STRATEGY_HOLD: PASSING_STRATEGY_HOLD,
    PASSING_STRATEGY_DEFAULT_3_PLAYER: PASSING_STRATEGY_DEFAULT_3_PLAYER,
    PASSING_STRATEGY_DEFAULT_5_PLAYER: PASSING_STRATEGY_DEFAULT_5_PLAYER
}

