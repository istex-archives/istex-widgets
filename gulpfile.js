'use strict';

/**
 * Gulp permet d'orchestrer des listes de taches
 * 
 * Dans le cas des widgets ISTEX, ces tâches permettent de :
 * - minifier les css et les js
 * - optimiser les images
 * - concaténer les js et css pour la version "all-in-one"
 */

var widgets = [ 'search', 'results' ];
var themes  = [ 'default' ];

var gulp       = require("gulp")
var csso       = require("gulp-csso")
var less       = require('gulp-less');
var concat     = require('gulp-concat');
var uglify     = require('gulp-uglify');
var stripDebug = require('gulp-strip-debug');
var imagemin   = require('gulp-imagemin');
var jsmin      = require('gulp-jsmin');
var rename     = require('gulp-rename');
var es         = require('event-stream');
var bower      = require('gulp-bower');

// default task
gulp.task("default", [ "themes", "scripts", "bower" ], function () {

});

gulp.task('themes', [
          'css',
          'css-all-in-one',
          'images',
          'images-all-in-one'
        ], function () {
});

gulp.task('scripts', [
          'js',
          'js-all-in-one',
        ], function () {
});

/**
 * Loop over every widgets and themes
 * theme convert less to css and minify it
 */
gulp.task('css', function () {
  var gulpSubTask = [];

  // not minified
  widgets.forEach(function (widget) {
    themes.forEach(function (theme) {
      gulpSubTask.push(
        gulp.src('./' + widget + '/themes/' + theme + '/*.less')
            .pipe(less())
            .pipe(gulp.dest('./dist/' + widget + '/themes/' + theme + '/'))
      );
    });
  });

  // minified
  widgets.forEach(function (widget) {
    themes.forEach(function (theme) {
      gulpSubTask.push(
        gulp.src('./' + widget + '/themes/' + theme + '/*.less')
            .pipe(less())
            .pipe(csso())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest('./dist/' + widget + '/themes/' + theme + '/'))
      );
    });
  });

  return es.concat.apply(null, gulpSubTask);
});

/**
 * Concatenate every css into a single on
 * used for all-in-one widgets
 */
gulp.task('css-all-in-one', [ 'css' ], function () {
  var gulpSubTask = [];
  
  // not minified
  themes.forEach(function (theme) {
    gulpSubTask.push(
      gulp.src(widgets.map(function (w) {
        return './dist/' + w + '/themes/' + theme + '/style.css';
      })).pipe(concat('widgets.css'))
         .pipe(gulp.dest('./dist/themes/' + theme + '/'))
    );
  });

  // minified
  themes.forEach(function (theme) {
    gulpSubTask.push(
      gulp.src(widgets.map(function (w) {
        return './dist/' + w + '/themes/' + theme + '/style.css';
      })).pipe(concat('widgets.min.css'))
         .pipe(csso())
         .pipe(gulp.dest('./dist/themes/' + theme + '/'))
    );
  });

  return es.concat.apply(null, gulpSubTask);
});

/**
 * Optimize and copy widgets theme images
 */
gulp.task('images', function() {
  var gulpSubTask = [];
  widgets.forEach(function (widget) {
    themes.forEach(function (theme) {
      // optimize images and copy to themes directories
      gulpSubTask.push(
        gulp.src('./' + widget + '/themes/' + theme + '/*.png')
            .pipe(imagemin({ optimizationLevel: 5 }))
            .pipe(gulp.dest('./dist/' + widget + '/themes/' + theme + '/'))
      );
    });
  });
  return es.concat.apply(null, gulpSubTask);
});

/**
 * Copy every images into the all-in-one themes
 */
gulp.task('images-all-in-one', [ 'images' ], function() {
  var gulpSubTask = [];
  widgets.forEach(function (widget) {
    themes.forEach(function (theme) {
      // copy to all-in-one directory
      gulpSubTask.push(
        gulp.src('./dist/' + widget + '/themes/' + theme + '/*.png')
            .pipe(gulp.dest('./dist/themes/' + theme + '/'))
      );
    });
  });
  return es.concat.apply(null, gulpSubTask);
});


// concatenate every js a single on
// used for all in one widgets
gulp.task('js-all-in-one', function () {

  var gulpSubTask = [];

  // copy not minified version
  gulpSubTask.push(
    gulp.src(widgets.map(function (w) {
      return './' + w + '/js/script.js';
    })).pipe(concat('widgets.js'))
       .pipe(stripDebug())
       .pipe(gulp.dest('./dist/js/'))
  );

  // minify js one by one
  gulpSubTask.push(
    gulp.src(widgets.map(function (w) {
      return './' + w + '/js/script.js';
    })).pipe(concat('widgets.min.js'))
       .pipe(stripDebug())
       .pipe(uglify())
       .pipe(gulp.dest('./dist/js/'))
  );

  return es.concat.apply(null, gulpSubTask);
});

gulp.task('js', [ 'js-all-in-one' ], function () {
  var gulpSubTask = [];
  widgets.forEach(function (widget) {
    // copy not minified version
    gulpSubTask.push(
      gulp.src('./' + widget + '/js/*.js')
          .pipe(gulp.dest('./dist/' + widget + '/js/'))
    );

    // minify js one by one
    gulpSubTask.push(
      gulp.src('./' + widget + '/js/*.js')
          .pipe(jsmin())
          .pipe(rename({ suffix: '.min' }))
          .pipe(gulp.dest('./dist/' + widget + '/js/'))
    );    
  });
  return es.concat.apply(null, gulpSubTask);
});

/**
 * Install bower dependencies
 * ex: lesscss, jquery ...
 */
gulp.task('bower', function () {
  return bower()
    .pipe(gulp.dest('bower_components/'));
});


/**
 * Run tests
 */
gulp.task('test', [ 'mocha' ], function () {
});

var mocha = require('gulp-mocha');
gulp.task('mocha', function () {
    return gulp.src([ 'test/*.spec.js' ], { read: false })
      .pipe(mocha())
      .once('end', function () {
        process.exit();
      });
});