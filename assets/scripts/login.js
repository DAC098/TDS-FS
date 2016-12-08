webpackJsonp([1],{

/***/ 110:
/***/ function(module, exports, __webpack_require__) {

var React = __webpack_require__(10);

var log = __webpack_require__(30).makeLog('Login');
var { sendJSON } = __webpack_require__(40);

var Login = React.createClass({
    displayName: 'Login',

    getInitialState: function () {
        return {
            input: {
                username: '',
                password: '',
                confirm_password: ''
            },
            valid: {
                username: true,
                password: true,
                confirm_password: true
            },
            new_user: false
        };
    },
    componentDidMount: function () {},
    // ------------------------------------------------------------------------
    // state mutators
    // ------------------------------------------------------------------------
    handleInput: function (key) {
        let { input } = this.state;
        input[key] = this.refs[key].value;
        this.setState({ input });
    },
    enableSignUp: function (event) {
        event.preventDefault();
        this.setState({
            new_user: !this.state.new_user
        });
    },
    sendUserData: function (event) {
        event.preventDefault();
        let { input, valid, new_user } = this.state;
        let { username, password, confirm_password } = input;
        if (new_user) {
            let promise = sendJSON('/user/create', input);
            promise.then(data => {
                if (data.status === 300) {
                    log('redirecting');
                    let url = JSON.parse(data.response).url;
                    let redirect = window.location.origin + url;
                    window.location = redirect;
                } else {
                    log('status code', data.status, '\nresponse:', data.response);
                }
            });
        } else {
            let promise = sendJSON('/user/login', { username, password });
            promise.then(data => {
                if (data.status >= 400) {
                    let obj = JSON.parse(data.response);
                    valid.username = obj.username;
                    valid.password = !obj.username;
                    log(!valid.username ? 'invalid username' : 'invalid password');
                    this.setState({ valid });
                } else if (data.status === 200) {
                    log('redirecting');
                    let url = JSON.parse(data.response).url;
                    let redirect = window.location.origin + url;
                    window.location = redirect;
                } else {
                    log('status code', data.status, '\nresponse:', data.response);
                }
            });
        }
    },
    // ------------------------------------------------------------------------
    // render
    // ------------------------------------------------------------------------
    render: function () {
        let { input, display } = this.state;
        return React.createElement(
            'main',
            null,
            React.createElement(
                'div',
                { id: 'login', ref: 'login' },
                React.createElement(
                    'section',
                    null,
                    React.createElement('div', null)
                ),
                React.createElement(
                    'section',
                    null,
                    React.createElement(
                        'form',
                        null,
                        React.createElement('input', { ref: 'username',
                            onChange: () => this.handleInput('username'),
                            name: 'username', type: 'text',
                            placeholder: 'Username',
                            value: input.username
                        }),
                        React.createElement('input', { ref: 'password',
                            onChange: () => this.handleInput('password'),
                            name: 'password', type: 'text',
                            placeholder: 'Password',
                            value: input.password
                        }),
                        this.state.new_user ? React.createElement('input', { ref: 'confirm_password',
                            onChange: () => this.handleInput('confirm_password'),
                            name: 'confirm_password', type: 'password',
                            placeholder: 'Confrim Password',
                            value: input.confirm_password
                        }) : null,
                        React.createElement('input', { type: 'button', className: 'inline',
                            onClick: event => this.sendUserData(event),
                            value: this.state.new_user ? 'Sign Up' : 'Login'
                        }),
                        React.createElement('input', { type: 'button', className: 'inline',
                            onClick: event => this.enableSignUp(event),
                            value: this.state.new_user ? 'Cancel' : 'Sign Up'
                        })
                    )
                )
            )
        );
    }
});

module.exports = Login;

/***/ },

/***/ 16:
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

/***/ 248:
/***/ function(module, exports, __webpack_require__) {

var React = __webpack_require__(10);
var {render} = __webpack_require__(24);

var Login = __webpack_require__(110);

render(React.createElement(Login),document.getElementById('render'));


/***/ },

/***/ 30:
/***/ function(module, exports, __webpack_require__) {

var {padStart} = __webpack_require__(16);

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

/***/ 40:
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


/***/ }

},[248]);