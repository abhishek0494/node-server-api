var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var messageSchema = new Schema({
    message: String
});
module.exports = mongoose.model('Messages', messageSchema);