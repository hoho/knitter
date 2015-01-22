'use strict';

var gulp = require('gulp');

var eslint = require('gulp-eslint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var prefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

var through = require('through');


gulp.task('eslint', function() {
    return gulp.src(['gulpfile.js', 'src/knitter.js'])
        .pipe(eslint({
            rules: {
                'quotes': [2, 'single'],
                'no-shadow-restricted-names': 0,
                'no-underscore-dangle': 0,
                'no-use-before-define': 0
            },
            env: {
                'node': true,
                'browser': true
            }
        }))
        .pipe(eslint.format());
});


gulp.task('build', function() {
    var retStream = through();
    var css;
    var js;

    gulp.src('src/knitter.css')
        .pipe(prefix('last 1 version', '> 1%'))
        .pipe(minifyCSS())
        .on('data', function(data) { css = data.contents.toString().replace(/(\\|')/g, '\\$1').split('\n').join('\\n'); })
        .on('end', function() { checkEnd(); });

    gulp.src('src/knitter.js')
        .on('data', function(data) { js = data; })
        .on('end', function() { checkEnd(); });

    return retStream
        .pipe(gulp.dest('.'));

    function checkEnd() {
        if (css && js) {
            js.contents = new Buffer(js.contents.toString().replace(/<%= knittercss %>/, css));
            retStream.emit('data', js);
            retStream.emit('end');
        }
    }
});


gulp.task('uglify', ['build'], function() {
    return gulp.src('knitter.js')
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(rename('knitter.min.js'))
        .pipe(gulp.dest('.'));
});


gulp.task('assert-version', function(err) {
    var assertVersion = require('assert-version');

    err(assertVersion({
        'src/knitter.js': '',
        'bower.json': ''
    }));
});


gulp.task('default', ['eslint', 'assert-version', 'build', 'uglify']);
