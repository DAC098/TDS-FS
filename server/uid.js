const co = require('co');
const ObjectID = require('mongodb').ObjectID;

const log = logger.makeLog('cout',{name:'UID'});

const db = require('./db.js');

exports.getID = function getID() {
	return (new ObjectID()).toHexString();
};
