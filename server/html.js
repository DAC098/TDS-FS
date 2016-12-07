const npath = require('path');

const React = require('react');
const {renderToString} = require('react-dom/server');

const log = require('./logging.js').makeLog('cout',{name:'html'});
const manager = require('./pageMan.js');

manager.on('update',(name) => {
	log('page updated:',npath.basename(name));
});

exports.htmlBody = function htmlBody(page,render = {}) {
	let element = null;
	let script = '';
	let title = '';
	let username = (render.username) ? ' - '+render.username : '';
	let obj = {};

	switch (page) {
		case 'fs':
			element = manager.getPage('App');
			script = 'fs.js';
			title = 'browse';
			if('content' in render) {
				console.log('here');
				obj.dir = render.content.dir;
			}
			break;
		case 'login':
			element = manager.getPage('Login');
			script = 'login.js';
			title = 'login';
			break;
		default:
	}

    return `
<!doctype html>
<html>
	<head>
		<title>TDS CDN${username} - ${title}</title>
		<meta charset="utf-8">
		<meta name="description" content="cdn for TDS">
		<meta name="author" content="David A Cathers">
		<meta name="keywords" content="cdn,TDS,David Cathers,David C,DAC098,dac098,o98dac">
		<link rel="stylesheet" type='text/css' href="/assets/style/main.css">
	</head>
	<body>
		<div id="render">${renderToString(React.createElement(element,obj))}</div>
		<script src='/assets/scripts/ui.vender.js'></script>
		<script src="/assets/scripts/${script}"></script>
	</body>
</html>`;
};
