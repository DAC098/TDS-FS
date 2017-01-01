// node modules
const util = require('util');
const path = require('path');
const fs = require('fs');
const URL = require('url');

// npm modules
const express = require('express');
const co = require('co');
const {wrap} = require('../middleware.js');

// app modules
const fsm = require('../fsm.js');
const {htmlBody} = require('../html.js');
const {getSalt,getHash} = require('../crypt.js');
const {getID} = require('../uid.js');
const db = require('../db.js');

// log methods
const log = logger.makeLog('cout',{name:'fs-rter'});
const error = logger.makeLog('cout',{name:'fs-rter',prefix:'ERROR'});

// ----------------------------------------------------------------------------
// variables
// ----------------------------------------------------------------------------

var router = express.Router();

// ----------------------------------------------------------------------------
// functions
// ----------------------------------------------------------------------------

function logURL(req) {
	log(`request
	url:    ${req.url}
	params: ${util.inspect(req.params)}
	query:  ${util.inspect(req.query)}`);
}

function setSession(req,doc) {
	req.session._id = doc._id;
	req.session.username = doc.username;
	req.session.root = doc.root;
}

// ----------------------------------------------------------------------------
// middle ware
// ----------------------------------------------------------------------------

router.use((req,res,next) => {
	if(settings.https.redirect && !req.secure) {

		log('redirecting to secure server');

		res.status(300).redirect(`https://${settings.https.host}:${settings.https.port}`);
	} else {
		next();
	}
});

// ----------------------------------------------------------------------------
// get methods
// ----------------------------------------------------------------------------

router.get('/',(req,res) => {
	res.status(300).redirect('/login');
});

router.get('/browse',(req,res) => {
	try {
		if(req.session.root) {
			res.status(200).send(htmlBody('Browse',{username:req.session.username}));
		} else {
			res.status(300).redirect('/login');
		}
	} catch(err) {

		error('failed to send browse page',err.message);

		res.status(500).send('server error');
	}
});

router.get('/login',(req,res) => {
	try {
		if(!req.session.root) {
			res.status(200).send(htmlBody('Login'));
		} else {
			res.status(300).redirect('/browse');
		}
	} catch(err) {

		error('failed to send login page',err.message);

		res.status(500).send('server error');
	}
});

router.get('/user/*',(req,res) => {
	res.status(300).redirect('/login');
});

router.get('/retrieve/*',wrap(function* (req,res) {
	if(req.session.root) {
		try {
			let file_path = path.join(req.session.root,req.params[0]);
			let exists = yield fsm.checkExists(true,req.session.root,req.params[0]);
			if(exists) {
				let data = yield fsm.getFile(file_path);

				log(`sending file to user
	username:	${req.session.username}`);

				res.status(200).send(data);
			} else {

				log(`unable to send file to user
	username:	${req.session.username}`);

				res.status(404).send('file not found'+req.params[0]);
			}
		} catch(err) {

			error('failed to send download',err.message);

			res.status(500).send('server error');
		}
	} else {

		log('no root for given session');

	}
}));

// ----------------------------------------------------------------------------
// post methods
// ----------------------------------------------------------------------------

router.post('/user/login',wrap(function* (req,res) {
	if(req.xhr) {
		let {username,password} = req.body;
		try {
			let doc = yield db.users.find({username}).toArray();
			if(doc = doc[0]) {
				let check = getHash(password,doc.salt);
				if(check === doc.password) {
					setSession(req,doc);

					log(`login successful
	username:	${doc.username}`);

					res.status(200).json({url:'/browse'});
				} else {

					log(`login failed
	reason:		invalid password`);

					res.status(401).json({username:true,password:false});
				}
			} else {

				log(`login failed
	reason:		unknown username`);

				res.status(400).json({username:false,password:false});
			}
		} catch(err) {

			error('failed to login user',err.message);

			res.status(500).json({msg:'unable to process login'});
		}
	} else {

		log('request is non-xhr request');

	}
}));

router.post('/user/create',wrap(function* (req,res) {
	if(req.xhr) {
		try {
			let {username,password,confirm_password} = req.body;
			let username_check = yield db.users.find({username}).toArray();
			if(username_check.length === 0) {
				if(password === confirm_password) {
					let salt = getSalt();
					let doc = {
						_id: getID(),
						username,
						password: getHash(password,salt),
						salt,
						root: settings.root
					};
					yield db.users.insert(doc);
					setSession(req,doc);

					log(`created new user
	username:	${doc.username}`);

					res.status(200).json({url:'/browse'});
				} else {

					log(`failed to create user
	reason:		inconsistent password`);

					res.status(409).json({password:false});
				}
			} else {

				log(`failed to create user
	reason:		username already exists`);

				res.status(409).json({username:false});
			}
		} catch(err) {

			error('failed to create user',err.message);

			res.status(500).json({msg:'unable to create account'});
		}
	} else {
		log('request is non-xhr');
	}
}));

router.post('/user/logout',(req,res) => {
	if(req.xhr) {
		log(`logging out user
	username:	${req.session.username}`);
		req.session.destroy();
		res.clearCookie();
		res.status(200).json({url:'/login'});
	} else {
		log('request is non-xhr request');
	}
});

// ----------------------------------------------------------------------------
// catch all
// ----------------------------------------------------------------------------

router.get('*',(req,res) => {
	res.status(404).send('not found');
});

// ----------------------------------------------------------------------------
// export
// ----------------------------------------------------------------------------

module.exports = router;
