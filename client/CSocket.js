
function CSocket(domain,obj) {

	if(typeof window !== 'undefined') {
		var io = require('socket.io-client');

		var socket = io(window.location.origin+'/'+domain);

		if(obj) {
			let reconnecting = false;
			let count = 0;

			socket.on('connect',() => {
				obj.log('connected to server');
			});

			socket.on('error',(err) => {
				obj.error('error in the connection,',err);
			});

			socket.on('disconnect',() => obj.log('disconnected from server'));

			socket.on('reconnect',() => {
				reconnecting = false;
				count = 0;
				obj.log('reconnected with server');
			});

			socket.on('reconnect_attempt',() => {
				++count;
				obj.log('count:',count);
			});

			socket.on('reconnecting',() => {
				if(!reconnecting) {
					obj.log('attempting to reconnect');
					reconnecting = true;
				}
			});

			socket.on('reconnect_failed',() => obj.error('failed to reconnect with server'));
		}

		return socket;
	} else {
		return null;
	}
}

module.exports = function(domain,obj) {
	return CSocket(domain,obj);
};
