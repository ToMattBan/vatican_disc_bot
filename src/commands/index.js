const ping = require("./ping");
const warning = require("./warning");
const check_warning = require('./check_warning')
const suspension = require("./suspension");
const check_suspension = require('./check_suspension')

module.exports = [ping, warning, check_warning, suspension, check_suspension];
