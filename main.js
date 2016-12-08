global.reqRoot = function(path) {
	let root = process.cwd();
	return require(root + '/' + path);
};

global.settings = require('./lib/SettingsManager/index.js')('./settings.json');

global.logger = require('./server/logging.js');

require('./server/server.js');
