const fs        = require('fs');
const path      = require('path');
const babel     = require('babel-core');
const del       = require('del');
const gulp      = require('gulp');
const gulpStep  = require('gulp-step');
const gulpBabel = require('gulp-babel');
const gulpif    = require('gulp-if');
const eslint    = require('gulp-eslint');
const mocha     = require('gulp-mocha-simple');
const mustache  = require('gulp-mustache');
const ll        = require('gulp-ll-next');
const rename    = require('gulp-rename');
const webmake   = require('@belym.a.2105/gulp-webmake');
const uglify    = require('gulp-uglify');
const util      = require('gulp-util');

gulpStep.install();

ll.tasks('lint');

gulp.task('clean', () => {
    return del('lib');
});

// Lint
gulp.task('lint', () => {
    return gulp
        .src([
            'src/**/*.js',
            '!src/client/**/*.js',
            '!src/compiler/tools/**/*.js',
            'test/**/**.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


// Build
gulp.step('templates', () => {
    return gulp
        .src([
            'src/**/*.mustache',
            '!src/**/*.js.wrapper.mustache'
        ])
        .pipe(gulp.dest('lib'));
});

gulp.step('server-scripts', () => {
    return gulp
        .src(['src/**/*.js', '!src/client/**/*.js'])
        .pipe(gulpBabel())
        .pipe(gulp.dest('lib'));
});

gulp.step('client-scripts-bundle', () => {
    return gulp
        .src(['src/client/index.js'], { base: 'src' })
        .pipe(webmake({
            sourceMap: false,
            transform: function (filename, code) {
                const transformed = babel.transform(code, {
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

gulp.step('client-scripts-template-render', () => {
    const script = { wrapper: 'src/client/index.js.wrapper.mustache', src: 'lib/client/index.js' };

    return gulp
        .src(script.wrapper)
        .pipe(mustache({ source: fs.readFileSync(script.src).toString() }))
        .pipe(rename(path.basename(script.src)))
        .pipe(gulpif(!util.env.dev, uglify()))
        .pipe(gulp.dest(path.dirname(script.src)));
});

gulp.step('client-scripts', gulp.series('client-scripts-bundle', 'client-scripts-template-render'));

gulp.task('fast-build', gulp.series(
    'clean',
    gulp.parallel('server-scripts', 'client-scripts', 'templates'))
);

gulp.task('build', gulp.parallel('fast-build', 'lint'));

// Test

gulp.step('test-server-run', () => {
    return gulp
        .src('test/server/*-test.js')
        .pipe(mocha({
            ui:       'bdd',
            reporter: 'spec',
            timeout:  typeof v8debug === 'undefined' ? 2000 : Infinity // NOTE: disable timeouts in debug
        }));
});

gulp.task('test', gulp.series('build', 'test-server-run'));
