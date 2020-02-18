var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var agentSchema = new Schema({
    agent: { type: String, unique: true }
});
module.exports = mongoose.model('Agents', agentSchema);