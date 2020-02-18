const express = require('express')
const app = express()
var bodyParser = require('body-parser');
const csv = require('fast-csv');
const mongoose = require('mongoose');
var session = require('express-session');
const path = require('path');
var Agents = require("./db/agentModel");
var Users = require("./db/user")
var Accounts = require("./db/account");
var Lobs = require('./db/LOB');
var Carriers = require("./db/carrier");
var Policys = require("./db/policy");
var cmd = require('node-cmd');
var Messages = require('./db/message')
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.json({
    limit: "50mb"
}));
app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000
}));
var db = require('./db/db')
mongoose.set('debug', true);
const port = 5000
var multer = require('multer')
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(statusCode).send(err);
    };
}
var upload = multer({ storage: storage })
var fs = require('fs');
var dir = './uploads';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}
//Search API to find policy info with the help of username.
app.get('/policyinfo', (req, res) => {
        let username = req.query.username
        Users.
        find({ firstname: username }).
        populate('policy_id').
        exec(function(err, story) {
            if (err) return handleError(err);
            console.log('The author is %s', story);
            res.json({ success: story, status: 200 })
        });

    })
    //API to provide aggregated policy by each user
app.get('/getpolicy/byuser', (req, res) => {
        Users.
        find({}).
        populate({
            path: 'policy_id',
            populate: { path: 'policy_category_collection_id', select: '-policy_id -_id' },
        }).
        populate({
            path: 'policy_id',
            populate: { path: 'company_collection_id', select: '-policy_id -_id' }

        }).
        exec(function(err, story) {
            if (err) return handleError(err);
            console.log('The author is %s', story);
            res.json({ success: story, status: 200 })
        });

    })
    // Create a post-service that takes the message, day and time in body parameters and it inserts that message into DB at that particular day and time.
app.post('/insert/message', (req, res) => {
    let date = new Date(req.body.date);
    if (isNaN(date.getTime())) {
        res.json({ success: 'Invalid Date Try sending date in mm-dd-yyyy', status: 500 })

    } else {
        let hour = req.body.time.split(':')[0];
        let minute = req.body.time.split(':')[1];
        let seconds = req.body.time.split(':')[2];
        date.setHours(hour)
        date.setMinutes(minute)
        date.setSeconds(seconds);
        let time = date.getTime()
        console.log(new Date().getTime(), time)
        let offset = time - new Date().getTime()
        if (offset < 0) {
            res.json({ success: 'Please give a future time in 24 hour format HH:MM:SS', status: 500 })
        } else {
            setTimeout(function() {
                let message = new Messages({
                    message: req.body.message
                })
                message.save(err => handleError(err))
            }, offset);
            res.json({ success: 'message will be saved at a given time', status: 200 })

        }

    }


})


//1) Create API to upload the attached XLSX/CSV data into MongoDB.
app.post('/file', upload.single('file'), function(req, res, next) {
        let statusCode, message = '',
            agent = [];
        fs.createReadStream(path.resolve(__dirname + "/uploads/" + req.file.originalname))
            .pipe(csv.parse({ headers: true }))
            .on('error', error => console.error(error))
            .on('data', data => {
                Object.keys(data).forEach(function(key) {
                    var newKey = key.replace(/\s+/g, '_');
                    if (key !== newKey) {
                        data[newKey] = data[key].trim();
                        delete data[key];
                    }
                });
                let options = { upsert: true, new: true, setDefaultsOnInsert: true }
                if (data.agent) {
                    Agents.findOneAndUpdate({ agent: data.agent }, { agent: data.agent }, options, savedObj => {
                        if (savedObj) return handleError(savedObj)
                        Users.findOneAndUpdate({ email: data.email, phone: data.phone }, {
                            email: data.email,
                            gender: data.gender,
                            firstname: data.firstname,
                            city: data.city,
                            userType: data.userType,
                            phone: data.phone,
                            address: data.address,
                            state: data.state,
                            zip: data.zip,
                            dob: data.dob
                        }, options, (userObjError, userObj) => {
                            if (userObjError) return handleError(userObjError);
                            Accounts.findOneAndUpdate({ account_name: data.account_name }, { account_name: data.account_name }, options, (accountObjErr, accountObj) => {
                                if (accountObjErr) return handleError(accountObjErr);
                                Lobs.findOneAndUpdate({ category_name: data.category_name }, { category_name: data.category_name }, options, (lobObjErr, lobObj) => {
                                    if (lobObjErr) return handleError(lobObjErr);
                                    Carriers.findOneAndUpdate({ company_name: data.company_name }, { company_name: data.company_name }, options, (carrierObjErr, carrierObj) => {
                                        if (carrierObjErr) return handleError(carrierObjErr)
                                        let Policy = new Policys({
                                            policy_number: data.policy_number,
                                            policy_start_date: data.policy_start_date,
                                            policy_end_date: data.policy_end_date,
                                            policy_category_collection_id: lobObj._id,
                                            company_collection_id: carrierObj._id,
                                            user_id: userObj._id
                                        })
                                        Policy.save((err, policyObj) => {
                                            Users.findById(policyObj.user_id, function(err, user) {
                                                if (err) handleError(err);
                                                user.policy_id.push(policyObj._id);
                                                user.save(function(err) {
                                                    if (err) handleError(err);
                                                });
                                            });
                                            Carriers.findById(policyObj.company_collection_id, function(err, carrier) {
                                                if (err) handleError(err);
                                                carrier.policy_id.push(policyObj._id);
                                                carrier.save(function(err) {
                                                    if (err) handleError(err);
                                                });
                                            });
                                            Lobs.findById(policyObj.policy_category_collection_id, function(err, lob) {
                                                if (err) handleError(err);
                                                lob.policy_id.push(policyObj._id);
                                                lob.save(function(err) {
                                                    if (err) handleError(err);
                                                });
                                            });
                                        })
                                    })
                                })
                            })
                        })
                    })
                }

            })
            .on('end', _ => {
                if (statusCode && message.length) {
                    res.json({ error: message, status: statusCode })
                } else {
                    setTimeout(_ => {
                        fs.unlinkSync(__dirname + "/uploads/" + req.file.originalname);
                    }, 3000)
                    res.json({ success: `Data imported successfully.`, status: 200 })
                }
            });

    })
    //Track real-time CPU utilization of the node server and on 70% usage restart the server.
setInterval(_ => {
    var osu = require('node-os-utils')
    var cpu = osu.cpu

    var count = cpu.count() // 8

    cpu.usage()
        .then(cpuPercentage => {
            if (cpuPercentage > 70) {
                process.exit(1)
            }
        })
}, 1000)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))