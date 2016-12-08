const path = require('path');

const PageManager = reqRoot('lib/PageManager/index.js');

const manager = new PageManager(process.cwd());

const log = logger.makeLog('cout',{name:'pageMan'});
const error = logger.makeLog('cout',{name:'pageMan',prefix:'ERROR'});

manager.on('error',(err) => {
	error('refreshing page failed:',err);
});

manager.on('update',(name) => {
	log('page updated:',path.basename(name));
});

manager.addPage('App','./ui/containers/App.js',[
	'./ui/components/DirContents.js',
	'./ui/components/FileContents.js',
	'./ui/components/ItemInfo.js',
	'./ui/components/NavBar.js',
	'./ui/components/UploadBar.js'
]);

manager.addPage('Login','./ui/containers/Login.js');

module.exports = manager;
