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
			if(obj_ref[key].type == 'container') {
				Object.defineProperty(class_ref,key,{
					value: {},
					writable: false,
					configurable: false,
					enumerable: true
				});
				_setClassVariables(class_ref[key],obj_ref[key].value);
			} else {
				Object.defineProperty(class_ref,key,{
					get: function() {
						return _getNewType(obj_ref[key].value);
					},
					set: function() {},
					configurable: false,
					enumerable: true
				});
			}
		}
	}

	function _getNewType(variable) {
		switch (getType(variable)) {
			case 'object':
				return Object.assign({},variable);
				break;
			case 'array':
				return Array.from(variable);
				break;
			case 'string':
				return String(variable);
				break;
			case 'number':
				return Number(variable);
				break;
			case 'boolean':
				return Boolean(variable);
				break;
			case 'date':
				return Date(variable);
				break;
			default:
				return {};
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

	function _setupRefObject(curr_ref) {
		let rtn = {};
		for(let key in curr_ref) {
			if(hasSubKeys(curr_ref[key])) {
				rtn[key] = {
					type: 'container',
					value: _setupRefObject(curr_ref[key])
				};
			} else {
				rtn[key] = {
					type: getType(curr_ref[key]),
					value: _getNewType(curr_ref[key])
				};
			}
		}
		return rtn;
	}

	function _setSettings(obj,settings_ref) {
		for(let key in obj) {
			if(key in settings_ref) {
				if(settings_ref[key].type == 'container') {
					_setSettings(obj[key],settings_ref[key]);
				} else {
					settings_ref[key].value = _getNewType(obj[key]);
				}
			}
		}
	}

	this.set = function set(obj) {
		_setSettings(obj,current_settings);
	};

	this.setKey = function setKey(name,value) {
		let key_array = _parseKeyString(name);

	};

	if(getType(defaults) === 'string') {
		current_settings = path.isAbsolute(defaults) ? _setupRefObject(require(defaults)) : _setupRefObject(require(path.join(root,defaults)));
	} else if(getType(defaults) === 'object') {
		current_settings = _setupRefObject(defaults);
	} else {
		throw new TypeError(`the defaults given are not a string or object`);
	}

	_setClassVariables(self,current_settings);
}

module.exports.SettingsManager = SettingsManager;
module.exports = function(defaults) {
	return new SettingsManager(defaults);
};
