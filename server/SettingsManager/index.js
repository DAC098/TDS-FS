const events = require('events');
const fs = require('fs');
const path = require('path');
const util = require('util');

function getType(variable) {
	return Object.prototype.toString.call(variable).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

function checkTypes(variable,...args) {
	let curr_type = getType(variable);
	for(let check of args) {
		if(check === curr_type) {
			return true;
		}
	}
	return false;
}

function SettingsManager(defaults) {

	events.call(this);
	SettingsManager.prototype.__proto__ = events.prototype;

	const self = this;

	const root = process.cwd();

	var current_settings = {};

	function _setClassVariables(class_ref,obj_ref,key_array = []) {
		for(let key in obj_ref) {
			key_array.push(key);
			console.log('key:',key);
			console.log('array:',key_array);
			if(getType(obj_ref[key]) == 'object' && Object.keys(obj_ref[key]).length !== 0) {
				// _setKeyPair(class_ref,obj_ref,[key]);
				class_ref[key] = {};
				_setClassVariables(class_ref[key],obj_ref[key],[]);
			} else {
				_setKeyPair(class_ref,obj_ref,[key]);
			}
			key_array.pop();
		}
	}

	function _setKeyPair(class_ref,obj_ref,key_array) {
		let key = key_array[key_array.length - 1];
		Object.defineProperty(class_ref,key,{
			get: function() {
				return _getKey(key_array,obj_ref);
			},
			set: function(variable) {},
			enumerable: true
		});
	}

	function _getKey(string_array,obj_ref,pos = 0) {
		console.log('string_array:',string_array);
		let ref = Object.assign({},obj_ref);
		let c = 0,
			found = true;
		while(c < string_array.length - 1) {
			if(string_array[c] in ref) {
				ref = ref[string_array[c]];
				++c;
			} else {
				console.log('not found');
				found = false;
				break;
			}
		}
		return found ? ref[string_array[c]] : undefined;
	}

	function _setKey(string_array,obj_ref,value) {
		if(string_array.length == 1 && string_array[0] in obj_ref) {
			obj_ref[string_array[0]] = value;
		} else if(string_array[0] in obj_ref) {
			let key = string_array[0];
			string_array.shift();
			_setKeyPair(string_array,obj_ref,value);
		} else {
			console.log('not found');
		}
	}

	function _parseKeyString(string) {
		return string.split(/\.|\s/g);
	}

	this.get = function get(key_string) {
		return _getKey(_parseKeyString(key_string),current_settings);
	};

	this.set = function set(key_string,variable) {

	};

	if(getType(defaults) === 'string') {
		current_settings = path.isAbsolute(defaults) ? require(defaults) : require(path.join(root,defaults));
	} else if(getType(defaults) === 'object') {
		current_settings = defaults;
	} else {
		throw new TypeError(`the defaults given are not a string or object`);
	}

	_setClassVariables(self,current_settings);

	console.log('current settings:',util.inspect(self));
}

module.exports.SettingsManager = SettingsManager;
module.exports = function(defaults) {
	return new SettingsManager(defaults);
};
