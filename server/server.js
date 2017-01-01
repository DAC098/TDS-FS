// node modules
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// npm modules
const express = require('express');
const bodyParser = require('body-parser');

// app modules
const {cookieParser,session} = require('./session.js');
const router = require('./routers/fs.js');
const socket = require('./sockets/main.js');
const crypt = require('./crypt.js');

// log methods
const log = logger.makeLog('cout',{name:'server'});
const error = logger.makeLog('cout',{name:'server',prefix:'ERROR'});

function Server() {

	const self = this;

	const root = process.cwd();

	var http_server = null;

	var http_started = false;

	var https_server = null;

	var https_started = false;

	var servers = {
		http: {
			link: null,
			started: false
		},
		https: {
			link: null,
			started: false
		}
	};

	function _setApp() {
		var app = express();
		app.use(cookieParser);
		app.use(session);
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended:true}));

		app.use('/assets',express.static(path.join(root,'assets')));
		app.use('/',router);

		return app;
	}

	function _setListener(name,server,opt) {
		server.listen(opt.port,opt.host,opt.backlog,() => {
			socket.attach(server);
			servers[name].started = true;

			logger.tStop(name+'_server_startup');
			logger.tStop(name+'_server_startup');
			log(`${name} server info
	host: ${opt.host}
	port: ${opt.port}
	startup time: ${logger.tResults(name+'_server_startup')}`);
			logger.tClear(name+'_server_startup');
		});
	}

	this.startHTTP = function startHTTP() {
		try {
			logger.tStart('http_server_startup');

			let opt = settings.http;

			servers.http.link = http.createServer(_setApp());

			_setListener('http',servers.http.link,opt);

		} catch(err) {
			error('http server failed to start:',err.message);
			logger.tStop('http_server_startup');
			logger.tClear('http_server_startup');
		}
	};

	this.startHTTPS = function startHTTPS() {
		try {
			logger.tStart('https_server_startup');

			let opt = settings.https;

			servers.https.link = https.createServer(crypt.getSSLData(),_setApp());

			_setListener('https',servers.https.link,opt);

		} catch(err) {
			error('https server failed to start:',err.message);
			logger.tStop('https_server_startup');
			logger.tClear('https_server_startup');
		}
	};

	this.closeServer = function closeServer(name) {
		if(servers[name].started)
			servers[name].close();
		else
			error(`${name} server is not started`);
	};

};

module.exports.Server = Server;
module.exports = function() {
	return new Server();
};
