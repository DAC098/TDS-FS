// ----------------------------------------------------------------------------
// methods
// ----------------------------------------------------------------------------

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

function getType(variable) {
	return Object.prototype.toString.call(variable).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

function check(variable,...types) {
	let c_variable = getType(variable);
	for(let str of types) {
		if(c_variable === str) {
			return true;
		}
	}
	return false;
}

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

// ----------------------------------------------------------------------------
// constructor
// ----------------------------------------------------------------------------

function Logger(options) {

	this.start = process.hrtime();
	this.timers = {};
	this.streams = {};
	this.pre_streams = {};

}
// ----------------------------------------------------------------------------
// misc methods
// ----------------------------------------------------------------------------

Logger.prototype.padStart = padStart;

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
	let now = time || process.hrtime(this.start);
	let ms = Math.floor(now[1]/1000000);
	let sec = now[0] % 60;
	let min = Math.floor(now[0] / 60 % 60);
	let hr = Math.floor(now[0] / 60 / 60 % 60);
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
		let cpu = process.hrtime(this.start);
		let date = new Date();
		let env = process.env.NODE_ENV || 'development';
		if(pre_stream) {
			let len = pre_stream.length;
			for(let c = 0; c < len; ++c) {
				if(pre_stream[c].options[env])
					pre_stream[c].cb.call(self,log,cpu,date,[...args]);

				if(c == len - 1 && stream.options[env])
					stream.cb.call(self,log,cpu,date,args);

			}
		} else {
			if(stream.options[env])
				stream.call(self,log,cpu,date,args);
		}
	};
};

// ----------------------------------------------------------------------------
// timer methods
// ----------------------------------------------------------------------------

Logger.prototype.tStart = function tStart(name) {
	this.timers[name] = {
		start: process.hrtime(),
		end: [],
		stopped: false
	};
};

Logger.prototype.tGet = function tGet(name,number = false) {
	if(name in this.timers) {
		let now = process.hrtime(this.timers[name].start);
		return (number) ? now : this.pTime(now);
	} else {
		throw new Error(`${name} does not exist`);
	}
};

Logger.prototype.tStop = function tStop(name) {
	if(name in this.timers) {
		this.timers[name].stopped = true;
		this.timers[name].end = process.hrtime(this.timers[name].start);
	} else {
		throw new Error(`${name} does not exist`);
	}
};

Logger.prototype.tResults = function tResults(name) {
	if(name in this.timers) {
		if(this.timers[name].stopped) this.tStop(name);
		return this.pTime(this.timers[name].end);
	} else {
		throw new Error(`${name} does not exist`);
	}
};

Logger.prototype.tClear = function tClear(name) {
	if(name in this.timers) {
		this.timers[name] = {
			start: [],
			end: [],
			stopped: false
		};
	} else {
		throw new Error(`${name} does not exist`);
	}
};

Logger.prototype.tDelete = function tDelete(name) {
	if(name in this.timers) {
		delete this.timers[name];
	} else {
		throw new Error(`${name} does not exist`);
	}
};

// ----------------------------------------------------------------------------
// export
// ----------------------------------------------------------------------------

module.exports.Logger = Logger;
module.exports = function(options,streams) {
	return new Logger(options,streams);
};
