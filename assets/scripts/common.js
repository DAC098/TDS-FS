webpackJsonp([2],{

/***/ 14:
/***/ function(module, exports) {

function getType(variable) {
	return Object.prototype.toString.call(variable).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

exports.getType = getType;

exports.checkType = function checkType(variable,...types) {
	let var_curr = getType(variable);
	for(let check of types) {
		if(check === var_curr) {
			return true;
		}
	}
	return false;
};

exports.pad = function pad(num,places = 1) {
	var calc_array = [10,100,1000];
	var rtn = `${num}`;
	var count = 1;
	for(const number of calc_array) {
		if(num < number) {
			rtn = `0${rtn}`;
		}
		if(count === places) {
			return rtn;
		}
		++count;
	}
};

function padStart(modify,length,fill = " ") {
	modify = (getType(modify) !== 'string') ? String(modify) : modify;
	var mod_len = modify.length;
	var fill_len = fill.length;
	var fill_count = 0;
	var pad_count = length - mod_len;
	for(var c = 0; c < pad_count; ++c) {
		if(fill_count = fill_len - 1) fill_count = 0;
		modify = `${fill[fill_count]}${modify}`;
		++fill_count;
	}
	return modify;
}

exports.padStart = padStart;

exports.padEnd = function padEnd(modify,length,fill = " ") {
	modify = (getType(modify) !== 'string') ? String(modify) : modify;
	var mod_len = modify.length;
	var fill_len = fill.length;
	var fill_count = 0;
	var pad_count = length - mod_len;
	for(var c = 0; c < pad_count; ++c) {
		if(fill_count = fill_len - 1) fill_count = 0;
		modify = `${modify}${fill[fill_count]}`;
		++fill_count;
	}
	return modify;
};

exports.isoDate = function isoDate(date) {
	date = (getType(date) === 'string') ? new Date(date) : date;
	return `${date.getFullYear()}-${padStart(date.getMonth() + 1,2,'0')}-${padStart(date.getDate(),2,'0')}T${padStart(date.getHours(),2,'0')}:${padStart(date.getMinutes(),2,'0')}:${padStart(date.getSeconds(),2,'0')}.${padStart(date.getMilliseconds(),3,'0')}Z`;
};

exports.joinPath = function joinPath(paths = []) {
	if(getType(paths) === 'undefined' || paths.length === 0) {
		return '/';
	}
	let str = '';
	let len = paths.length;
	for(let c = 0; c < len; ++c) {
		paths[c] = (paths[c]) ? paths[c].replace('/','') : '';
		str = (paths[c] !== '') ? `${str}/${paths[c]}` : str;
	}
	return str;
};

exports.splitPath = function splitPath(str) {
	let rtn = str.split('/');
	let len = rtn.length,
		c = 0;
	while(c < len) {
		if(rtn[c] === '') {
			rtn.shift();
			--len;
		} else {
			++c;
		}
	}
	return rtn;
};


/***/ },

/***/ 22:
/***/ function(module, exports, __webpack_require__) {

var {padStart} = __webpack_require__(14);

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


/***/ },

/***/ 236:
/***/ function(module, exports, __webpack_require__) {

__webpack_require__(22);
__webpack_require__(26);
module.exports = __webpack_require__(34);


/***/ },

/***/ 26:
/***/ function(module, exports) {

exports.sendJSON = function sendJSON(url,obj) {
	let base_url = window.location.origin + url;
	return new Promise(function(resolve,reject) {
		let xhr = new XMLHttpRequest();
		xhr.open('post',base_url,true);
		xhr.setRequestHeader('Content-type','application/json');
		xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
		xhr.onreadystatechange = () => {
			if(xhr.readyState === XMLHttpRequest.DONE) {
				let {status,response} = xhr;
				resolve({status,response});
			}
		};
		xhr.send(JSON.stringify(obj));
	});
};


/***/ },

/***/ 34:
/***/ function(module, exports) {

function Store() {

	var is_set = typeof window !== 'undefined';

	var ss = (is_set) ? window.sessionStorage : null;

	var ls = (is_set) ? window.localStorage : null;

	this.get = function get(key,use_ss = true) {
		if(is_set) {
			if(use_ss || typeof use_ss === 'undefined') {
				return ss.getItem(key);
			} else {
				return ls.getItem(key);
			}
		}
	};

	this.set = function set(key,value,use_ss = true) {
		if(is_set) {
			if(use_ss || typeof use_ss === 'undefined') {
				ss.setItem(key,value);
			} else {
				ls.setItem(key,value);
			}
		}
	};

	this.remove = function remove(key,use_ss = true) {
		if(is_set) {
			if(use_ss || typeof use_ss === 'undefined') {
				ss.removeItem(key);
			} else {
				ls.removeItem(key);
			}
		}
	};

	this.clear = function clear(use_ss = true) {
		if(is_set) {
			if(use_ss || typeof use_ss === 'undefined') {
				ss.clear();
			} else {
				ls.clear();
			}
		}
	};
}

module.exports = new Store();


/***/ }

},[236]);