const ping = require("./ping");
const warning = require("./warning");
const check_warning = require('./check_warning')
const suspension = require("./suspension");
const check_suspension = require('./check_suspension')
const add_donation = require('./add_donations');

module.exports = [ping, warning, check_warning, suspension, check_suspension, add_donation];
