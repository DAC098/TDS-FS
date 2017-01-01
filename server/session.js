// npm modules
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

// log methods
const log = logger.makeLog('cout',{name:'Store'});
const error = logger.makeLog('cout',{name:'Store',prefix:'ERROR'});

var store_options = {
	uri: `mongodb://${settings.db.host}:${settings.db.port}/fs`,
	collection: 'sessions'
};

var recon = {
	attempts: 6,
	count: 0,
	interval: 5000,
	timer: null
};

var store = null;

function connectStore() {
	store = new MongoStore(store_options);

	store.on('error',(err) => {
		if(err) {
			if(err.message.match(/failed to connect/)) {
				recon.timer = setTimeout(function() {
					if(recon.count <= recon.attempts || recon.attempts == 0)
						connectStore();
					clearTimeout(recon.timer);
				},recon.interval);
			}
			error(err.message);
		}
	});
}

connectStore();

exports.store = store;

exports.cookieParser = cookieParser('secret');

exports.session = session({
	secret:'secret',
	resave:false,
	saveUninitialized:false,
	cookie:{
		secure:true,
		signed:true
	},
	store,
	name:'fs.sid'
});
