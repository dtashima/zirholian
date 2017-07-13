const pg = require('pg');
const async = require('async');
const hearts = require('../game/hearts.js');
const passing = require('../game/passing.js');

module.exports = {
    create_client: create_client
}

function create_client(dbUrl, dbPort, dbName, user, password) {
    return new PgHeartsClient(dbUrl, dbPort, dbName, user, password);
}

function handleError(err) {
    console.log('Error: ' + err);
    throw err;
}

/*
  Postgres DAO client
*/
function PgHeartsClient(dbUrl, dbPort, dbName, user, password) {
    console.log('PgHeartsClient constructor');
    this.config = {
        user: user,
        database: dbName,
        password: password,
        host: dbUrl,
        port: dbPort,
        max: 10,
        idleTimeoutMillis: 30000,
    };
    this.pool = new pg.Pool(this.config);
}

PgHeartsClient.prototype.close = function() {
    this.pool.end();
}

/*
  Generic database action; handles pool connection (if necessary)
  and callback.
*/
PgHeartsClient.prototype.database_action = async function(pgClient, callback) {
    var client = typeof pgClient == 'undefined' ? null : pgClient;
    try {
        if(client == null) {
            client = await this.pool.connect();
        }
        return await callback(client);
    } catch(err) {
        console.error('error in database_action: ' + err.stack);
        throw err;
    } finally {
        if(client != null && typeof pgClient == 'undefined') {
            client.release();
        }
    }
}

PgHeartsClient.prototype.create_user = async function(username, email) {
    const _this = this;
    
    console.log('in create_user: ' + username);
    var pool = _this.pool

    // check to see if username exists
    var client = null;
    try {
        client = await this.pool.connect();
        user = await _this.get_user_by_username(username, client);
    } catch (e) {
        console.log('failed get user ' + e.stack);
        throw e;
    }
    console.log('user: ' + JSON.stringify(user));
    if(user != null && user != '') {
        throw new Error("Username " + username + " exists.");
    } else {
        try {
            var res = await client.query('INSERT INTO hearts_users (username, email) VALUES ($1, $2)', [username, email]);
        } catch (e) {
            console.log('Error creating: ' + e.stack);
            throw e;
        } finally {
            if(client != null) {
                client.release();
            }
        }
    }

}

PgHeartsClient.prototype.get_user_by_username = async function(username, pgClient) {
    console.log('in get_user_by_username: ' + username);
    async function cb(client) {
        var { rows } = await client.query('SELECT username, email FROM hearts_users where username=$1', [username]);
//        console.log('a: ' + rows.length);
        if(rows != null && rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    }

    return await this.database_action(pgClient, cb);
}


/*
PgHeartsClient.prototype.delete_user = async function(username, pgClient) {
    var client = typeof pgClient == 'undefined' ? null : pgClient;
    try {
        if(client == null) {
            client = await this.pool.connect();
        }
        var res = await client.query('DELETE FROM hearts_users where username=$1', [username]);
        return;
    } catch(err) {
        console.error('error in delete_user: ' + err.stack);
        throw err;
    } finally {
        if(client != null && typeof pgClient == 'undefined') {
            client.release();
        }
    }
}
*/

PgHeartsClient.prototype.delete_user = async function(username, pgClient) {
    async function cb(client) {
        return await client.query('DELETE FROM hearts_users where username=$1', [username]);
        return;
    }

    return await this.database_action(pgClient, cb);
}


// Given a game object, persist and return idresult
PgHeartsClient.prototype.create_hearts_game = async function(game) {
    console.log(game);

    // validate players exist
    var players = game.players;
    var gameId = null;

    try {
        await Promise.all(players.map(async player => {
            var user = await this.get_user_by_username(player);
            if(user == null) {
                throw new Error('User ' + player + ' not found.');
            }
        }));
    } catch (e) {
        throw e;
    }
        
    

    gameId = (async() => {
        console.log('Writing game.');
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');
            var query = 'INSERT INTO hearts_game (' +
                'jack_of_diamonds, ' +
                'blood_on_first_trick, ' +
                'max_points, ' +
                'game_state, ' +
                'passing_strategy, ' +
                'first_player ' +
                ') VALUES ($1, $2, $3, $4, $5, $6) ' +
                ' RETURNING id;';
            console.log('QUERY: ' + query);
            console.log('game: ' + JSON.stringify(game));
            var {rows} = await client.query(query, [
                game.jackOfDiamonds,
                game.bloodOnFirstTrick,
                game.maxPoints,
                game.gameState,
                game.passingStrategy.name,
                game.firstPlayer
            ]);

            var id = rows[0]['id'];
            console.log('gameId: ' + id);

            query = 'INSERT INTO hearts_game_players (' +
                'game_id, ' +
                'player, ' +
                'index ' +
                ') VALUES ($1, $2, $3) ';
            console.log('QUERY: ' + query);
            var qs = game.players.map(x => client.query(query, [
                id,
                x,
                game.players.indexOf(x)]));

            await Promise.all(qs);

            // save scores
            query = 'INSERT INTO hearts_game_scores (' +
                'game_id, ' +
                'player, ' +
                'score ' +
                ') VALUES ($1, $2, $3) ';
            console.log('QUERY: ' + query);
            var scores_qs = game.players.map(x => client.query(query, [
                id,
                x,
                game.score[x]]));

            await Promise.all(qs);
            
            await client.query('COMMIT');
            return id;
        } catch(e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    })().then(gameId => { return gameId;})
        .catch(e => { throw e;});
    return gameId;

}

PgHeartsClient.prototype.get_hearts_game = async function(gameId, pgClient) {
    async function cb(client) {
        var game = new hearts.HeartsGame();
        
        var { rows } = await client.query('SELECT ' +
                                          'jack_of_diamonds, ' +
                                          'blood_on_first_trick, ' +
                                          'max_points, ' +
                                          'game_state, ' +
                                          'passing_strategy, ' +
                                          'first_player ' +
                                          'FROM hearts_game where id=$1', [gameId]);
        var row = rows[0];
        game.jackOfDiamonds = row.jack_of_diamonds;
        game.bloodOnFirstTrick = row.blood_on_first_trick;
        game.maxPoints = row.max_points;
        game.gameState = row.game_state;
        game.firstPlayer = row.first_player;
        game.passingStrategy = passing.PASSING_STRATEGIES[row.passing_strategy];

        var res = await client.query('SELECT ' +
                                     'player, ' +
                                     'index ' +
                                     'FROM hearts_game_players WHERE game_id=$1',
                                     [gameId]);

        var player_rows = res['rows'];
        game.players = player_rows.map(row => {
            return [row.index, row.player];
        })
            .sort((a,b) => {
                return a[0]-b[0];
            });
        game.players = game.players
            .map(pair => {
                return pair[1];
            });

        // load scores
        var score_res = await client.query('SELECT ' +
                                           'player, ' +
                                           'score ' +
                                           'FROM hearts_game_scores WHERE game_id=$1',
                                           [gameId]);

        var score_rows = score_res['rows'];

        game.score = new Object();
        score_rows.map(row => {
            game.score[row.player] = row.score;
            return;
        });
        
        return game;
    }

    return await this.database_action(pgClient, cb);
}

PgHeartsClient.prototype.delete_hearts_game = async function(gameId, pgClient) {
    async function cb(client) {
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM hearts_game_players where game_id=$1', [gameId]);
            await client.query('DELETE FROM hearts_game_scores where game_id=$1', [gameId]);
            await client.query('DELETE FROM hearts_game where id=$1', [gameId]);
            await client.query('COMMIT');
            return;
        } catch(e) {
            await client.query('ROLLBACK');
            throw e;
        }
        return;
    }

    return await this.database_action(pgClient, cb);
}


/*

PgHeartsClient.prototype.get_hearts_obj = function(heartsId, objType) {
    
    def create_hearts_obj(self, obj, objType):
        logging.debug(obj.json_dict())
        result = self.db[objType].insert_one(obj.json_dict())
        logging.debug('Obj created: {0}, {1}, {2}'.format(obj, objType, result.inserted_id))
        return result.inserted_id

    def get_hearts_obj(self, heartsId, objType):
        logging.debug('Getting: {0}, id: {1}'.format(objType, heartsId))
        cursor = this.db[objType].find({'_id' : ObjectId(heartsId)})
        resDict = None
        for obj in cursor:
            resDict = obj

        res = None
        if objType == 'HeartsGame':
            res = HeartsGame.hearts_game_from_dict(resDict)
        elif objType == 'HeartsHand':
            res = HeartsHand.hearts_hand_from_dict(resDict)
        else:
            raise ValueError('Unknown objType: ' + objType)
        return res

    def delete_hearts_obj(self, heartsId, objType):
        res = this.db[objType].delete_one({'_id' : heartsId})
        return res.deleted_count
    


from pymongo.son_manipulator import SONManipulator
class HeartsTransform(SONManipulator):
    def transform_incoming(self, son, collection):
        for (key, value) in son.items():
            if isinstance(value, HeartsHand):
                son[key] = value.json_dict()
            elif isinstance(value, dict): # Make sure we recurse into sub-docs
                son[key] = this.transform_incoming(value, collection)
        return son

    def transform_outgoing(self, son, collection):
        for (key, value) in son.items():
            if isinstance(value, dict):
                if '_type' in value and value['_type'] == 'HeartsHand':
                    son[key] = decode_custom(value)
                else: # Again, make sure to recurse into sub-docs
                    son[key] = this.transform_outgoing(value, collection)
        return son
*/


