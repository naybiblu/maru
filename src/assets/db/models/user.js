const mongo = require("mongoose");

exports.model = mongo.models.user || mongo.model('user', 
    new mongo.Schema({
        id: { type: String, require: true, unique: true },
        username: { type: String, require: true },
        chatStatus: { type: Number, require: true, default: 0 }
    })
);

/* chat status
0 - not on chat mode
1 - finding
2 - busy
*/