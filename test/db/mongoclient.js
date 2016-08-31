var assert = require('assert');
var mongoclient = require('../../js/db/mongoclient.js');
var schemas = require('../../js/db/heartsSchema.js')

var MONGODB_DB_URL = 'mongodb://localhost:27017/'

function create_client(dbUrl) {
    dbUrl = typeof dbUrl != 'undefined' ? dbUrl : MONGODB_DB_URL;
    mongoose.createConnection(dbUrl);
}

describe('Mongo Hearts Get Test', function() {
    var client = null;
    
    beforeEach(function(done) {
        handId = null;
        client = mongoclient.create_client(dbUrl='mongodb://localhost:27017/');
        client.create_user('abcd', 'abcd@qwerty.com', done);
        console.log('in before');
    });

    afterEach(function(done) {
        console.log('teardown');
        if(client != null) {
            client.delete_user('abcd', function() {
                client.close_connection();
                done();
            });
        }
            
    });

    describe('#get_user_by_username()', function() {
        it('should get the user abcd', function(done) {
            client.get_user_by_username('abcd', function(err, users) {
                console.log('in get user' + err + 'u' + users);
                assert.equal('abcd',  users[0].username);
                assert.equal(1, users.length);
                done();
            });
        });
    });
          
});

describe('Mongo Hearts Create Test', function() {
    var client = null;
    
    beforeEach(function(done) {
        handId = null;
        client = mongoclient.create_client(dbUrl='mongodb://localhost:27017/');
        client.delete_user('abcd', done);
        console.log('in before');
    });

    afterEach(function(done) {
        console.log('teardown');
        if(client != null) {
            client.delete_user('abcd', function() {
                client.close_connection();
                done();
            });
        }
            
    });

    describe('#create_user()', function() {
        it('should create the user asdf', function(done) {
            client.create_user('abcd', 'abcd@qwerty.com', function(err){
                console.log('in create test: ' + err + 'asdf');
                if(err != null) {
                    throw err;
                }
                client.get_user_by_username('abcd', function(err, users) {
                    assert.equal('abcd', users[0].username);
                    done();
                });
                
            });
        });
    });
          
    
});

describe('Mongo Hearts Test', function() {
    var client = null;
    var heartsGameId = null;
    var handId = null;
    
    beforeEach(function(done) {
        console.log('starting test');
        handId = null;
        client = mongoclient.create_client(dbUrl='mongodb://localhost:27017/')
        client.delete_user('abcd', done);
    });

    afterEach(function(done) {
        console.log('teardown');
        if(heartsGameId != null) {
            client.delete_hearts_obj(heartsGameId, "HeartsGame");
        }
        if(handId != null) {
            client.delete_hearts_obj(handId, "HeartsHand", done);
        }
            
    });

    describe('#get_user_by_username()', function() {
        it('should find the user asdf', function() {
            assert.equal('abcd', client.get_user_by_username('abcd').username);
        });
    });
          
    
});
*/
