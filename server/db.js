const DB = reqLib('DB');

const log = logger.makeLog('cout',{name:'db'});
const error = logger.makeLog('cout',{name:'db',prefix:'ERROR'});

var options = Object.assign({},settings.db);

var db = new DB(settings.db);

db.createCollection('users');
db.createCollection('files');
db.createCollection('directories');

db.on('error',(err) => {
	error(err.message);
});

db.on('ready',() => {
	log('db ready');
});

module.exports = db;
