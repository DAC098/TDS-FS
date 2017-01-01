var log = require('./CLogs.js').makeLog('cout',{name:'window'});
var error = require('./CLogs.js').makeLog('cout',{name:'window',prefix:'ERROR'});

var client = typeof window !== 'undefined';

if(client) {
	window.onerror = (msg,src,line,col,err) => {
		log('firring window error');
		if(err) {
			error('\nmsg:',msg,'\nsrc:',src,'\nline:',line,'\ncol:',col,'\nerr:',err);
		}
		return true;
	};
}
