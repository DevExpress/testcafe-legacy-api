var gulp      = require('gulp');
var gulpBabel = require('gulp-babel');
var eslint    = require('gulp-eslint');
var mocha     = require('gulp-mocha');
var ll        = require('gulp-ll');
var publish   = require('publish-please');
var del       = require('del');

ll.tasks('lint');


gulp.task('clean', function (cb) {
    del('lib', cb);
});

// Lint
gulp.task('lint', function () {
    return gulp
        .src([
            'src/**/*.js',
            'test/**/**.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


// Build
gulp.task('build', ['clean', 'lint'], function () {
    return gulp
        .src('src/**/*.js')
        .pipe(gulpBabel())
        .pipe(gulp.dest('lib'));
});


// Test
gulp.task('test-server', ['build'], function () {
    return gulp
        .src('test/server/*-test.js')
        .pipe(mocha({
            ui:       'bdd',
            reporter: 'spec',
            timeout:  typeof v8debug === 'undefined' ? 2000 : Infinity // NOTE: disable timeouts in debug
        }));
});

// Publish
gulp.task('publish', ['test-server'], function () {
    return publish();
});
