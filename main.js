global.reqRoot = function(path) {
	let root = process.cwd();
	return require(root + '/' + path);
};

global.reqLib = function(name) {
	let root = process.cwd();
	return require(root+'/lib/'+name+'/index.js');
};

process.env.NODE_ENV = 'development';

let len = process.argv.length;
let env_reg = /\-env/g;
for(let c = 0; c < len; ++c) {
	let env_res = env_reg.exec(process.argv[c]);
	if(env_res && process.argv[c + 1] == 'production') {
		process.env.NODE_ENV = 'production';
	}
}

global.settings = require('./lib/SettingsManager/index.js')('./settings.json');

global.logger = require('./server/logging.js');

const main_svr = require('./server/server.js')();

main_svr.startHTTP();
main_svr.startHTTPS();
