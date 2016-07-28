var fs        = require('fs');
var path      = require('path');
var babel     = require('babel-core');
var del       = require('del');
var gulp      = require('gulp');
var gulpBabel = require('gulp-babel');
var gulpif    = require('gulp-if');
var eslint    = require('gulp-eslint');
var mocha     = require('gulp-mocha');
var mustache  = require('gulp-mustache');
var ll        = require('gulp-ll');
var rename    = require('gulp-rename');
var webmake   = require('gulp-webmake');
var uglify    = require('gulp-uglify');
var util      = require('gulp-util');


ll.tasks('lint');


gulp.task('clean', function (cb) {
    del('lib', cb);
});

// Lint
gulp.task('lint', function () {
    return gulp
        .src([
            'src/**/*.js',
            '!src/client/**/*.js',
            'test/**/**.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


// Build
gulp.task('templates', ['clean'], function () {
    return gulp
        .src([
            'src/**/*.mustache',
            '!src/**/*.js.wrapper.mustache'
        ])
        .pipe(gulp.dest('lib'));
});

gulp.task('server-scripts', ['clean'], function () {
    return gulp
        .src(['src/**/*.js', '!src/client/**/*.js'])
        .pipe(gulpBabel())
        .pipe(gulp.dest('lib'));
});

gulp.task('client-scripts-bundle', ['clean'], function () {
    return gulp
        .src(['src/client/index.js'], { base: 'src' })
        .pipe(webmake({
            sourceMap: false,
            transform: function (filename, code) {
                var transformed = babel.transform(code, {
                    sourceMap: false,
                    ast:       false,
                    filename:  filename,

                    // NOTE: force usage of client .babelrc for all
                    // files, regardless of their location
                    babelrc: false,
                    extends: path.join(__dirname, './src/client/.babelrc')
                });

                // HACK: babel-plugin-transform-es2015-modules-commonjs forces
                // 'use strict' insertion. We need to remove it manually because
                // of https://github.com/DevExpress/testcafe/issues/258
                return { code: transformed.code.replace(/^('|")use strict('|");?/, '') };
            }
        }))
        .pipe(gulp.dest('lib'));
});

gulp.task('client-scripts', ['client-scripts-bundle'], function () {
    var script = { wrapper: 'src/client/index.js.wrapper.mustache', src: 'lib/client/index.js' };

    return gulp
        .src(script.wrapper)
        .pipe(mustache({ source: fs.readFileSync(script.src).toString() }))
        .pipe(rename(path.basename(script.src)))
        .pipe(gulpif(!util.env.dev, uglify()))
        .pipe(gulp.dest(path.dirname(script.src)));
});

gulp.task('build', ['server-scripts', 'client-scripts', 'templates', 'lint']);


// Test
gulp.task('test', ['build'], function () {
    return gulp
        .src('test/server/*-test.js')
        .pipe(mocha({
            ui:       'bdd',
            reporter: 'spec',
            timeout:  typeof v8debug === 'undefined' ? 2000 : Infinity // NOTE: disable timeouts in debug
        }));
});
