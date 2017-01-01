
var exp = require('../lib/Logger/index.js')();

function cout(log,cpu,date,args) {
	let idn = log.name.length !== 0 ? `:${log.name}` : '';
	args.unshift(`[${this.pTime()}${idn}]${log.prefix}:`);
	console.log.apply(null,args);
}

exp.makeStream('cout',{production:false},cout);

module.exports = exp;
