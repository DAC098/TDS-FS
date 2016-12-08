const fs = require('fs');
const path = require('path');
const util = require('util');

const Logger = require('../lib/Logger')();

const today = new Date();

const fdate = Logger.today(today,false);
const ftime = Logger.dTime(today,false);

const file_path = path.join(process.cwd(),'log_files',`${fdate.year}${fdate.month}${fdate.mday}T${ftime.hr}${ftime.min}${ftime.sec}`);

try {
	let stats = fs.statSync(path.join(process.cwd(),'log_files'));
} catch(err) {
	if(err.code == 'ENOENT') {
		fs.mkdirSync(path.join(process.cwd(),'log_files'));
	}
}

var stdout = {};

if(process.env.NODE_ENV == 'development')
	stdout = fs.createWriteStream(file_path+'.log',{flag:'a'});

function cout(log,cpu,date,args) {
	let idn = log.name.length !== 0 ? `:${log.name}` : '';
	args.unshift(`[${this.pTime()}${idn}]${log.prefix}:`);
	console.log.apply(null,args);
	return true;
}

Logger.makeStream('cout',{production:false},cout);

Logger.makePreStream('cout',{production:false},function(log,cpu,date,args) {
	let idn = log.name.length !== 0 ? `:${log.name}` : '';
	args.unshift(`[${this.today()}T${this.dTime()}${idn}]${log.prefix}:`);
	stdout.write(`${util.format.apply(null,args)}\n`);
	return true;
});

module.exports = Logger;
