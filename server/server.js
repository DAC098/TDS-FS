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
const {connect} = require('./socket.js');
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

	var app = express();

	app.use(cookieParser);
	app.use(session);
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended:true}));

	app.use('/assets',express.static(path.join(root,'assets')));
	app.use('/',router);

	this.startHTTP = function startHTTP() {
		try {
			logger.tStart('http_server_start');

			let opt = settings.http;

			http_server = http.createServer(app).listen(opt.port,opt.host,opt.backlog,() => {
				connect(http_server);
				http_started = true;

				logger.tStop('http_server_start');
				log(`http server info
	host: ${opt.host}
	port: ${opt.port}
	startup time: ${logger.tResults('http_server_start')}`);
				logger.tClear('http_server_start');
			});
		} catch(err) {
			error('http server failed to start:',err.message);
			logger.tStop('http_server_start');
			logger.tClear('http_server_start');
		}
	};

	this.startHTTPS = function startHTTPS() {
		try {
			logger.tStart('https_server_start');

			let opt = settings.https;

			https_server = https.createServer(crypt.getSSLData(),app).listen(opt.port,opt.host,opt.backlog,() => {
				connect(https_server);
				https_started = true;

				logger.tStop('https_server_start');
				log(`https server info
	host: ${opt.host}
	port: ${opt.port}
	startup time: ${logger.tResults('https_server_start')}`);
				logger.tClear('https_server_start');
			});

		} catch(err) {
			error('https server failed to start:',err.message);
			logger.tStop('https_server_start');
			logger.tClear('https_server_start');
		}
	};

	this.closeHTTP = function closeHTTP() {
		if(http_started) {
			http_server.close();
		} else {
			error('http server is not started');
		}
	};

	this.closeHTTPS = function closeHTTPS() {
		if(https_started) {
			https_server.close();
		} else {
			error('https server is not started');
		}
	};

	Object.defineProperties(self,{
		'http_started': {
			get: function() {
				return http_started;
			},
			set: function() {}
		},
		'https_started': {
			get: function() {
				return https_started;
			},
			set: function() {}
		}
	});

};

const main_server = new Server();

main_server.startHTTP();
main_server.startHTTPS();

module.exports = main_server;
