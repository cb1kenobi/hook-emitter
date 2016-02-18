'use strict';

const $ = require('gulp-load-plugins')();
const del = require('del');
const gulp = require('gulp');
const path = require('path');

const coverageDir = path.join(__dirname, 'coverage');
const distDir = path.join(__dirname, 'dist');

/*
 * Clean tasks
 */
gulp.task('clean', ['clean-build', 'clean-coverage']);

gulp.task('clean-build', function (done) {
	del([distDir]).then(function () { done(); });
});

gulp.task('clean-coverage', function (done) {
	del([coverageDir]).then(function () { done(); });
});

/*
 * build tasks
 */
gulp.task('build', ['clean-build', 'lint-src'], function () {
	return gulp
		.src('src/**/*.js')
		.pipe($.plumber())
		.pipe($.debug({ title: 'build' }))
		.pipe($.sourcemaps.init())
		.pipe($.babel())
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest(distDir));
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
		.pipe($.debug({ title: 'test' }))
		.pipe($.sourcemaps.init())
		.pipe($.babel())
		.pipe($.sourcemaps.write('.'))
		.pipe($.injectModules())
		.pipe($.filter('**/*.js'))
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
				.pipe($.babelIstanbul.enforceThresholds({ thresholds: { global: 90 } }))
				.on('end', cb);
		});
});

gulp.task('default', ['build']);
