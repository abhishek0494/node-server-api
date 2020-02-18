var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require('dotenv').config()
var url
if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASS && process.env.DB_Name) {
    url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:27017/${process.env.DB_Name}`
} else {
    url = `mongodb://localhost:27017/agents`
}
mongoose.connect(url);