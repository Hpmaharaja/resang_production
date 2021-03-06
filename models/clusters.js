// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Clusters', new Schema({
    cluster_id: Number,
    keywords: Array,
    images: Array,
    timestamp: { type : Date, default: Date.now }
}));
