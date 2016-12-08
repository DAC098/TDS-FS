var React = require('react');

var { sendJSON } = require('../../client/xhr.js');
var socket = require('../../client/socket.js');
var store = require('../../client/Store.js');
var { joinPath, splitPath } = require('../../lib/misc.js');

var logger = require('../../client/CLogs.js');
var log = logger.makeLog({ name: 'App' });
var error = logger.makeLog({ name: 'App', prefix: 'ERROR' });

var DirContents = require('../components/DirContents.js');
var FileContents = require('../components/FileContents.js');
var NavBar = require('../components/NavBar.js');
var ItemInfo = require('../components/ItemInfo.js');
var UploadBar = require('../components/UploadBar.js');

var is_client = typeof window !== 'undefined';

var App = React.createClass({
	displayName: 'App',

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
			case 'server':
				if (response.type == 'page-update' && response.data.page == 'App.js') {
					log('refreshing page');
					window.location.reload(true);
				}
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
			{ className: 'grid' },
			React.createElement(
				'header',
				{ id: 'tool-area', className: 'grid' },
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
			React.createElement('div', { id: 'header-pad', className: 'row' }),
			React.createElement(
				'section',
				{ id: 'content-area', className: 'row scroll-area' },
				view
			)
		);
	}
});

module.exports = App;