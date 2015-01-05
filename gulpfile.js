'use strict';

/**
 * Gulp permet d'orchestrer des listes de taches
 * 
 * Dans le cas des widgets ISTEX, ces tâches permettent de :
 * - minifier les css et les js
 * - optimiser les images
 * - concaténer les js et css pour la version "all-in-one"
 */

var widgets = [ 'istexauth', 'istexsearch', 'istexresults' ];
var themes  = [ 'default' ];

var gulp       = require("gulp");
var csso       = require("gulp-csso");
var less       = require('gulp-less');
var concat     = require('gulp-concat');
var uglify     = require('gulp-uglify');
var stripDebug = require('gulp-strip-debug');
var imagemin   = require('gulp-imagemin');
var jsmin      = require('gulp-jsmin');
var rename     = require('gulp-rename');
var bower      = require('gulp-bower');
var clean      = require('gulp-clean');
var git        = require('gulp-git');
var es         = require('event-stream');

// default task: build everything
gulp.task("default", [ "build" ]);

// build and deploy
gulp.task("build", [ "clean-dist", "themes", "scripts", "bower" ]);
gulp.task("deploy",  [ "push-dist" ]);

// init task: prepare environment
gulp.task("init",    [ "clone-dist", "bower" ]);


gulp.task('themes', [
  'css',
  'css-all-in-one',
  'images',
  'images-all-in-one'
]);

gulp.task('scripts', [
  'js',
  'js-all-in-one',
]);

/**
 * Loop over every widgets and themes
 * theme convert less to css and minify it
 */
gulp.task('css', [ "clean-dist" ], function () {
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
gulp.task('images', [ "clean-dist" ], function() {
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
gulp.task('js-all-in-one', [ "clean-dist" ], function () {

  var gulpSubTask = [];

  // copy not minified version
  gulpSubTask.push(
    gulp.src([ './bower_components/jquery-jsonp/src/jquery.jsonp.js',
               './lib/istexconfigdefault.js' ].concat(
      widgets.map(function (w) {
        return './' + w + '/js/script.js';
      })
     )).pipe(concat('widgets.js'))
       .pipe(stripDebug())
       .pipe(gulp.dest('./dist/js/'))
  );

  // minify js one by one
  gulpSubTask.push(
    gulp.src([ './bower_components/jquery-jsonp/src/jquery.jsonp.js',
               './lib/istexconfigdefault.js' ].concat(
      widgets.map(function (w) {
        return './' + w + '/js/script.js';
      })
     )).pipe(concat('widgets.min.js'))
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
gulp.task('mocha', [ 'bower' ], function () {
    return gulp.src([ 'test/*.spec.js' ], { read: false })
      .pipe(mocha())
      .once('end', function () {
        process.exit();
      });
});

/**
 * Start a http server for debugging
 */
var httpServer = require('http-server');
gulp.task('http', [ 'bower' ], function () {
  var server = httpServer.createServer({
    root: __dirname,
  });
  server.listen(8080, '127.0.0.1', function () {
    console.log('Listening on http://127.0.0.1:8080/index.html');
    console.log('Listening on http://127.0.0.1:8080/test/search.html');
    console.log('Listening on http://127.0.0.1:8080/test/auth-ezproxy-ul.html');
  });
});
gulp.task('https', [ 'bower' ], function () {
  var server = httpServer.createServer({
    root: __dirname,
    https: {
      cert: __dirname + '/tmp/test.pem',
      key:  __dirname + '/tmp/test.key',
      ca:   __dirname + '/tmp/test.pem'
    }
  });
  server.listen(8080, '127.0.0.1', function () {
    console.log('Listening on http://127.0.0.1:8080/index.html');
    console.log('Listening on http://127.0.0.1:8080/test/search.html');
    console.log('Listening on http://127.0.0.1:8080/test/auth-ezproxy-ul.html');
  });
});

/**
 * Clean dist folder
 * ignoring index.html (committed on git)
 */
gulp.task('clean-dist', function () {
  return gulp.src([
      './dist/*',
      '!./dist/.git/',
      '!./dist/index.html',
      '!./dist/ezproxy-auth-and-close.html',
      '!./dist/bower.json',
      '!./dist/bower_components/',
    ], { read: false })
    .pipe(clean());
});

/**
 * Clone the dist directory from istex.github.io
 */
gulp.task('clone-dist', function () {
  git.clone('git@github.com:istex/istex.github.io.git', { args: 'dist' }, function (err) {
    if (err) throw err;
  });
});

/**
 * Commit and push the dist directory to istex.github.io
 */
gulp.task('commit-dist', function () {
  return gulp.src('./dist/*')
    .pipe(git.commit('update dist', { cwd: './dist' }))
    .on('error', function errorHandler (err) {
      console.log('Error because nothing to commit: ', err);
      this.emit('end');
    });
});
gulp.task('push-dist', [ 'commit-dist' ], function () {
  git.push('origin', 'master', { cwd: './dist' }, function (err) {
    if (err) throw err;
  });
});
