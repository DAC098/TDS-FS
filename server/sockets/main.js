const socketio = require('socket.io');

var io = new socketio();

module.exports = io;

require('./svr.js');
require('./fs.js');
