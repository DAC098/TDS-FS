const path = require('path');

const io = require('./main.js');
const {cookieParser,session} = require('../session.js');

const log = logger.makeLog('cout',{name:'svr-soc'});
const error = logger.makeLog('cout',{name:'svr-soc',prefix:'ERROR'});

const pageMan = require('../pageMan.js');
const {styleWatcher} = require('../pageMan.js');

var connections = 0;

var svrsoc = io.of('/svr');

pageMan.on('update',(page_name) => {
	log('sending page update to socket');
	let data = {
		type: 'js',
		name: path.basename(page_name)
	};
	svrsoc.emit('update',{type:'asset-update',data});
});

styleWatcher.on('change',(filename) => {
	log('sending style update to socket');
	let data = {
		type: 'stylesheet',
		name: path.basename(filename)
	};
	svrsoc.emit('update',{type:'asset-update',data});
});

svrsoc.use(function(socket,next) {
	let req = socket.handshake;
	let res = {};
	cookieParser(req,res,function(err) {
		if(err)
			return next(err);
		else
			session(req,res,next);
	});
});

svrsoc.on('connection',(socket) => {
	++connections;
	log('client connected\n\tusername:\t',socket.handshake.session.username,'\n\tconnections:\t',connections);

	socket.on('disconnect',() => {
		--connections;
		log('client disconnected\n\tusername:\t',socket.handshake.session.username,'\n\tconnections:\t',connections);
	});
});
