var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username:  String,
    email:     String
});

var heartsGameSchema = new Schema({
    type :                String,
    players :             [Schema.Types.ObjectId],
    passingStrategy :     String,
    jackOfDiamonds :      {type:Boolean, default: false},
    bloodOnFirstTrick :   {type:Boolean, default: true},
    maxPoints :           {type:Number, default: 100},
    firstPlayer :         String,
    gameState :           String,
    hands :               [hand.json_dict() for hand in self.hands],
    score :               Number,
});

exports.userSchema = userSchema;
exports.heartsGameSchema = heartsGameSchema;



                    
