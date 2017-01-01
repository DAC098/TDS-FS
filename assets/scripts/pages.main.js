webpackJsonp([2,5],{

/***/ 115:
/***/ function(module, exports, __webpack_require__) {

module.exports = {
	site_page: true,
	name: 'browse.page',
	route: '/browse',
	script: 'pages.main.js',
	element: {
		req: __webpack_require__(239),
		filename: 'Browse.js'
	}
};


/***/ },

/***/ 116:
/***/ function(module, exports, __webpack_require__) {

module.exports = {
	site_page: true,
	name: 'login.page',
	route: '/login',
	script: 'pages.main.js',
	element: {
		req: __webpack_require__(240),
		filename: 'Login.js'
	}
};


/***/ },

/***/ 120:
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


/***/ },

/***/ 234:
/***/ function(module, exports, __webpack_require__) {

var React = __webpack_require__(12);
var { isoDate } = __webpack_require__(30);
var classnames = __webpack_require__(71);

var DirContents = React.createClass({
    displayName: 'DirContents',

    renderContents: function () {
        return this.props.dir.map((element, index) => {
            let item_class = classnames({
                'selected': this.props.selected.has(index)
            });
            return React.createElement(
                'tr',
                { key: index,
                    onClick: () => this.props.selectItem(index, element.url),
                    onDoubleClick: () => this.props.fetch(element.type, element.url),
                    className: item_class
                },
                React.createElement(
                    'td',
                    null,
                    element.name
                ),
                React.createElement(
                    'td',
                    null,
                    element.type
                ),
                React.createElement(
                    'td',
                    null,
                    element.size
                ),
                React.createElement(
                    'td',
                    null,
                    isoDate(element.mtime)
                )
            );
        });
    },
    render: function () {
        var dir_empty = this.props.dir.length === 0;
        return React.createElement(
            'table',
            { className: 'md-table' },
            React.createElement(
                'thead',
                null,
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'th',
                        null,
                        'Name'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'Type'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'Size(bytes)'
                    ),
                    React.createElement(
                        'th',
                        null,
                        'Modified'
                    )
                )
            ),
            React.createElement(
                'tbody',
                null,
                dir_empty ? null : this.renderContents()
            )
        );
    }
});

module.exports = DirContents;

/***/ },

/***/ 235:
/***/ function(module, exports, __webpack_require__) {

var React = __webpack_require__(12);
var { isoDate } = __webpack_require__(30);

var FileContents = React.createClass({
	displayName: 'FileContents',

	render: function () {
		var { file } = this.props;
		return React.createElement(
			'section',
			null,
			React.createElement(
				'section',
				null,
				React.createElement(
					'a',
					{ href: file.download, download: true },
					'Download'
				),
				React.createElement('input', { type: 'button', onClick: () => this.props.removeFile(), value: 'delete' })
			),
			React.createElement(
				'ul',
				null,
				React.createElement(
					'li',
					null,
					'name: ',
					file.name
				),
				React.createElement(
					'li',
					null,
					'extension: ',
					file.ext
				),
				React.createElement(
					'li',
					null,
					'full name: ',
					file.base
				),
				React.createElement(
					'li',
					null,
					'size (bytes): ',
					file.size
				),
				React.createElement(
					'li',
					null,
					'created: ',
					isoDate(file.birthtime)
				),
				React.createElement(
					'li',
					null,
					'modified: ',
					isoDate(file.mtime)
				)
			)
		);
	}
});

module.exports = FileContents;

/***/ },

/***/ 236:
/***/ function(module, exports, __webpack_require__) {

var React = __webpack_require__(12);

function contentData(content) {
    let rtn = {
        size: 0,
        files: 0,
        dirs: 0,
        Kb: 0,
        Mb: 0
    };
    if (Array.isArray(content)) {
        for (let item of content) {
            rtn.size += item.size;
            rtn.files += item.type === 'file' ? 1 : 0;
            rtn.dirs += item.type === 'dir' ? 1 : 0;
        }
    } else {
        rtn.size = content.size;
    }
    rtn.KiB = Math.floor(rtn.size / 1024);
    rtn.MiB = Math.floor(rtn.size / 1048576);
    return rtn;
}

var ItemInfo = React.createClass({
    displayName: 'ItemInfo',

    render: function () {
        let { nav } = this.props;
        let meta = contentData(this.props.info);
        return React.createElement(
            'section',
            { id: 'dir-info', className: 'col-12' },
            React.createElement(
                'ul',
                { className: 'horizontal' },
                React.createElement(
                    'li',
                    null,
                    'size: ',
                    meta.MiB,
                    'MiB | ',
                    meta.KiB,
                    'KiB'
                ),
                nav.type.dir ? React.createElement(
                    'li',
                    null,
                    'files: ',
                    meta.files,
                    ', folders: ',
                    meta.dirs
                ) : null
            )
        );
    }
});

module.exports = ItemInfo;

/***/ },

/***/ 237:
/***/ function(module, exports, __webpack_require__) {

var React = __webpack_require__(12);

var { joinPath } = __webpack_require__(30);

var NavBar = React.createClass({
	displayName: 'NavBar',

	render: function () {
		let { nav } = this.props;
		return React.createElement(
			'section',
			{ id: 'nav-bar', className: 'col-12' },
			React.createElement(
				'form',
				null,
				React.createElement('input', { className: 'md-button flat dense',
					onClick: () => this.props.logout(),
					type: 'button', value: 'LOGOUT'
				}),
				React.createElement('input', { className: 'md-button flat dense',
					onClick: () => this.props.fetchDirection('refresh'),
					type: 'button', value: 'REFRESH'
				}),
				React.createElement('input', { disabled: nav.path.length === 0, className: 'md-button flat dense',
					onClick: () => this.props.fetchDirection('previous'),
					type: 'button', value: 'BACK'
				})
			),
			React.createElement(
				'span',
				null,
				'directory: ',
				joinPath(nav.path)
			)
		);
	}
});

module.exports = NavBar;

/***/ },

/***/ 238:
/***/ function(module, exports, __webpack_require__) {

var React = __webpack_require__(12);

var self = null;

var UploadBar = React.createClass({
    displayName: 'UploadBar',

    componentDidMount: function () {
        self = this;
    },
    statics: {
        clearFiles: function () {
            console.log('clearing files');
            self.refs['file'].value = '';
        }
    },
    handleChange: function (key) {
        switch (key) {
            case 'dir':
                this.props.setUploadState(key, this.refs[key].value);
                break;
            case 'file':
                let files = this.refs[key].files;
                console.log('files:', files);
                this.props.setUploadState(key, files);
                break;
            default:

        }
    },
    render: function () {
        return React.createElement(
            'section',
            { className: 'col-12 container' },
            React.createElement(
                'div',
                { className: 'col-6' },
                React.createElement(
                    'form',
                    null,
                    React.createElement('input', { type: 'file', ref: 'file', multiple: true,
                        onChange: () => this.handleChange('file')
                    }),
                    React.createElement('input', { type: 'button', className: 'small',
                        onClick: () => this.props.uploadFiles(),
                        value: 'upload'
                    })
                )
            ),
            React.createElement(
                'div',
                { className: 'col-6' },
                React.createElement(
                    'form',
                    null,
                    React.createElement('input', { type: 'text', ref: 'dir',
                        className: 'inline',
                        onChange: () => this.handleChange('dir'),
                        value: this.props.upload.dir
                    }),
                    React.createElement('input', { type: 'button', className: 'small',
                        onClick: () => this.props.uploadDir(),
                        value: 'create'
                    })
                )
            )
        );
    }
});

module.exports = UploadBar;

/***/ },

/***/ 239:
/***/ function(module, exports, __webpack_require__) {

var React = __webpack_require__(12);

var { sendJSON } = __webpack_require__(73);
var socket = __webpack_require__(70)('fs');
var store = __webpack_require__(120);
var { joinPath, splitPath } = __webpack_require__(30);

var logger = logger || __webpack_require__(41);
var log = logger.makeLog('cout', { name: 'App' });
var error = logger.makeLog('cout', { name: 'App', prefix: 'ERROR' });

var DirContents = __webpack_require__(234);
var FileContents = __webpack_require__(235);
var NavBar = __webpack_require__(237);
var ItemInfo = __webpack_require__(236);
var UploadBar = __webpack_require__(238);

var is_client = typeof window !== 'undefined';

var Browse = React.createClass({
	displayName: 'Browse',

	getInitialState: function () {
		return {
			selected: new Map(),
			content: {
				dir: [],
				file: {}
			},
			request: {
				type: '',
				opp: '',
				path: ''
			},
			nav: {
				path: [],
				type: {
					file: false,
					dir: false
				}
			},
			upload: {
				file: [],
				dir: ''
			}
		};
	},
	componentDidMount: function () {
		var self = this;
		let { nav } = this.state;
		let session_path = store.get('path'),
		    session_type = store.get('type');

		socket.on('update', response => {
			log('update from server\nresponse:', response);
			self.checkUpdate(response);
		});

		socket.on('opp-complete', response => {
			log(response.opp, 'completed\ntype:', response.type);
			switch (response.opp) {
				case 'fetch':
					self.fetchResponse(response);
					break;
				case 'remove':
					self.fetchDirection('previous');
					break;
				case 'upload':
					self.setUploadState(response.type);
					UploadBar.clearFiles();
					break;
			}
		});

		socket.on('opp-failed', reason => {
			error(reason.opp, 'failed\ntype:', reason.type, '\nmsg:', reason.msg);
		});

		if (session_path && session_type) {
			self.fetch(session_type, session_path);
		} else {
			self.fetchDirection('root');
		}
	},
	componentWillUnmount: function () {
		socket.removeAllListeners();
		store.clear();
	},
	componentWillReceiveProps: function (new_props) {
		if (!is_client) {
			console.log('setting directory from server');
			let { content } = this.state;
			if (new_props.dir) {
				content.dir = new_props.dir;
				this.setState({ content });
			}
		}
	},
	// ------------------------------------------------------------------------
	// user actions
	// ------------------------------------------------------------------------
	logout: function () {
		let promise = sendJSON('/user/logout', {});
		promise.then(data => {
			if (data.status === 200) {
				log('redirecting');
				let url = JSON.parse(data.response).url;
				let redirect = window.location.origin + url;
				window.location = redirect;
			}
		});
	},
	// ------------------------------------------------------------------------
	// checks
	// ------------------------------------------------------------------------
	checkUpdate: function (response) {
		let { nav, request } = this.state;
		let check = joinPath(nav.path),
		    request_path = '',
		    against = '';
		switch (response.opp) {
			case 'remove':
				request_path = splitPath(response.path);
				request_path.pop();
				against = joinPath(request_path);
				break;
			default:
				against = response.path;
		}
		log('comparing current:', check, '\nto:', against);
		if (check === against) {
			this.fetch(request.type, against);
		}
	},
	// ------------------------------------------------------------------------
	// state mutators
	// ------------------------------------------------------------------------
	setUploadState: function (key, value) {
		let { upload } = this.state;
		upload[key] = value;
		this.setState({ upload });
	},
	selectItem: function (key, path) {
		let { selected } = this.state;
		if (selected.has(key)) {
			selected.delete(key);
		} else {
			selected.set(key, path);
		}
		this.setState({ selected });
	},
	clearSelected: function () {
		let { selected } = this.state;
		selected.clear();
		this.setState({ selected });
	},
	setRequest: function (opp, type, path) {
		let { request } = this.state;
		request.opp = opp;
		request.type = type;
		request.path = path;
		this.setState({ request });
	},
	setNav: function (is_file, path) {
		let { nav } = this.state;
		nav.path = splitPath(path);
		nav.type.file = is_file;
		nav.type.dir = !nav.type.file;
		this.setState({ nav });
	},
	// ------------------------------------------------------------------------
	// fetch content
	// ------------------------------------------------------------------------
	fetch: function (type, path) {
		log('fetching:', type, '\npath:', path);
		switch (type) {
			case 'file':
				socket.emit('fetch-file', path);
				break;
			case 'dir':
				socket.emit('fetch-dir', path);
				break;
		}
		this.setRequest('fetch', type, path);
	},
	fetchDirection: function (direction, type, path) {
		let { nav, request } = this.state;
		let curr_path = Array.from(nav.path);
		switch (direction) {
			case 'next':
				curr_path.push(path);
				path = joinPath(curr_path);
				break;
			case 'previous':
				curr_path.pop();
				path = joinPath(curr_path);
				type = 'dir';
				break;
			case 'refresh':
				type = request.type;
				path = request.path;
				break;
			case 'root':
				type = 'dir';
				path = '/';
				break;
		}
		this.fetch(type, path);
	},
	fetchResponse: function (response) {
		let { request, content } = this.state;

		content[response.type] = response.data;
		store.set('type', request.type);
		store.set('path', request.path);
		this.clearSelected();
		this.setNav(response.type === 'file', request.path);
		this.setState({ content });
	},
	// ------------------------------------------------------------------------
	// uploading content
	// ------------------------------------------------------------------------
	uploadFiles: function () {
		let { nav, upload } = this.state;
		let files = upload.file;
		for (let item of files) {
			log('file:', item);
			let fr = new FileReader();
			fr.addEventListener('loadend', () => {
				socket.emit('upload-file', {
					data: fr.result,
					location: joinPath(nav.path),
					name: item.name
				});
			});
			fr.readAsArrayBuffer(item);
		}
	},
	uploadDir: function () {
		let { nav, upload } = this.state;
		let location = joinPath(nav.path);
		socket.emit('upload-dir', { name: upload.dir, location });
	},
	// ------------------------------------------------------------------------
	// removing content
	// ------------------------------------------------------------------------
	removeFile: function () {
		let { nav, content } = this.state;
		socket.emit('remove-file', { location: joinPath(nav.path), name: content.file.base });
	},
	// ------------------------------------------------------------------------
	// render
	// ------------------------------------------------------------------------
	render: function () {
		let { state } = this;
		let { nav } = state;
		let view = undefined;
		if (nav.type.file) {
			view = React.createElement(FileContents, { file: state.content.file, removeFile: this.removeFile });
		} else {
			view = React.createElement(DirContents, { dir: state.content.dir, selected: state.selected, selectItem: this.selectItem,
				fetch: this.fetch
			});
		}
		return React.createElement(
			'main',
			{ className: 'container' },
			React.createElement(
				'header',
				{ id: 'tool-area', className: 'container' },
				React.createElement(UploadBar, { upload: state.upload,
					uploadFiles: this.uploadFiles,
					uploadDir: this.uploadDir,
					setUploadState: this.setUploadState
				}),
				React.createElement(NavBar, { nav: state.nav,
					fetchDirection: this.fetchDirection,
					logout: this.logout
				}),
				React.createElement(ItemInfo, { nav: state.nav, info: state.nav.type.file ? state.content.file : state.content.dir })
			),
			React.createElement('div', { id: 'header-pad', className: 'col-12' }),
			React.createElement(
				'section',
				{ id: 'content-area', className: 'col-12 scroll-area' },
				view
			)
		);
	}
});

module.exports = Browse;

/***/ },

/***/ 240:
/***/ function(module, exports, __webpack_require__) {

var React = __webpack_require__(12);

var logger = logger || __webpack_require__(41);
var log = logger.makeLog('cout', { name: 'Login' });
var error = logger.makeLog('cout', { name: 'Login', prefix: 'ERROR' });
var { sendJSON } = __webpack_require__(73);

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
    componentDidMount: function () {
        log('login mounted');
    },
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
                if (data.status === 200) {
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
        log('rendering login');
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

/***/ 243:
/***/ function(module, exports, __webpack_require__) {

__webpack_require__(115);
module.exports = __webpack_require__(116);


/***/ },

/***/ 30:
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

/***/ 73:
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

},[243]);