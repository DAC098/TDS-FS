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

function hasSubKeys(obj) {
	return getType(obj) == 'object' && Object.keys(obj).length != 0;
}

function SettingsManager(defaults) {

	events.call(this);
	SettingsManager.prototype.__proto__ = events.prototype;

	const self = this;

	const root = process.cwd();

	var current_settings = {};

	function _setClassVariables(class_ref,obj_ref) {
		for(let key in obj_ref) {
			if(getType(obj_ref[key]) == 'object' && Object.keys(obj_ref[key]).length !== 0) {
				Object.defineProperty(class_ref,key,{
					value: {},
					writable: false,
					configurable: false,
					enumerable: true
				});
				_setClassVariables(class_ref[key],obj_ref[key]);
			} else {
				Object.defineProperty(class_ref,key,{
					get: function() {
						return obj_ref[key];
					},
					set: function() {},
					configurable: false,
					enumerable: true
				});
			}
		}
	}

	function _parseKeyString(string) {
		return string.split(/\.|\s/g);
	}

	function _setKeyPair(array,value,settings_ref,count) {
		let key = array[count];
		if(key in settings_ref) {
			if(hasSubKeys(obj[key])) {
				_setKeyPair(array,vallue,settings_ref[key],count + 1);
			} else {
				settings_ref[key] = value;
			}
		}
	}

	function _setSettings(obj,settings_ref) {
		for(let key in obj) {
			if(key in settings_ref) {
				if(getType(obj[key]) == 'object' && Object.keys(obj[key]).length != 0) {
					_setSettings(obj[key],settings_ref[key]);
				} else {
					settings_ref[key] = obj[key];
				}
			}
		}
	}

	this.set = function set(obj) {
		_setSettings(obj);
	};

	this.setKey = function setKey(name,value) {
		let key_array = _parseKeyString(name);

	};

	if(getType(defaults) === 'string') {
		current_settings = path.isAbsolute(defaults) ? require(defaults) : require(path.join(root,defaults));
	} else if(getType(defaults) === 'object') {
		current_settings = defaults;
	} else {
		throw new TypeError(`the defaults given are not a string or object`);
	}

	_setClassVariables(self,current_settings);
}

module.exports.SettingsManager = SettingsManager;
module.exports = function(defaults) {
	return new SettingsManager(defaults);
};
