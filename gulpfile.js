"use strict";

const 
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    dest = require('dest'),
    del = require('del'),
    shell = require('shell'),
    imagemin = require('gulp-imagemin'),
    browserSync = require('browser-sync').create(),
    panini = require('panini'),
    plumber = require('gulp-plumber'),
    eslint = require('gulp-eslint'),
    rollup = require('rollup-stream'),
    gutil = require('gulp-util'),
    buffer = require('vinyl-buffer'),
    concat = require('gulp-concat'),
    babel = require('rollup-plugin-babel'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps');

const global = {
    noTranspileScriptsPaths: [

    ]
};

function cleanDir(path) {
    return del([path]);
}

function createDir(path) {
    return shell([
        'mkdir -p ' + path
    ]);
}

gulp.task('default', _ => {
    cleanDir('dist/');
    createDir('dist/');
    setTimeout(function () {
        gulp.start('server');
        gulp.start('scss');
        gulp.start('js');
        gulp.start('jslint');
        gulp.start('concat-scripts');
        gulp.start('html');
        gulp.start('image');
        gulp.start('watch');
    }, 100);
});

gulp.task('scss', _ => {
    return gulp.src('src/scss/app.scss') 
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest('dist/css'))
});

gulp.task('html', _ => {
    return gulp.src('src/html/pages/**/*.html')
        .pipe(panini({
            root: 'src/html/pages/',
            layouts: 'src/html/layouts/'
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('image', _ => {
    return gulp.src(['src/images/*'])
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'));
});

gulp.task('js', _ => {
    return plumber(
        function (error) {
            gutil.log(error);
            this.emit("end");
        })
        .pipe(rollup({
            input: "src/js/app.js",
            format: "iife",
            sourcemap: true,
            plugins: [
                babel()
            ],
            name: "name"
        }))
        .pipe(source("app.js", './src/js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(dest("dist/js", {ext: ".js"}))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("dist/js"))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('concat-scripts', ['js'], _ => {
    global.noTranspileScriptsPaths.push('dist/js/app.js');
    return gulp.src(global.noTranspileScriptsPaths)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist/js'))
});

gulp.task('jslint', ['js'], _ => {
    return gulp.src(['/js/**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('watch', _ => {
    gulp.watch('src/scss/**/*.scss', ['scss', 'reload']);
    gulp.watch('src/js/**/*.js', ['js', 'concat-scripts', 'jslint', 'reload']);
    gulp.watch(['src/html/*.html', 'src/html/**/*.html'], ['html', 'reload']);
    gulp.watch('src/images/*', ['image', 'reload']);
});

gulp.task('server', done => {
    browserSync.init({
        server: {
            baseDir: 'dist/'
        }
    });
    done();
});

gulp.task('reload', done => {
    panini.refresh();
    browserSync.reload();
    done();
});
