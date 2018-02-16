'use strict';

const nodemailer = require('nodemailer'),
    mailConfig = require('../config/mailConfig');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
        user: mailConfig.user,
        pass: mailConfig.password
    }
});

module.exports = transporter;