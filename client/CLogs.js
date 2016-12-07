var {padStart} = require('../lib/misc.js');

function CLogs() {

	var self = this;

	var timers = {};

	var NAME_NOT_FOUND  = 'name not found in timers';
	var NAME_TYPE_INVALID = 'name needs to be of type string';

	function checkName(name) {
		if(typeof name !== 'string') throw new TypeError(NAME_TYPE_INVALID);
		if(!(name in timers)) throw new RangeError(NAME_NOT_FOUND);
	};

	this.now = function now() {
		let now = performance.now();
		let ms = Math.floor(now % 1000);
		let sec = Math.floor(now / 1000 % 60);
		let min = Math.floor(now / 1000 / 60 % 60);
		let hr = Math.floor(now / 1000 / 60 / 60 % 60);
		return `${padStart(hr,2,'0')}:${padStart(min,2,'0')}:${padStart(sec,2,'0')}.${padStart(ms,3,'0')}`;
	};

	this.makeLog = function makeLog(obj = {}) {
		let name = obj.name || '';
		let prefix = obj.prefix || '';
		let enabled = typeof obj.enabled === 'boolean' ? obj.enabled : true;
		return (...args) => {
			if(enabled) {
				var idn = name.length > 0 ? `-${name}` : '';
				args.unshift(`[${this.now()}${idn}]${prefix}:`);
				console.log.apply(null,args);
			}
		};
	};

	this.tStart = function tStart(name) {
		if(typeof name !== 'string') throw new TypeError(NAME_TYPE_INVALID);
		timers[name] = {
			start: performance.now(),
			diff: 0
		};
	};

	this.tStop = function tStop(name) {
		checkName(name);
		var now = performance.now();
		timers[name].diff = now - timers[name].start;
		return timers[name].diff;
	};

	this.tCurrent = function tCurrent(name) {
		checkName(name);
		var now = performance.now();
		return now - timers[name].start;
	};

	this.tGet = function tGet(name) {
		checkName(name);
		return timers[name];
	};

	this.tClear = function tClear(name) {
		checkName(name);
		timers[name] = {
			start: 0,
			diff: 0
		};
	};

}

var exp = new CLogs();

module.exports = exp;
