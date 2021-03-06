(function() {
    'use strict';

    var gulp = require('gulp');
    var _ = require('lodash');
    var $ = require('gulp-load-plugins')({lazy: true});
    var args = require('yargs').argv;
    var browserSync = require('browser-sync');
    var config = require('./gulp.config')();
    var del = require('del');
    var path = require('path');
    var port = process.env.PORT || config.defaultPort;

    //
    // HELP & DEFAULT
    //
    gulp.task('help', $.taskListing);
    gulp.task('default', ['help']);

    //
    // VET
    //
    gulp.task('vet', function() {
        log('Analyzing source with JSHint and JSCS');
        return gulp
            .src(config.alljs)
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jscs())
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
            .pipe($.jshint.reporter('fail'));
    });

    //
    // FONTS
    //
    gulp.task('fonts', ['clean-fonts'], function() {
        log('Copying fonts');

        return gulp
            .src(config.fonts)
            .pipe(gulp.dest(config.build + 'fonts'));
    });

    //
    // IMAGES
    //
    gulp.task('images', ['clean-images'], function() {
        log('Copying and compressing images');

        return gulp
            .src(config.images)
            .pipe($.imagemin({optimizationLevel: 4}))
            .pipe(gulp.dest(config.build + 'images'));
    });

    //
    // STYLES
    //
    gulp.task('styles', ['clean-styles'], function() {
        log('Compiling Sass --> CSS');
        return gulp
            .src(config.sass)
            .pipe($.plumber())
            .pipe($.sass())
            .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
            .pipe(gulp.dest(config.temp));
    });

    //
    // CLEAN ALL
    //
    gulp.task('clean', function(done) {
        var delconfig = [].concat(config.build, config.temp);
        log('Cleaning: ' + $.util.colors.blue(delconfig));
        del(delconfig, done);
    });

    //
    // CLEAN FONTS
    //
    gulp.task('clean-fonts', function(done) {
        clean(config.build + 'fonts/**/*.*', done);
    });

    //
    // CLEAN IMAGES
    //
    gulp.task('clean-images', function(done) {
        clean(config.build + 'images/**/*.*', done);
    });

    //
    // CLEAN STYLES
    //
    gulp.task('clean-styles', function(done) {
        clean(config.temp + '**/*.css', done);
    });

    //
    // CLEAN CODE
    //
    gulp.task('clean-code', function(done) {
        var files = [].concat(
            config.temp + '**/*.js',
            config.build + '**/*.html',
            config.build + 'js/**/*.js'
        );
        clean(files, done);
    });

    //
    // SASS WATCHER
    //
    gulp.task('sass-watcher', function() {
        gulp.watch([config.sass], ['styles']);
    });

    //
    // INJECT
    //
    gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function() {
        log('Wire up the app css into the html, and call wiredep');
        return gulp
            .src(config.index)
            .pipe($.inject(gulp.src(config.css)))
            .pipe(gulp.dest(config.client));
    });

    //
    // TEMPLATE CACHE
    //
    gulp.task('templatecache', ['clean-code'], function() {
        log('Creating AngularJS $templateCache');

        return gulp
            .src(config.htmltemplates)
            //.pipe($.minifyHtml({empty: true}))
            .pipe($.angularTemplatecache(
                config.templateCache.file,
                config.templateCache.options))
            .pipe(gulp.dest(config.temp));
    });

    //
    // WIREDEP
    //
    gulp.task('wiredep', function() {
        log('Wiring up the bower css, js, and app js into the html');
        var options = config.getWiredepDefaultOptions();
        var wiredep = require('wiredep').stream;

        return gulp
            .src(config.index)
            .pipe(wiredep(options))
            .pipe($.inject(gulp.src(config.js)))
            .pipe(gulp.dest(config.client));
    });

    //
    // BUILD
    //
    gulp.task('build', ['optimize', 'images', 'fonts'], function() {
        log('Building everything');

        var msg = {
            title: 'gulp build',
            subtitle: 'Deployed to the build folder',
            messgae: 'Running `gulp serve-build`'
        };
        del(config.temp);
        log(msg);
        notify(msg);
    });

    //
    //
    //
    gulp.task('serve-specs', ['build-specs'], function() {
       log('run the spec runner');
        serve(true /* isDev */, true /* specRunner */);
    });

    //
    // BUILD SPECS
    //
    gulp.task('build-specs', ['templatecache'], function() {
        log('building the spec runner');

        var wiredep = require('wiredep').stream;
        var options = config.getWiredepDefaultOptions();
        options.devDependencies = true;

        return gulp
            .src(config.specRunner)
            .pipe(wiredep(options))
            .pipe($.inject(gulp.src(config.testlibraries),
                {name: 'inject:testlibraries', read: false}))
            .pipe($.inject(gulp.src(config.js)))
            .pipe($.inject(gulp.src(config.specHelpers),
                {name: 'inject:spechelpers', read: false}))
            .pipe($.inject(gulp.src(config.specs),
                {name: 'inject:specs', read: false}))
            .pipe($.inject(gulp.src(config.temp + config.templateCache.file),
                {name: 'inject:templates', read: false}))
            .pipe(gulp.dest(config.client));
    });

    //
    // OPTIMIZE
    //
    gulp.task('optimize', ['inject', 'test'], function() {
        log('Optimizing the javascript, css, html');

        var assets = $.useref.assets({searchPath: '/'});
        var cssFilter = $.filter('**/*.css');
        var jsAppFilter = $.filter('**/' + config.optimized.app);
        var jsLibFilter = $.filter('**/' + config.optimized.lib);
        var templateCache = config.temp + config.templateCache.file;

        return gulp
            .src(config.index)
            .pipe($.plumber())
            .pipe($.inject(gulp.src(templateCache, {read: false}), {
                starttag: '<!-- inject:templates:js -->'
            }))
            .pipe(assets)
            .pipe(cssFilter)
            .pipe($.csso())
            .pipe(cssFilter.restore())
            .pipe(jsLibFilter)
            .pipe($.uglify())
            .pipe(jsLibFilter.restore())
            .pipe(jsAppFilter)
            .pipe($.ngAnnotate())
            .pipe($.uglify())
            .pipe(jsAppFilter.restore())
            .pipe($.rev())
            .pipe(assets.restore())
            .pipe($.useref())
            .pipe($.revReplace())
            .pipe(gulp.dest(config.build))
            .pipe($.rev.manifest())
            .pipe(gulp.dest(config.build));
    });

    //
    // BUMP
    //
    gulp.task('bump', function() {
        var msg = 'Bumping versions';
        var type = args.type;
        var version = args.version;
        var options = {};
        if (version) {
            options.version = version;
            msg += ' to ' + version;
        } else {
            options.type = type;
            msg += ' for a ' + type;
        }
        log(msg);
        return gulp
            .src(config.packages)
            .pipe($.bump(options))
            .pipe(gulp.dest(config.root));
    });

    //
    // SERVE BUILD
    //
    gulp.task('serve-build', ['build'], function() {
        serve(false);
    });

    //
    // SERVE DEV
    //
    gulp.task('serve-dev', ['inject'], function() {
        serve(true);
    });

    //
    // TEST
    //
    gulp.task('test', ['vet', 'templatecache'], function(done) {
        startTests(true /* singleRun */, done);
    });

    //
    // AUTOTEST
    //
    gulp.task('autotest', ['vet', 'templatecache'], function(done) {
        startTests(false /* singleRun */, done);
    });

    ///////////////////////
    //                   //
    //     FUNCTIONS     //
    //                   //
    ///////////////////////

    //
    // BROWSER SYNC
    //
    function startBrowserSync(isDev, specRunner) {
        if(args.nosync || browserSync.active) {
            return;
        }

        log('Starting browser-sync on port ' + port);

        if (isDev) {
            gulp.watch([config.sass], ['styles'])
                .on('change', function(event) { changeEvent(event); });
        } else {
            gulp.watch([config.sass, config.js, config.html], ['optimize', browserSync.reload()])
                .on('change', function(event) { changeEvent(event); });
        }

        var options = {
            proxy: 'localhost:' + port,
            port: 3000,
            files: isDev ? [
                config.client + '**/*.*',
                '!' + config.sass,
                config.temp + '**.*'
            ] : [],
            ghostMode: {
                clicks: true,
                location: false,
                forms: true,
                scroll: true
            },
            injectChanges: true,
            logFileChanges: true,
            logLevel: 'debug',
            logPrefix: 'gulp-patterns',
            notify: true,
            reloadDelay: 500
        };

        if (specRunner) {
            options.startPath = config.specRunnerFile;
        }

        browserSync(options);
    }

    //
    // CHANGE EVENT
    //
    function changeEvent(event) {
        var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
        log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
    }

    //
    // CLEAN
    //
    function clean(path, done) {
        log('Cleaning: ' + $.util.colors.blue(path));
        del(path);
        done();
    }

    //
    // LOG
    //
    function log(msg) {
        if (typeof(msg) === 'object') {
            for (var item in msg) {
                if (msg.hasOwnProperty(item)) {
                    $.util.log($.util.colors.blue(msg[item]));
                }
            }
        } else {
            $.util.log($.util.colors.blue(msg));
        }
    }

    //
    // NOTIFY
    //
    function notify(options) {
        var notifier = require('node-notifier');
        var notifyOptions = {
            sound: 'Bottle',
            contentImage: '',
            icon: ''
        };
        _.assign(notifyOptions, options);
        notifier.notify(notifyOptions);
    }

    //
    // SERVE
    //
    function serve(isDev, specRunner) {
        var nodeOptions = {
            script: config.nodeServer,
            delayTime: 1,
            env: {
                'PORT': port,
                'NODE_ENV': isDev ? 'dev' : 'build'
            },
            watch: [config.server]
        };

        return $.nodemon(nodeOptions)
            .on('restart', function(ev) {
                log('*** nodemon restarted');
                log('files changed on restart:\n' + ev);
                setTimeout(function() {
                    browserSync.notify('Reloading now ...');
                    browserSync.reload();
                }, config.browserSyncReloadDelay);
            })
            .on('start', function() {
                log('*** nodemon started');
                startBrowserSync(isDev, specRunner);
            })
            .on('crash', function() {
                log('*** nodemon crashed: script crashed for some reason');
            })
            .on('exit', function() {
                log('*** nodemon exited cleanly');
            });
    }

    //
    // START TESTS
    //
    function startTests(singleRun, done) {
        var karma = require('karma').server;
        var excludeFiles = [];
        var serverSpecs = config.serverIntegrationSpecs;

        excludeFiles = serverSpecs;

        karma.start({
            configFile: __dirname + '/karma.conf.js',
            exclude: excludeFiles,
            singleRun: !!singleRun
        }, karmaCompleted);

        function karmaCompleted(karmaResult) {
            log('Karma completed!');
            if (karmaResult === 1) {
                done('karma: tests failed with code ' + karmaResult);
            } else {
                done();
            }
        }
    }

})();