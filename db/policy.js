var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var policySchema = new Schema({
    policy_number: String,
    policy_start_date: Date,
    policy_end_date: Date,
    policy_category_collection_id: [
        { type: Schema.Types.ObjectId, ref: 'Lobs' }
    ],
    company_collection_id: [
        { type: Schema.Types.ObjectId, ref: 'Carriers' }
    ],
    user_id: [
        { type: Schema.Types.ObjectId, ref: 'Users' }
    ]
});
module.exports = mongoose.model('Policys', policySchema);