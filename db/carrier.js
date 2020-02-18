var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var carrierSchema = new Schema({
    company_name: { type: String, unique: true },
    policy_id: [
        { type: Schema.Types.ObjectId, ref: 'Policys' }
    ]
});
module.exports = mongoose.model('Carriers', carrierSchema);