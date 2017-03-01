// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Messages', new Schema({
    userName: String,
    message: String,
    timestamp: { type : Date, default: Date.now }
}));
