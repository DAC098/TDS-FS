const PageManager = require('./PageManager/index.js');

const manager = new PageManager(process.cwd());

manager.addPage('App','./ui/containers/App.js',[
	'./ui/components/DirContents.js',
	'./ui/components/FileContents.js',
	'./ui/components/ItemInfo.js',
	'./ui/components/NavBar.js',
	'./ui/components/UploadBar.js'
]);

manager.addPage('Login','./ui/containers/Login.js');

// manager.addPage('test','./ui/components/NavBar.js');

module.exports = manager;
