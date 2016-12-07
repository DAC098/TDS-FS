const npath = require('path');

const gulp = require('gulp');
const pump = require('pump');
const webpack = require('webpack');
const webStream = require('webpack-stream');

const gutil = require('gulp-util');
const babel = require('gulp-babel');
const less = require('gulp-less');
const watch = require('gulp-watch');

const chokidar = require('chokidar');

const config = require('./webpack.config.js');

const dir = {
	react: {
		src: './build/react/**/*.js',
		out: './ui'
	},
	less: {
		src: './build/less/main.less',
		imp: './build/less/imports/**/*.less',
		out: './assets/style'
	}
};

var red = gutil.colors.red;
var grn = gutil.colors.green;

function handleStream(name,error,...args) {
	if(error) {
		args.unshift(`${red('ERROR')}:     ${name} -> ${error.message}\n`,error.stack);
	} else {
		args.unshift(`${grn('COMPLETED')}: ${name}`);
	}
	gutil.log.apply(null,args);
}

function logStart(name,...args) {
	args.unshift(`${grn('STARTING')}:  ${name}`);
	gutil.log.apply(null,args);
}

function buildReact() {
	logStart('React');
	pump([
		gulp.src(dir.react.src),
		babel({
			presets: ['react']
		}),
		gulp.dest(dir.react.out)
	],(err) => {
		handleStream('React',err);
		// buildBundle();
	});
}

function buildLess() {
	logStart('Less');
	pump([
		gulp.src(dir.less.src),
		less({
			paths: dir.less.imp
		}),
		gulp.dest(dir.less.out)
	],(err) => handleStream('Less',err));
}

function buildBundle() {
	logStart('Webpack');
	webpack(config,(err,stats) => {
		if(err) gutil.log(`${red('BUNDLE ERROR')}:     Webpack -> ${err.message}`);
		else gutil.log(`${grn('BUNDLE RESULTS')}:   \n${stats.toString({
			assets: true,
			assetsSort: 'field',
			cached:false,
			children:false,
			chunks:false,
			colors:true
		})}`);
	});
}

gulp.task('react',() => {
	buildReact();
});

gulp.task('less',() => {
	buildLess();
});

gulp.task('build-bundle',() => {
	buildBundle();
});

gulp.task('watch-less',() => {
	return watch([dir.less.src,dir.less.imp],() => buildLess());
});

gulp.task('watch-react',() => {

	var watcher = chokidar.watch('glob');

	var root = process.cwd();

	watcher.add(dir.react.src);

	watcher.on('change',(path) => {
		// path = npath.join(root,path);
		var dir_out = path.replace('build\\react','ui');
		logStart('React','->',npath.basename(path));
		pump([
			gulp.src(path),
			babel({presets:['react']}),
			gulp.dest(npath.dirname(dir_out))
		],(err) => handleStream('React',err,'->',npath.basename(path)));
	});
});

gulp.task('default',['react','less','watch-less','watch-react','build-bundle']);
