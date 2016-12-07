if(typeof window !== 'undefined') {

	var io = require('socket.io-client');
	var store = require('./Store.js');

	var logger = require('./CLogs.js');
	var log = logger.makeLog({name:'c-socket'});
	var error = logger.makeLog({name:'c-socket',prefix:'ERROR'});

    var socket = io(window.location.origin+'/fs');

    let reconnecting = false;
    let count = 0;

    socket.on('connect',() => {
        log('connected to server');
    });

    socket.on('error',(err) => {
        log('error in the connection,',err);
    });

    socket.on('disconnect',() => log('disconnected from server'));

    socket.on('reconnect',() => {
        reconnecting = false;
        count = 0;
        log('reconnected with server');
    });

    socket.on('reconnect_attempt',() => {
        ++count;
        log('count:',count);
    });

    socket.on('reconnecting',() => {
        if(!reconnecting) {
            log('attempting to reconnect');
            reconnecting = true;
        }
    });

    socket.on('reconnect_failed',() => log('failed to reconnect with server'));

    module.exports = socket;

}
