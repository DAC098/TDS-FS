// node modules
const events = require('events');

// npm modules
const MongoClient = require('mongodb').MongoClient;
const co = require('co');

const DB = function DB(db_options) {

	events.call(this);
	DB.prototype.__proto__ = events.prototype;

	const self = this;

	var connectors = {
		main: null,
		info: null,
		users: null,
		files: null,
		directories: null
	};

	var main_db = null;

	var options = {
		host: db_options.host || 'localhost',
		port: db_options.port || 27017
	};

	var collections = {};

	var queue = [];

	var db_ready = false;

	var connection = {
		attempts: 6,
		count: 0,
		interval: 5000,
		timer: {}
	};

	Object.defineProperty(self,'ready',{
		get: function() {
			return db_ready;
		},
		set: function() {},
		configurable: false,
		enumerable: true
	});

	function _checkQueue() {
		for(let col of queue) {
			_createCollection(col.name,col.options);
		}
	}

	const _connectDB = co.wrap(function* () {
		try {
			++connection.count;

			main_db = yield MongoClient.connect(`mongodb://${options.host}:${options.port}/fs`);

			main_db.on('authenticated',(obj) => self.emit('authenticated'));

			main_db.on('close',(err) => self.emit('close',err));

			main_db.on('error',(err) => self.emit('error',err));

			main_db.on('fullsetup',(db) => self.emit('fullsetup'));

			main_db.on('parseError',(err) => self.emit('parseError',err));

			main_db.on('reconnect',(obj) => self.emit('reconnect'));

			main_db.on('timeout',(err) => self.emit('timeout',err));

			db_ready = true;
			self.emit('ready');
			_checkQueue();
		} catch(err) {
			self.emit('error',err);
			connection.timer = setTimeout(function() {
				if(connection.count <= connection.attempts || connection.attempts == 0)
					_connectDB();
				clearTimeout(connection.timer);
			},connection.interval);
		}
	});

	const _createCollection = co.wrap(function* (name,options) {
		try {
			if(db_ready) {
				collections[name] = yield main_db.createCollection(name,options);
				Object.defineProperty(self,name,{
					get: function() {
						return collections[name];
					},
					set: function() {},
					configurable: false,
					enumerable: true
				});
			} else {
				queue.push({name,options});
			}
		} catch(err) {
			self.emit('error',err);
		}
	});

	this.createCollection = _createCollection;

	_connectDB();
};

module.exports = DB;
