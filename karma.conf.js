(function() {
    'use strict';

    module.exports = function(config) {
        var gulpConfig = require('./gulp.config')();

        config.set({
            // base path that will be used to resolve all patterns (eg. files, exclude)
            basePath: './',

            // frameworks to use
            frameworks: ['mocha', 'chai', 'sinon', 'chai-sinon'],

            // list of files / patterns to load in the browser
            files: gulpConfig.karma.files,

            // list of files to exclude
            exclude: gulpConfig.karma.exclude,

            proxies: {
                '/': 'http://localhost:8888'
            },

            // preprocess matching files before serving them to the browser
            preprocessors: gulpConfig.karma.preprocessors,

            // test results reporter to use
            // possible values: 'dots', 'progress', 'coverage'
            reporters: ['progress', 'coverage'],

            coverageReporter: {
                dir: gulpConfig.karma.coverage.dir,
                reporters: gulpConfig.karma.coverage.reporters
            },

            // web server port
            port: 9876,

            // enable / disable colors in the output (reporters and logs)
            colors: true,

            // level of logging
            // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
            // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
            logLevel: config.LOG_INFO,

            // enable / disable watching file and executing tests whenever any file changes
            autoWatch: true,

            // start these browsers
            browsers: ['PhantomJS'],

            // Continuous Integration mode
            singleRun: false
        });
    };
})();