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
