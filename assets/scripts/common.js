webpackJsonp([4,5],{

/***/ 121:
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {const NAME_NOT_FOUND  = 'name not found in timers';
const NAME_TYPE_INVALID = 'name needs to be of type string';

// ----------------------------------------------------------------------------
// methods
// ----------------------------------------------------------------------------

const {padStart,getType,check} = __webpack_require__(122);

function logDefaults(obj = {}) {
	obj.name = obj.name || '';
	obj.prefix = obj.prefix || '';
	return obj;
}

function streamOptions(obj = {}) {
	obj.production = getType(obj.production) == 'boolean' ? obj.production : true;
	obj.development = getType(obj.development) == 'boolean' ? obj.development : true;
	return obj;
}

function setConst(ref,name,val) {
	Object.defineProperty(ref,name,{
		value: val,
		writable: false,
		configurable: false,
		enumerable: true
	});
}

// ----------------------------------------------------------------------------
// constructor
// ----------------------------------------------------------------------------

function Logger(options) {

	setConst(this,'platform',Object.keys(process.env).length != 0 ? 'server' : 'browser');
	setConst(this,'env',this.platform != 'browser' ? (process.env.NODE_ENV || 'development') : 'development');
	setConst(this,'is_server',this.platform == 'server');
	setConst(this,'start',this.platform != 'browser' ? process.hrtime() : performance.now());
	this.timers = {};
	this.streams = {};
	this.pre_streams = {};

}
// ----------------------------------------------------------------------------
// misc methods
// ----------------------------------------------------------------------------

Logger.prototype.padStart = padStart;

Logger.prototype.checkName = function checkName(name,return_val = false) {
	if(typeof name !== 'string') throw new TypeError(NAME_TYPE_INVALID);
	if(!return_val) {
		if(!(name in this.timers)) throw new RangeError(NAME_NOT_FOUND);
	} else {
		return name in this.timers;
	}
};

Logger.prototype.dTime = function dTime(date,string = true) {
	let today = date || new Date();
	let hr = padStart(today.getHours(),2,'0'),
		min = padStart(today.getMinutes(),2,'0'),
		sec = padStart(today.getSeconds(),2,'0'),
		ms = padStart(today.getMilliseconds(),3,'0');
	return string ? `${hr}:${min}:${sec}.${ms}` : {hr,min,sec,ms};
};

Logger.prototype.today = function today(date,string = true) {
	let today = date || new Date();
	let year = today.getFullYear(),
		month = padStart(today.getMonth() + 1,2,'0'),
		mday = padStart(today.getDate(),2,'0');
	return string ? `${year}-${month}-${mday}` : {year,month,mday} ;
};

Logger.prototype.pTime = function pTime(time,num) {
	let ms,sec,min,hr = 0;
	let now = time || (this.is_server ? process.hrtime(this.start) : performance.now());
	if(this.platform == 'server') {
		ms = Math.floor(now[1]/1000000);
		sec = now[0] % 60;
		min = Math.floor(now[0] / 60 % 60);
		hr = Math.floor(now[0] / 60 / 60 % 60);
	} else {
		ms = Math.floor(now % 1000);
		sec = Math.floor(now / 1000 % 60);
		min = Math.floor(now / 1000 / 60 % 60);
		hr = Math.floor(now / 1000 / 60 / 60 % 60);
	}
	return (num) ? {hr,min,sec,ms} : `${padStart(hr,2,'0')}:${padStart(min,2,'0')}:${padStart(sec,2,'0')}.${padStart(ms,3,'0')}`;
};

// ----------------------------------------------------------------------------
// stream methods
// ----------------------------------------------------------------------------

Logger.prototype.makeStream = function makeStream(name,stream_options,cb) {
	let c_name = getType(name),
		c_options = getType(stream_options),
		c_cb = getType(cb);
	let options = streamOptions();

	if(!check(name,'string'))
		throw new TypeError(`makeStream received ${c_name} for name, expected string`);

	if(!check(stream_options,'object','function'))
		throw new TyperError(`makeStream received ${c_options}, expected object or callback`);

	if(c_options == 'object' && !check(cb,'function'))
		throw new TypeError(`makeStream received ${c_cb} for callback, expected function`);

	if(c_options == 'object')
		options = streamOptions(stream_options);

	this.streams[name] = {
		options,
		cb
	};
};

Logger.prototype.makePreStream = function makePreStream(name,stream_options,cb) {

	let c_name = getType(name),
		c_options = getType(stream_options),
		c_cb = getType(cb);
	let options = streamOptions();

	if(!check(name,'string'))
		throw new TypeError(`makePreStream received ${c_name} for name, expected string`);

	if(!check(stream_options,'object','function'))
		throw new TypeError(`makePreStream received ${c_options}, expected object or function`);

	if(c_options == 'object' && !check(cb,'function'))
		throw new TypeError(`makePreStream received ${c_cb} for callback, expected function`);

	if(c_options == 'object')
		options = streamOptions(stream_options);

	if(name in this.streams) {
		let obj = {
			options,
			cb
		};
		if(!(name in this.pre_streams)) {
			this.pre_streams[name] = [obj];
		} else {
			this.pre_streams[name].push(obj);
		}
	} else {
		throw new Error(`unable to find ${name} in stream list`);
	}

};

// ----------------------------------------------------------------------------
// logging methods
// ----------------------------------------------------------------------------

Logger.prototype.makeLog = function makeLog(name,log) {
	let c_name = getType(name),
		c_log = getType(log),
		stream = null,
		pre_stream = null,
		self = this;

	if(!check(name,'string'))
		throw new TypeError(`var name received ${c_name}`);

	if(!check(log,'object','undefined'))
		throw new TypeError(`var log received ${c_log}`);

	if(!(name in this.streams)) {
		throw new Error(`${name} was not found in stream list`);
	} else {
		stream = this.streams[name];
		if(name in this.pre_streams)
			pre_stream = this.pre_streams[name];
		log = logDefaults(log);
	}

	return (...args) => {
		let cpu = this.is_server ? process.hrtime(this.start) : performance.now();
		let date = new Date();
		let env = this.env;
		if(pre_stream) {
			let len = pre_stream.length;
			for(let c = 0; c < len; ++c) {

				if(pre_stream[c].options[env])
					process.nextTick(function() {
						pre_stream[c].cb.call(self,log,cpu,date,[...args]);
					});

				if(c == len - 1 && stream.options[env])
					process.nextTick(function() {
						stream.cb.call(self,log,cpu,date,args);
					});

			}
		} else {
			if(stream.options[env])
				process.nextTick(function() {
					stream.cb.call(self,log,cpu,date,args);
				});
		}
	};
};

// ----------------------------------------------------------------------------
// timer methods
// ----------------------------------------------------------------------------

Logger.prototype.tStart = function tStart(name) {
	this.timers[name] = {
		start: this.is_server ? process.hrtime() : performance.now(),
		end: [],
		stopped: false
	};
};

Logger.prototype.tGet = function tGet(name,number = false) {
	this.checkName(name);
	let now = this.is_server ? process.hrtime(this.timers[name].start) : performance.now() - this.timers[name].start;
	return (number) ? now : this.pTime(now);
};

Logger.prototype.tStop = function tStop(name) {
	this.checkName(name);
	this.timers[name].stopped = true;
	this.timers[name].end = this.is_server ? process.hrtime(this.timers[name].start) : performance.now() - this.timers[name].start;
};

Logger.prototype.tResults = function tResults(name) {
	this.checkName(name);
	if(this.timers[name].stopped) this.tStop(name);
	return this.pTime(this.timers[name].end);
};

Logger.prototype.tClear = function tClear(name) {
	this.checkName(name);
	this.timers[name] = {
		start: [],
		end: [],
		stopped: false
	};
};

Logger.prototype.tDelete = function tDelete(name) {
	this.checkName(name);
	delete this.timers[name];
};

// ----------------------------------------------------------------------------
// export
// ----------------------------------------------------------------------------

module.exports.Logger = Logger;
module.exports = function(options,streams) {
	return new Logger(options,streams);
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },

/***/ 122:
/***/ function(module, exports) {

function padStart(modify,length,fill=" ") {
	modify = (getType(modify) !== 'string') ? String(modify) : modify;
	let mod_len = modify.length,
		fill_len = fill.length,
		fill_count = 0;
	let pad_count = length - mod_len;
	for(let c = 0; c < pad_count; ++c) {
		if(fill_count = fill_len - 1) fill_count = 0;
		modify = `${fill[fill_count]}${modify}`;
		++fill_count;
	}
	return modify;
}

exports.padStart = padStart;

function getType(variable) {
	return Object.prototype.toString.call(variable).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

exports.getType = getType;

function check(variable,...types) {
	let c_variable = getType(variable);
	for(let str of types) {
		if(c_variable === str) {
			return true;
		}
	}
	return false;
}

exports.check = check;


/***/ },

/***/ 41:
/***/ function(module, exports, __webpack_require__) {


var exp = __webpack_require__(121)();

function cout(log,cpu,date,args) {
	let idn = log.name.length !== 0 ? `:${log.name}` : '';
	args.unshift(`[${this.pTime()}${idn}]${log.prefix}:`);
	console.log.apply(null,args);
}

exp.makeStream('cout',{production:false},cout);

module.exports = exp;


/***/ },

/***/ 70:
/***/ function(module, exports, __webpack_require__) {


function CSocket(domain,obj) {

	if(typeof window !== 'undefined') {
		var io = __webpack_require__(72);

		var socket = io(window.location.origin+'/'+domain);

		if(obj) {
			let reconnecting = false;
			let count = 0;

			socket.on('connect',() => {
				obj.log('connected to server');
			});

			socket.on('error',(err) => {
				obj.error('error in the connection,',err);
			});

			socket.on('disconnect',() => obj.log('disconnected from server'));

			socket.on('reconnect',() => {
				reconnecting = false;
				count = 0;
				obj.log('reconnected with server');
			});

			socket.on('reconnect_attempt',() => {
				++count;
				obj.log('count:',count);
			});

			socket.on('reconnecting',() => {
				if(!reconnecting) {
					obj.log('attempting to reconnect');
					reconnecting = true;
				}
			});

			socket.on('reconnect_failed',() => obj.error('failed to reconnect with server'));
		}

		return socket;
	} else {
		return null;
	}
}

module.exports = function(domain,obj) {
	return CSocket(domain,obj);
};


/***/ }

});