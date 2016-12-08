// npm modules
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

// log methods
const log = logger.makeLog('cout',{name:'Store'});
const error = logger.makeLog('cout',{name:'Store',prefix:'ERROR'});

let store = new MongoStore({
	uri: `mongodb://${settings.db.host}:${settings.db.port}/fs`,
	collection: 'sessions'
});

store.on('error',(err) => {
	if(err) {
		error(err.message);
	}
});

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
	store: store,
	name:'fs.sid'
});
