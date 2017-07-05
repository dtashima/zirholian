
module.exports = {
    create_client: create_client
}

var HeartsSchema = require('./heartsSchema.js');
var mongoose = require('mongoose');
var MONGODB_DB_URL = 'mongodb://localhost:27017/'


function create_client(dbUrl) {
    console.log('creating client');
    
    dbUrl = typeof dbUrl != 'undefined' ? dbUrl : MONGODB_DB_URL;
    mongoose.createConnection(dbUrl);
    return new MongoHeartsClient(dbUrl, 'hearts')
}

function MongoHeartsClient(dbUrl, dbName){
    console.log('MongoHeartsClient constructor');
    this.connection = mongoose.connect(dbUrl);
    this.User = this.connection.model("User", HeartsSchema.userSchema);
    console.log('in constructor: ' + this.User);
}

function handleError(err) {
    console.log('Error: ' + err);
    throw err;
}
    

MongoHeartsClient.prototype.create_user = function(username, email, done) {
    var User = this.User;

    // check to see if username exists
    this.get_user_by_username(username, function(err, user) {
        if(user != null && user != '') {
            throw "Username " + username + " exists."
        } else {
            result = new User({
                   'username' : username,
                   'email' :  email
            }, function(err, obj) {
                if(err) return handleError(err);
            });

            result.save(done);

            return result;
        }
    });
        
}

MongoHeartsClient.prototype.get_user_by_username = function(username, callback) {
    var res = this.User.find({'username' : username});
    res.exec(callback);
}
 /*   
    def get_user_by_id(self, userid):
        cursor = this.db.users.find({'_id' : ObjectId(userid)})
        res = None
        for user in cursor:
            res = user
        return res
        

    def list_users(self):
        return this.db.users.find()
*/
MongoHeartsClient.prototype.delete_user = function(username, done) {
    var a = this.User.find({'username' : username});
    a.remove(function(err, a) {
        console.log('in delete_user' + a);
        done();
    });
}

MongoHeartsClient.prototype.close_connection = function() {
    mongoose.disconnect();
}

MongoHeartsClient.prototype.create_hearts_game = function(obj) {
    console.log(obj);
    result = new HeartsGame(obj
    , function(err, obj) {
        if(err) return handleError(err);
    });

    result.save(done);

}

MongoHeartsClient.prototype.get_hearts_obj = function(heartsId, objType) {
    
/*    
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


