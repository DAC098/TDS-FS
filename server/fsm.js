// node modules
const fs = require('fs');
const path = require('path');

// log methods
const log = require('./logging.js').makeLog('cout',{name:'FS'});
const error = require('./logging.js').makeLog('cout',{name:'FS',prefix:'ERROR'});

exports.retrieveFolder = function retrieveFolder(root,url) {
	//log('retrieveFolder\nroot:',root,'\nurl:',url);
	return new Promise(function(resolve,reject) {
	try {
		var rtn = [];
		var status = fs.statSync(root);
		if(status.isDirectory()) {
			var list = fs.readdirSync(root);
			for(const item of list) {
				let item_stat = fs.statSync(path.join(root,item));
				let item_url = (path.join(url,item)).replace(/\\/g,'/');
				if(item_stat.isFile() || item_stat.isDirectory()) {
					rtn.push({
						type: (item_stat.isFile()) ? 'file' : ((item_stat.isDirectory()) ? 'dir' : 'unknown'),
						name: item,
						url: item_url,
						size: item_stat.size,
						mtime: item_stat.mtime
					});
				}
			}
			rtn = rtn.sort((a,b) => {
				if(a.type === 'dir' && b.type === 'file') {
					return -1;
				} else if(a.type === 'file' && b.type === 'dir') {
					return 1;
				} else if(a.type === b.type) {
					return a.name.localeCompare(b.name,{sensitivity:'case',numeric:true});
				}
			});
			//log('return list, count:',rtn.length);
			resolve(rtn);
		} else {
			reject();
		}
	} catch(err) {
		error('retrieving directory,',path.join(root,url),':',err.message);
		reject();
	}
	});
};

exports.retrieveFile = function retrieveFile(file_path,url) {
	// log(`retrieveFile\nroot: ${file_path}\nurl: ${url}`);
	return new Promise(function(resolve,reject) {
		try {
			let stats = fs.statSync(file_path);
			if(stats.isFile()) {
				let meta = path.parse(file_path);
				resolve({
					name: meta.name,
					ext: meta.ext,
					base: meta.base,
					size: stats.size,
					birthtime: stats.birthtime,
					mtime: stats.mtime,
					download: (path.join('/retrieve',url)).replace(/\\/g,'/')
				});
			} else {
				reject();
			}
		} catch(err) {
			error('retrieving file,',file_path,':',err.message);
			reject();
		}
	});
};

exports.createFile = function createFile(dir,name,data) {
	return new Promise(function(resolve,reject) {
		let write_location = path.join(dir,name);
		//log('creating file',write_location);
		fs.writeFile(write_location,data,(err) => {
			if(err) {
				error('writing file,',write_location,':',err.message);
				reject();
			} else {
				//log('write complete for,',write_location);
				resolve();
			}
		});
	});
};

exports.getFile = function getFile(dir) {
	return new Promise(function(resolve,reject) {
		fs.readFile(dir,(err,data) => {
			if(err) {
				error('get file:',dir,':',err.message);
				reject();
			} else {
				resolve(data);
			}
		});
	});
};

exports.removeFile = function removeFile(dir) {
	return new Promise(function(resolve,reject) {
		//log('removing file',dir);
		fs.unlink(dir,(err) => {
			if(err) {
				error('removing file,',dir,':',err.message);
				reject();
			} else {
				//log('removed file',dir);
				resolve();
			}
		});
	});
};

exports.createDirectory = function createDirectory(dir) {
	return new Promise(function(resolve,reject) {
		fs.mkdir(dir,(err) => {
			if(err) {
				error('making dir,',dir,':',err.message);
				reject();
			} else {
				//log('made dir',dir);
				resolve();
			}
		});
	});
};

exports.removeDirectory = function removeDirectory(dir) {
	return new Promise(function(resolve,reject) {
		fs.rmdir(dir,(err) => {
			if(err) {
				error('removing dir:',dir,':',err.message);
				reject();
			} else {
				// log('removed dir',dir);
				resolve();
			}
		});
	});
};

function removeFilledDirectory(dir) {
	let passup = false;
	try {
		let stats = fs.statSync(dir);
		if(stats.isDirectory()) {
			let list = fs.readdirSync(dir);
			for(let item of list) {
				try {
					removeFilledDirectory(item);
				} catch(err) {
					throw err;
				}
			}
		} else if(stats.isFile()) {
			try {
				fs.unlinkSync(dir);
			} catch(err) {
				throw err;
			}
		} else {
		// handle something that is not a file or directory
		}
	} catch(err) {
		throw err;
	}
}

exports.removeFilledDirectory = function(dir) {
	return new Promise(function(resolve,reject) {
		try {
			removeFilledDirectory(dir);
			resolve();
		} catch(err) {
			error('removing non-empty dir,',dir,':',err.message);
			reject();
		}
	});
};

exports.checkIfDirNotEmpty = function checkIfDirNotEmpty(dir) {
	return new Promise(function(resolve,reject) {
		try {
			let stats = fs.statSync(dir);
			if(stats.isDirectory()) {
				fs.readdir(dir,(err,files) => {
					if(err) {
						error('reading dir,',dir,':',err.message);
						reject();
					} else {
						resolve(files.length);
					}
				});
			} else {
				reject();
			}
		} catch(err) {
			error('status of dir,',dir,':',err.message);
			reject();
		}
	});
};

exports.checkExists = function checkExists(check_file,...paths) {
	let lookup = path.join(...paths);
	let str = (check_file) ? 'file' : 'directory';
	//log('checking if',str,'exists\npath:',lookup);
	return new Promise(function(resolve,reject) {
		fs.stat(lookup,(err,stats) => {
			if(err) {
				if(err.code === 'ENOENT') {
					resolve(false);
				} else {
					error('status of',str,'- code',err.code,':',err.message);
					reject();
				}
			} else {
				resolve( (check_file && stats.isFile()) || (!check_file && stats.isDirectory()) );
			}
		});
	});
};

exports.check = function check(check_if_file,...paths) {
	let lookup_path = path.join(...paths);
	log('searching for:',lookup_path);
	log(`check_if_file: ${check_if_file}`);
	try {
		var status = fs.statSync(lookup_path);
		if(check_if_file && status.isFile()) {
			return lookup_path;
		}
		if(!check_if_file && status.isDirectory()) {
			return lookup_path;
		}
		return undefined;
	} catch(err) {
		error('status of',lookup_path,'- code:',err.code,':',err.message);
		return undefined;
	}
};
