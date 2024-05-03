const { spawn } = require('child_process');
const fs        = require('fs');
const path      = require('path');
const del       = require('del');
const gulp      = require('gulp');
const gulpStep  = require('gulp-step');
const eslint    = require('gulp-eslint');
const mocha     = require('gulp-mocha-simple');
const mustache  = require('gulp-mustache');
const ll        = require('gulp-ll-next');
const rename    = require('gulp-rename');
const uglify    = require('gulp-uglify');

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
    return spawn('npx tsc -p src/tsconfig.json', { shell: true, stdio: 'inherit' });
});

gulp.step('client-scripts-bundle', () => {
    return spawn('npx rollup -c', { shell: true, stdio: 'inherit', cwd: path.join(__dirname, 'src/client') });
});

gulp.step('client-scripts-template-render', () => {
    const script = { wrapper: 'src/client/index.js.wrapper.mustache', src: 'lib/client/index.js' };

    return gulp
        .src(script.wrapper)
        .pipe(mustache({ source: fs.readFileSync(script.src).toString() }))
        .pipe(rename(path.basename(script.src)))
        .pipe(uglify())
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
