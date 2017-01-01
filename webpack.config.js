const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

var root = process.cwd();
var client = root + '/client';
var vendor_srcs = {};

function p(...args) {
	return path.join.apply(null,args);
}

function getType(variable) {
	return Object.prototype.toString.call(variable).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

function addMod(mod,count) {
	// console.log('---------------------------------------------------------------');
	// console.log('mod:',mod.context,'\ncount:',count,'\nchunks:',mod.chunks);
	// console.log('---------------------------------------------------------------');
	vendor_srcs[mod.context] = true;
}

function runCheck(mod) {
	var val = !(mod.context in vendor_srcs);
	console.log('check:',val,'\nfor:',mod.context);
	return val;
}

var log_one = false;
var log_two = false;
var module_issuers = {};
var vndr_files = {};

function moduleData(task_name,module) {
	let {userRequest} = module;

	if(typeof userRequest != 'string')
		return false;

	if(!log_one) {
		// console.log('module:',module);
		log_one = true;
	}

	var MMod = module.issuer;
	var Chunks = module.chunks;
	var issuer_name = 'none';
	var in_vndr = false;
	var chunks_calling = [];

	for(let chunk of Chunks) {
		if(chunk.name.indexOf('vndr') >= 0) {
			in_vndr = true;
			break;
		}
	}

	for(let chunk of Chunks) {
		chunks_calling.push(chunk.name);
	}

	var previous = null;
	var loop_count = 0;

	try {
		issuer_name = MMod.name;
		while(getType(issuer_name) == 'undefined') {
			previous = MMod;
			MMod = MMod.issuer;
			issuer_name = MMod.name;
			++loop_count;
		}
	} catch(err) {
		// console.log('loop_count:',loop_count);
		// console.log('error when getting issuer name:',err);
		issuer_name = [];
		if(previous === null) {
			for(let chunk of Chunks) {
				issuer_name.push(chunk.name);
			}
		} else {
			let mod_chunks = previous.chunks;
			for(let chunk of mod_chunks) {
				issuer_name.push(chunk.name);
			}
		}
		issuer_name = issuer_name.length == 1 ? issuer_name[0] : issuer_name;
		// console.log('\tprevious:',previous ? previous : module);
	}

	// console.log('task name:',task_name,'vender:',in_vndr,'issuer:',issuer_name,'chunks:',chunks_calling,'file:',userRequest);

	let res = {
		external: userRequest.indexOf('node_modules') >= 0,
		in_vndr,
		issuer_name,
		chunks_calling
	};
	return res;
}

var page_list = fs.readdirSync(p(client,'pages'));
var list_found = ['ctrl.main'];
var pages = [];

for(let page_entry of page_list) {
	let file = path.parse(page_entry);
	list_found.push(file.name);
	pages.push(p(client,'pages',page_entry));
}

var entry = {
	'ui.vndr': ['react','react-dom','classnames'],
	'soc.vndr': ['socket.io-client'],
	'ctrl.main': p(client,'Controller.js'),
	'pages.main': pages
};
var output = {
	path: p(root,'assets','scripts'),
	filename: '[name].js',
	chunkFilename: '[id].[name].chunk.js'
};
var plugins = [
	new webpack.optimize.CommonsChunkPlugin({
		name: 'init',
		filename: 'init.js'
	}),
	new webpack.optimize.CommonsChunkPlugin({
		name: 'ui.vndr',
		chunks: ['ctrl.main','pages.main'],
		minChunks: function(module,count) {
			let res = moduleData('ui',module);
			return res.external && res.issuer_name.indexOf('vndr') >= 0 && res.issuer_name == 'ui.vndr';
		}
	}),
	new webpack.optimize.CommonsChunkPlugin({
		name: 'soc.vndr',
		chunks: ['ctrl.main','pages.main'],
		minChunks: function(module,count) {
			let res = moduleData('soc',module);
			return res.external && res.issuer_name.indexOf('vndr') >= 0 && res.issuer_name == 'soc.vndr';
		}
	}),
	new webpack.optimize.CommonsChunkPlugin({
		name: 'common',
		chunks: Object.keys(entry),
		minChunks: function(module,count) {
			let res = moduleData('common',module);
			return !res.external && count >= 2 && !res.in_vndr;
		}
	}),
	new webpack.optimize.CommonsChunkPlugin({
		name: 'pages.main',
		chunks: ['pages.main'],
		minChunks: Infinity
	})
];

module.exports = {
	entry,
	output,
	plugins,
	watch: true,
	watchOptions: {
		aggregateTimeout: 750
	}
};
