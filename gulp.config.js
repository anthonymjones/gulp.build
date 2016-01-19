(function() {

    module.exports = function() {
        var client = './src/client/';
        var clientApp = client + 'app/';
        var report = './report';
        var root = './';
        var server = './src/server/';
        var temp = './.tmp/';
        var wiredep = require('wiredep');
        var bowerFiles = wiredep({devDependencies: true})['js'];

        var config = {
            //
            // File paths
            //
            alljs: [
                './src/**/*.js',
                './*.js'
            ],
            build: './build/',
            client: client,
            css: temp + 'styles.css',
            fonts: './bower_components/font-awesome/fonts/**/*.*',
            html:  clientApp + '**/*.html',
            htmltemplates: clientApp + '**/*.html',
            images: client + 'images/**/*.*',
            index: client + 'index.html',
            js: [
                clientApp + '**/*.module.js',
                clientApp + '**/*.js',
                '!' + clientApp + '**/*.spec.js'
            ],
            sass: client + 'styles/styles.sass',
            report: report,
            root: root,
            server: server,
            temp: temp,

            //
            // Optimized files
            //
            optimized: {
                app: 'app.js',
                lib: 'lib.js'
            },

            //
            // Bower & npm locations
            //
            bower: {
                json: require('./bower.json'),
                directory: './bower_components',
                ignorePath: '../..'
            },
            packages: [
                './package.json',
                './bower.json'
            ],

            //
            // Karma and testing settings
            //
            specHelpers: [client + 'test-helpers/*.js'],
            serverIntegrationSpecs: [client + 'tests/server-integration/**/*.spec.js'],

            //
            // Template cache
            //
            templateCache: {
                file: 'templates.js',
                options: {
                    module: 'app.core',
                    standAlone: false,
                    root: 'app/'
                }
            },

            //
            // Browser sync
            //
            defaultPort: 7203,
            nodeServer: './src/server/app.js',
            browserSyncReloadDelay: 1000

        };

        config.getWiredepDefaultOptions = function() {
            var options = {
                bowerJson: config.bower.json,
                directory: config.bower.directory,
                ignorePath: config.bower.ignorePath
            };

            return options;
        };

        config.karma = getKarmaOptions();

        return config;

        /////////////////

        function getKarmaOptions() {
            var options = {
                files: [].concat(
                    bowerFiles,
                    config.specHelpers,
                    client + '**/*.module.js',
                    client + '**/*.js',
                    temp + config. templateCache.file,
                    config.serverIntegrationSpecs
                ),
                exclude: [],
                coverage: {
                    dir: report + 'coverage',
                    reporters: [
                        {type: 'html', subdir: 'report-html'},
                        {type: 'lcov', subdir: 'report-lcov'},
                        {type: 'text-summary'}
                    ]
                },
                preprocessors: {}
            };
            options.preprocessors[clientApp + '**/!(*.spec)+(.js)'] = ['coverage'];
            return options;
        }
    };
})();