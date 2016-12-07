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
