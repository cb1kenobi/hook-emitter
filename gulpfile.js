'use strict';

const $ = require('gulp-load-plugins')();
const del = require('del');
const gulp = require('gulp');
const manifest = require('./package.json');
const path = require('path');

const coverageDir = path.join(__dirname, 'coverage');
const distDir = path.join(__dirname, 'dist');
const docsDir = path.join(__dirname, 'docs');

/*
 * Clean tasks
 */
gulp.task('clean', ['clean-coverage', 'clean-dist', 'clean-docs']);

gulp.task('clean-coverage', function (done) {
	del([coverageDir]).then(function () { done(); });
});

gulp.task('clean-dist', function (done) {
    del([distDir]).then(function () { done(); });
});

gulp.task('clean-docs', function (done) {
    del([docsDir]).then(function () { done(); });
});

/*
 * build tasks
 */
gulp.task('build', ['clean-dist', 'lint-src'], function () {
	return gulp
		.src('src/**/*.js')
		.pipe($.plumber())
		.pipe($.debug({ title: 'build' }))
		.pipe($.sourcemaps.init())
		.pipe($.babel())
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest(distDir));
});

gulp.task('docs', ['lint-src', 'clean-docs'], function () {
	return gulp.src('src')
		.pipe($.plumber())
		.pipe($.debug({ title: 'docs' }))
		.pipe($.esdoc({
			// debug: true,
			destination: docsDir,
			plugins: [
				{ name: 'esdoc-es7-plugin' }
			],
			title: manifest.name
		}));
});

/*
 * lint tasks
 */
function lint(pattern) {
	return gulp.src(pattern)
		.pipe($.plumber())
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe($.eslint.failAfterError());
}

gulp.task('lint-src', function () {
	return lint('src/**/*.js');
});

gulp.task('lint-test', function () {
	return lint('test/**/test-*.js');
});

/*
 * test tasks
 */
gulp.task('test', ['lint-src', 'lint-test'], function () {
	return gulp.src(['src/**/*.js', 'test/**/*.js'])
		.pipe($.plumber())
		.pipe($.debug({ title: 'build' }))
		.pipe($.babel())
		.pipe($.injectModules())
		.pipe($.filter('test/**/*.js'))
		.pipe($.debug({ title: 'test' }))
		.pipe($.mocha());
});

gulp.task('coverage', ['lint-src', 'lint-test', 'clean-coverage'], function (cb) {
	gulp.src('src/**/*.js')
		.pipe($.plumber())
		.pipe($.debug({ title: 'build' }))
		.pipe($.babelIstanbul())
		.pipe($.injectModules())
		.on('finish', function () {
			gulp.src('test/**/*.js')
				.pipe($.plumber())
				.pipe($.debug({ title: 'test' }))
				.pipe($.babel())
				.pipe($.injectModules())
				.pipe($.mocha())
				.pipe($.babelIstanbul.writeReports())
				.on('end', cb);
		});
});

gulp.task('default', ['build']);
