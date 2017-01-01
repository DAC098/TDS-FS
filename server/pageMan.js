const path = require('path');

const chokidar = require('chokidar');

const PageManager = reqLib('PageManager');

const watcher = chokidar.watch('dir');

const manager = new PageManager(process.cwd());

const log = logger.makeLog('cout',{name:'pageMan'});
const error = logger.makeLog('cout',{name:'pageMan',prefix:'ERROR'});

manager.on('error',(err) => {
	error('refreshing page failed:',err);
});

manager.on('update',(name) => {
	log('page updated:',path.basename(name));
});

manager.addPage('Browse','./ui/containers/Browse.js',[
	'./ui/components/DirContents.js',
	'./ui/components/FileContents.js',
	'./ui/components/ItemInfo.js',
	'./ui/components/NavBar.js',
	'./ui/components/UploadBar.js'
]);

manager.addPage('Login','./ui/containers/Login.js');

module.exports = manager;

watcher.add(path.join(process.cwd(),'assets','style'));

module.exports.styleWatcher = watcher;
