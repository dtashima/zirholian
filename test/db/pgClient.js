var assert = require('assert');
const pgClient = require('../../js/db/pgClient.js');

const async = require('async');
const hearts = require('../../js/game/hearts.js');
const passing = require('../../js/game/passing.js');

describe('Postgres User Get Test', function() {
    var client = null;
    
    beforeEach(function(done) {
        console.log('in before');
        client = pgClient.create_client('localhost', 5432,'hearts1', 'tash', 'cashy1i');
        (async() => {
            console.log('in async');
            try {
                await client.create_user('abcd', 'abcd@qwerty.com');
            } catch (e) {
                throw e;
            }
        })()
            .then(res => done())
            .catch(e => done(e));

    });

    afterEach(function(done) {
        console.log('teardown');
        if(client != null) {
            (async() => {
                try {
                    await client.delete_user('abcd');
                } catch (e) {
                    throw e;
                }
            })()
                .then(res => done())
                .catch(e => done(e));
        }
        client.close();
            
    });

    describe('#get_user_by_username()', function() {
        it('should get the user abcd', function(done) {
            (async () => {
                try {
                    var user = await client.get_user_by_username('abcd');
                    assert.equal('abcd',  user.username);
                    assert.equal('abcd@qwerty.com',  user.email);
                    done();
                } catch (e) {
                    throw e;
                }
            }
            )().catch(e => console.error(e));
                    
        });

        it('should return null', function(done) {
            // user doesn't exist
            (async () => {
                try {
                    var user = await client.get_user_by_username('asdf');
                    console.log('in get user' + JSON.stringify(user));
                    assert.equal(null,  user);
                    done();
                } catch (e) {
                    throw e;
                }
            }
            )().catch(e => console.error(e));

        });
    });
          
});

describe('Postgres Game DB Test', function() {
    var client = null;
    var heartsGameId = null;
    var game = null;
    
    beforeEach(function(done) {
        console.log('in before');
        client = pgClient.create_client('localhost', 5432,'hearts1', 'tash', 'cashy1i');
        (async () => {
            return Promise.all([
                ['testuser1', 'testuser1@qwerty.com'],
                ['testuser2', 'testuser2@qwerty.com'],
                ['testuser3', 'testuser3@qwerty.com'],
                ['testuser4', 'testuser4@qwerty.com'],
            ].map(async function(data) {
                return await client.create_user(data[0], data[1]);
            }));
        })().then(res => done())
            .catch(e => done(e));
    });

    afterEach(function(done) {
        console.log('teardown');
        if(client != null) {
            (async () => {
                if(heartsGameId != null) {
                    await client.delete_hearts_game(heartsGameId);
                }
                deletefuns = ['testuser1', 'testuser2', 'testuser3', 'testuser4'].map(x => client.delete_user(x));
                

                await Promise.all(deletefuns);
            })().then(res => { done(); })
                .catch(e => { done(e); });
                             
        }
    });

    describe('#hearts game()', function() {
        it('should create a heart game with defaults', function(done) {
            console.log('starting test');
            game = new hearts.HeartsGame();
            game.initNew(['testuser1', 'testuser2', 'testuser3', 'testuser4']);
            assert(game.players[0] == 'testuser1');
            assert(game.jackOfDiamonds == false);
            assert(game.bloodOnFirstTrick == true);
            assert(game.maxPoints == 100);
            assert(game.passingStrategy == passing.PASSING_STRATEGY_DEFAULT);
            assert(game.gameState == hearts.HeartsGame.GAME_STATE_PLAYING);
            (async() => {
                try {
                    var gameId = await client.create_hearts_game(game);
                    console.log('1 in create_hearts_game, ' + 'gameId: ' + gameId);
                    heartsGameId = gameId;
                    assert(gameId != null);
                } catch (e) {
                    throw e;
                }
            })().then(res => done())
                .catch(e => done(e));
        });

        
        it('should fail because of a missing player', function(done) {
            var game = new hearts.HeartsGame();

            game.initNew(['testuser1', 'testuser2', 'testuser3', 'testuser5']);
            (async() => {
                try {
                    await client.create_hearts_game(game);
                    console.log('2 in create_hearts_game' + JSON.stringify(game));
                    assert(err != null);
                } catch(e) {
                    throw e;
                }
            })().then(res => done(new Error('Didn\'t fail.')))
                .catch(e => {
                    console.log('Error caught (expected): ' + e);
                    done();
                });
        });

        it('should create a heart game with non-default values, save it, and then retrieve it', function(done) {
            game = new hearts.HeartsGame();
            game.initNew(['testuser1', 'testuser2', 'testuser3', 'testuser4'],
                         passing.PASSING_STRATEGY_HOLD,
                         true,
                         false,
                         150);
            game.score['testuser1'] = 1;
            game.score['testuser2'] = 2;
            game.score['testuser3'] = 3;
            game.score['testuser4'] = 4;
            
            assert(game.players[1] == 'testuser2');
            assert(game.jackOfDiamonds == true);
            assert(game.bloodOnFirstTrick == false);
            assert(game.maxPoints == 150);
            assert(game.passingStrategy == passing.PASSING_STRATEGY_HOLD);
            assert(game.gameState == hearts.HeartsGame.GAME_STATE_PLAYING);

            (async() => {
                try {
                    var gameId = await client.create_hearts_game(game);
                    console.log('in create_hearts_game, ' + 'gameId: ' + gameId);
                    heartsGameId = gameId;
                    assert(gameId != null);

                    var game2 = await client.get_hearts_game(gameId);
                    console.log('game retrieved: ' + JSON.stringify(game2));
                    assert(game2.players[1] == 'testuser2');
                    assert(game2.jackOfDiamonds == true);
                    assert(game2.bloodOnFirstTrick == false);
                    assert(game2.maxPoints == 150);
                    assert(game2.passingStrategy == passing.PASSING_STRATEGY_HOLD);
                    assert(game2.gameState == hearts.HeartsGame.GAME_STATE_PLAYING);
                    assert(game2.firstPlayer == game.firstPlayer);
                    assert(game2.score['testuser1'] == 1);
                    assert(game2.score['testuser2'] == 2);
                    assert(game2.score['testuser3'] == 3);
                    assert(game2.score['testuser4'] == 4);

                    return gameId;
                } catch (e) {
                    throw e;
                }
            })().then(res => {
                done();
            })
                .catch(e => done(e));
        });


        
    });
          
});

