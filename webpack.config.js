const webpack = require('webpack');
const path = require('path');

var root = process.cwd();
var client = root + '/client';

function p(...args) {
	return path.join.apply(null,args);
}

module.exports = {
	entry: {
		fs: p(client,'fs.js'),
		login: p(client,'login.js'),
		'ui.vender': ['react','react-dom','classnames']
	},
	output: {
		path: p(root,'assets','scripts'),
		filename: '[name].js',
		chunkFilename: '[id].[name].chunk.js'
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: ['ui.vender'],
			minChunks: Infinity
		})
	],
	watch:true,
	watchOptions: {
		aggregateTimeout: 500
	}
};
