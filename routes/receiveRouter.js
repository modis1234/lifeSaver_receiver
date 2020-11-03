const express = require('express');
const router = express.Router();
const pool = require('./config/connection');
const receiver = require('./config/receiver');
const schedule = require('node-schedule');


const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

receiver.findBygas();
setInterval(function(){
    receiver.findBygas();
},30000);

router.post('/status/iaq700',  (req, res, next) => {
    var reqBody = req.body[0];
    var date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    reqBody['record_time'] = date;
    
    receiver.receive(reqBody);
    
    res.status(200).end();
});

var j = schedule.scheduleJob("0 0 0 * * *", function() {
    receiver.backupOfDay();
});


module.exports = router;