var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var accountSchema = new Schema({
    account_name: String
});
module.exports = mongoose.model('Accounts', accountSchema);