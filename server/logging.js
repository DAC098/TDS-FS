const fs = require('fs');
const path = require('path');
const util = require('util');

const Logger = require('Logger')();

const today = new Date();

const fdate = Logger.today(today,false);
const ftime = Logger.dTime(today,false);

const file_path = path.join(process.cwd(),'log_files',`${fdate.year}${fdate.month}${fdate.mday}T${ftime.hr}${ftime.min}${ftime.sec}`);

console.log('checking dir');
try {
	let stats = fs.statSync(path.join(process.cwd(),'log_files'));
} catch(err) {
	if(err.code == 'ENOENT') {
		console.log('making dir');
		fs.mkdirSync(path.join(process.cwd(),'log_files'));
	}
}

const stdout = fs.createWriteStream(file_path+'.log',{flag:'a'});

function cout(log,cpu,date,args) {
	let idn = log.name.length !== 0 ? `:${log.name}` : '';
	args.unshift(`[${this.pTime()}${idn}]${log.prefix}:`);
	console.log.apply(null,args);
	return true;
}

Logger.makeStream('cout',cout);

Logger.makePreStream('cout',function(log,cpu,date,args) {
	let idn = log.name.length !== 0 ? `:${log.name}` : '';
	args.unshift(`[${this.today()}T${this.dTime()}${idn}]${log.prefix}:`);
	stdout.write(`${util.format.apply(null,args)}\n`);
	return true;
});

module.exports = Logger;
