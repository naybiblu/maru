const mongo = require("mongoose");

exports.model = mongo.models.user || mongo.model('user', 
    new mongo.Schema({
        id: { type: String, require: true, unique: true },
        username: { type: String, require: true },
        settings: {
            showUsername: { type: Boolean, default: true },
            noPaperPlane: { type: Boolean, default: false },
        }
    })
);