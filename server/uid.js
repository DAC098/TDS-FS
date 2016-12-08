const co = require('co');

const log = logger.makeLog('cout',{name:'UID'});

const db = require('./db.js');

var current = 0;

db.on('ready',() => {
	co(function* () {
		let highest = yield db.users.find()
		.sort({_id:-1})
		.limit(1)
		.project({_id:1})
		.toArray();
		if(highest.length === 1) {
			current = highest[0]._id;
		}
	});
});

exports.getNextID = function getNextID() {
	return ++current;
};

exports.getCurrID = function getCurrID() {
	return current;
};
