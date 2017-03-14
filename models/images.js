// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Images', new Schema({
    userName: String,
    pathTofile: String,
    latitude: String,
    longitude: String,
    ml_keywords: Array,
    chatID: Number,
    clusterID: String,
    processed: Boolean,
    timestamp: { type : Date, default: Date.now }
}));
