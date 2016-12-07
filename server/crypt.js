// node modules
const crypto = require('crypto');
const fs = require('fs');

const settings = require('./settingMan.js');

// log methods
const log = require('./logging.js').makeLog('cout',{name:'crypt'});
const error = require('./logging.js').makeLog('cout',{name:'crypt',prefix:'ERROR'});

const HASH = 'sha512';
const ENCODING = 'utf-8';
const BASE = 'base64';

console.log('finding ssl key string--------------------------------------------');
console.log('ssl key',settings.ssl.key);
console.log('completed---------------------------------------------------------');

var cert = {
	key: fs.readFileSync(settings.ssl.key),
	cert: fs.readFileSync(settings.ssl.cert)
};

if('passphrase' in settings.ssl) {
	cert.passphrase = settings.ssl.passphrase;
}

exports.getSSLData = function getSSLData() {

};

exports.getSalt = () => {
	let buffer = crypto.randomBytes(256);
	return buffer.toString(BASE);
};

exports.getHash = (str,salt) => {
	try {
		let hash = crypto.createHmac(HASH,salt);
		hash.update(str);
		return hash.digest(BASE);
	} catch(err) {
		error('creating hash:',err.message);
		return undefined;
	}
};
