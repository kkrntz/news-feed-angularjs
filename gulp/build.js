'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var inject = require("gulp-inject");
// var shell = require("gulp-shell");

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', function () {
  return gulp.src([
    path.join(conf.paths.src, '/app/**/*.html'),
    path.join(conf.paths.tmp, '/serve/app/**/*.html')
  ])
    .pipe($.htmlmin({
      removeEmptyAttributes: true,
      removeAttributeQuotes: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'foodcartWebtool',
      root: 'app'
    }))
    .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(conf.paths.tmp, '/partials'),
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html', { restore: true });
  var jsFilter = $.filter('**/*.js', { restore: true });
  var cssFilter = $.filter('**/*.css', { restore: true });

  return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe($.useref())
    .pipe(jsFilter)
    .pipe($.sourcemaps.init())
    .pipe($.ngAnnotate())
    .pipe($.uglify({ preserveComments: $.uglifySaveLicense })).on('error', conf.errorHandler('Uglify'))
    .pipe($.rev())
    .pipe($.sourcemaps.write('maps'))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    // .pipe($.sourcemaps.init())
    .pipe($.cssnano())
    .pipe($.rev())
    // .pipe($.sourcemaps.write('maps'))
    .pipe(cssFilter.restore)
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.htmlmin({
      removeEmptyAttributes: true,
      removeAttributeQuotes: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true
    }))
    .pipe(htmlFilter.restore)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
});

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,otf,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')));
});

gulp.task('other', function () {
  var fileFilter = $.filter(function (file) {
    return file.stat.isFile();
  });

  return gulp.src([
    path.join(conf.paths.src, '/**/*'),
    path.join('!' + conf.paths.src, '/**/*.{html,css,js}')
  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

gulp.task("addctrl", function () {
  var target = gulp.src("./src/index.html");
  var sources = gulp.src(["./src/app/broadcast-message/*.js",
                          "./src/app/confirm-password/*.js",
                          "./src/app/forgot-password/*.js",
                          "./src/app/home/*.js",
                          "./src/app/new-user/*.js",
                          "./src/app/reports/master-data/cash-flow/*.js",
                          "./src/app/reports/master-data/delivery/*.js",
                          "./src/app/reports/master-data/delivery-intransit/*.js",
                          "./src/app/reports/master-data/item-list/*.js",
                          "./src/app/reports/master-data/packet-logs/*.js",
                          "./src/app/reports/master-data/promo-list/*.js",
                          "./src/app/reports/transactions/backorder/*.js",
                          "./src/app/reports/transactions/customer-registration/*.js",
                          "./src/app/reports/transactions/delivery/*.js",
                          "./src/app/reports/transactions/inventory/*.js",
                          "./src/app/reports/transactions/inventory-vs-sales/*.js",
                          "./src/app/reports/transactions/sales/*.js",
                          "./src/app/reports/transactions/sales-correction/*.js",
                          "./src/app/reports/transactions/sales-return/*.js",
                          "./src/app/reports/transactions/sku-movement/*.js",
                          "./src/app/reports/transactions/stock-count/*.js",
                          "./src/app/reports/transactions/stock-transfer/*.js",
                          "./src/app/uploads/brands/*.js",
                          "./src/app/uploads/create-promo/*.js",
                          "./src/app/uploads/delivery-intransit/*.js",
                          "./src/app/uploads/items/*.js",
                          "./src/app/uploads/price-template/*.js",
                          "./src/app/uploads/stores/*.js",
                          "./src/app/uploads/uom/*.js",
                          "./src/app/uploads/users/*.js",
                          "./src/app/uploads/view-promo/*.js"], {
      read: false
  });
  return target.pipe(inject(sources))
      .pipe(gulp.dest("./src/"));
});

gulp.task('clean', function () {
  return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});

gulp.task('build', ['html', 'fonts', 'other']);
