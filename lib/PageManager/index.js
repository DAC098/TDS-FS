const events = require('events');
const npath = require('path');
const util = require('util');
// const {setTimeout,clearTimeout} = require('timers');

const chokidar = require('chokidar');

function getType(variable) {
	return Object.prototype.toString.call(variable).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

function checkType(variable,...types) {
	let var_curr = getType(variable);
	for(let check of types) {
		if(check === var_curr) {
			return true;
		}
	}
	return false;
}

function PageManager(given_path) {

	events.call(this);
	PageManager.prototype.__proto__ = events.prototype;

	const self = this;

	const ref_path = npath.isAbsolute(given_path) ? given_path : npath.join(process.cwd(),given_path);

	var pages = {};

	var page_deps = {};

	var page_index = {};

	var queue = [];

	var ag_time = 1000;

	var timeouts = {};

	var watcher_ready = false;

	const NAME_EXISTS = 'the given page name already exist';
	const NAME_NOT_EXISTS = 'the given page name does not exist';
	const NAME_TYPE_INVALID = 'name must be of type string';
	const REQUIRE_PATH_TYPE_INVALID = 'require_path must be of type string';
	const WATCH_PATH_TYPE_INVALID = 'watch_path must be of type string or an array';

	const PAGE_TYPE = {
		PARENT: 'PARENT',
		CHILD: 'CHILD',
		BOTH: 'BOTH'
	};

	const watcher = chokidar.watch('file, dir');

	watcher.on('add',path => {
		// console.log(`event: add, file: ${path}`);
	});

	watcher.on('change',path => {
		// console.log(`event: change, file: ${path}`);
		var ref = page_deps[path];
		// console.log(path,'info:',ref);
		if(!(path in timeouts)) {
			for(let parents of ref.refs) {
				++pages[parents].dep;
			}
			timeouts[path] = setTimeout(propagateUpdates,ag_time,path);
		} else {
			clearTimeout(timeouts[path]);
			timeouts[path] = setTimeout(propagateUpdates,ag_time,path);
		}
	});

	watcher.on('unlink',path => {
		// console.log(`event: unlink, file: ${path}`);
	});

	watcher.on('error',error => console.log(`ERROR: ${error}`));

	watcher.on('ready',() => {
		// console.log('watcher ready');
		watcher_ready = true;
		checkQueue();
	});

	function propagateUpdates(key) {
		let ref = page_deps[key];
		// console.log(key,'updating');
		switch (ref.type) {
			case PAGE_TYPE.CHILD:
				updatePageDep(key,ref);
				break;
			case PAGE_TYPE.BOTH:
				updatePageDep(key,ref);
				updatePage(key);
				break;
			default:
				updatePage(key);
		}
		delete timeouts[key];
	}

	function checkQueue() {
		if(queue.length > 0) {
			for(let item of queue) {
				addPageWatcher(item.name,item.require_path,item.watch_path);
			}
			queue = [];
		}
	}

	function refreshRequire(path,return_val) {
		delete require.cache[path];
		try {
			if(return_val) {
				return require(path);
			} else {
				require(path);
				return true;
			}
		} catch(err) {
			self.emit('error',err);
			return false;
		}
	}

	function updatePageDep(path,ref) {
		if(refreshRequire(path)) {
			for(let parent of ref.refs) {
				--pages[parent].dep;
				// console.log('refreshing page for',parent,'from',path);
				updatePage(parent);
			}
		}
	}

	function updatePage(key) {
		// console.log(key,'deps:',pages[key].dep);
		if(pages[key].dep == 0) {
			let update = refreshRequire(key,true);
			pages[key].req = update ? update : pages[key].req;
			if(update) {
				self.emit('update',key);
			}
		}
	}

	function addPageWatcher(name,require_path,watch_path) {
		if(name in pages) throw new Error(NAME_EXISTS);
		if(!checkType(name,'string')) throw new TypeError(NAME_TYPE_INVALID);
		if(!checkType(require_path,'string')) throw new TypeError(REQUIRE_PATH_TYPE_INVALID);
		if(!checkType(watch_path,'string','array','undefined')) throw new TypeError(WATCH_PATH_TYPE_INVALID);

		let watch_list = [];

		let require_data = {};

		require_path = npath.join(ref_path,require_path);

		try {
			require_data = require(require_path);
		} catch(err) {
			self.emit('error',err);
		}

		pages[require_path] = {
			req: require_data,
			dep: 0
		};

		page_index[name] = require_path;

		let exists = require_path in page_deps && page_deps[require_path].type == PAGE_TYPE.CHILD;

		page_deps[require_path] = {
			type: exists ? PAGE_TYPE.BOTH : PAGE_TYPE.PARENT,
			refs: exists ? page_deps[require_path].refs : []
		};

		watch_list.push(require_path);

		if(getType(watch_path) == 'array') {

			for(let str of watch_path) {

				let full_path = npath.join(ref_path,str);

				if(full_path in page_deps) {

					page_deps[full_path].refs.push(require_path);

				} else {

					page_deps[full_path] = {
						type: PAGE_TYPE.CHILD,
						refs: [require_path]
					};
					watch_list.push(full_path);

				}
			}

		} else if(getType(watch_path) == 'string'){

			let full_path = npath.join(ref_path,watch_path);

			if(full_path in page_deps) {

				page_deps[full_path].refs.push(require_path);

			} else {

				page_deps[full_path] = {
					type: PAGE_TYPE.CHILD,
					refs: [require_path]
				};
				watch_list.push(full_path);

			}
		}

		watcher.add(watch_list);
		// console.log('pages:',pages);
		// console.log('page_deps:',page_deps);
		// console.log('page_index:',page_index);
	}

	this.addPage = function addPage(name,require_path,watch_path) {
		if(watcher_ready) {
			addPageWatcher(name,require_path,watch_path);
		} else {
			queue.push({name,require_path,watch_path});
		}
	};

	this.getPage = function getPage(name) {
		if(!(name in page_index)) throw new Error(NAME_NOT_EXISTS);
		return pages[page_index[name]].req;
	};

}

module.exports = PageManager;
