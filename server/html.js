const npath = require('path');
const fs = require('fs');

const React = require('react');
const {renderToString} = require('react-dom/server');

const manager = require('./pageMan.js');

const log = logger.makeLog('cout',{name:'html'});
const error = logger.makeLog('cout',{name:'html',prefix:'ERROR'});

var non_page_scripts = '';
var list = fs.readdirSync(npath.join(process.cwd(),'assets','scripts'));
for(var file of list) {
	if(!file.includes('page') && !(file.includes('init') || file.includes('main'))) {
		non_page_scripts += `<script src='/assets/scripts/${file}'></script>\n`;
	}
}

exports.htmlBody = function htmlBody(page,render = {}) {
	let element = null;
	let script = '';
	let title = '';
	let username = (render.username) ? ' - '+render.username : '';
	let obj = {};

	element = manager.getPage(page);
	script = page.toLowerCase()+'.page.js';
	title = page;

	return `
<!doctype html>
<html>
	<head>
		<title>TDS CDN${username} - ${title}</title>
		<meta charset="utf-8">
		<meta name="description" content="cdn for TDS">
		<meta name="author" content="David A Cathers">
		<meta name="keywords" content="cdn,TDS,David Cathers,David C,DAC098,dac098,o98dac">
		<link id='ss-main' rel="stylesheet" type='text/css' href="/assets/style/main.css">
		<script src='/assets/scripts/init.js'></script>
		${non_page_scripts}
	</head>
	<body>
		<script src="/assets/scripts/pages.main.js"></script>
		<script src="/assets/scripts/ctrl.main.js" defer></script>
		<div id="render">${renderToString(React.createElement(element,render))}</div>
	</body>
</html>`;
};

//
//
