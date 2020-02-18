var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var lobSchema = new Schema({
    category_name: { type: String, unique: true },
    policy_id: [
        { type: Schema.Types.ObjectId, ref: 'Policys' }
    ]
});
module.exports = mongoose.model('Lobs', lobSchema);