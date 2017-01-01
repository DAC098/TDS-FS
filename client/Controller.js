var events = require('events');
var {basename} = require('path');

var React = require('react');
var {render} = require('react-dom');

var pathReg = require('path-to-regexp');

function Controller() {

	var self = this;

	var logger = require('./CLogs.js');
	var log = logger.makeLog('cout',{name:'ctrl'});
	var error = logger.makeLog('cout',{name:'ctrl',prefix:'ERROR'});

	log('starting controller');

	log('location:',window.location);

	var ser_soc = require('./CSocket.js')('svr',{log,error});

	var ren_tar = document.getElementById('render');

	var doc_body = document.getElementsByTagName('body')[0];

	var pages = {};

	function fetchPages() {
		for(let key in __webpack_require__.c) {
			let tmp = __webpack_require__(key);

			if(tmp && tmp.site_page && !(tmp.name in pages)) {
				log('key found:',key);
				let keys = [];
				let test = pathReg(tmp.route);
				tmp.route = {test,keys};
				log('tmp:',tmp);
				pages[tmp.name] = tmp;
			}
		}
		log('pages found:',pages);
		log('checking current route');
		for(let pg in pages) {
			let result = pages[pg].route.test.exec(window.location.pathname);
			if(result) {
				log('rendering:',pages[pg].element.filename);
				render(React.createElement(pages[pg].element.req),ren_tar);
			}
		}
	}

	function handleUpdate(res) {
		log('update from server:',res);
		switch (res.type) {
			case 'asset-update':
				switch (res.data.type) {
					case 'js':
						log('searching for script');
						for(let pg in pages) {
							if(pages[pg].element.filename == res.data.name) {
								log('found page:',pages[pg]);
								let scripts = document.getElementsByTagName('script');
								let found = false;
								let sc_update = document.createElement('script');
								sc_update.src = window.location.origin+'/assets/scripts/'+pages[pg].script;
								sc_update.async = true;
								sc_update.onload = function() {
									fetchPages();
								};
								log('current scripts:',scripts);
								for(let sc of scripts) {
									let source = sc.src.replace(window.location.origin,'');
									log('script.src:',source);
									if(source.includes(pages[pg].script)) {
										log('found script:',sc);
										found = true;
										doc_body.removeChild(sc);
										doc_body.appendChild(sc_update);
										break;
									}
								}
								if(!found)
									log('script not found');
								break;
							}
						}
						break;
					case 'stylesheet':
						log('refreshing stylesheet:',res.data.name);
						var ss_name = res.data.name.split('.')[0];
						var ss = document.getElementsByTagName('link');
						for(let link of ss) {
							let link_url = '/assets/style/'+res.data.name;
							if(link.href == '/assets/style/'+res.data.name)
								link.href = link_url;
						}
						break;
				}
				break;
			default:
		}
	}

	ser_soc.on('update',handleUpdate);

	fetchPages();

};

var main = null;

window.onload = function() {
	console.log('window has loaded');
	main = new Controller();
};

module.exports = main;
