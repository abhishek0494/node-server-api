var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    email: { type: String, unique: true },
    gender: String,
    firstname: String,
    city: String,
    userType: String,
    phone: { type: String, unique: true },
    address: String,
    state: String,
    zip: String,
    dob: Date,
    policy_id: [
        { type: Schema.Types.ObjectId, ref: 'Policys' }
    ]
});
module.exports = mongoose.model('Users', userSchema);