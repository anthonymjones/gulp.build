(function() {

    module.exports = function() {
        var client = './src/client/';
        var clientApp = client + 'app/';
        var server = './src/server/';
        var temp = './.tmp/';

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
            htmltemplates: clientApp + '**/*.html',
            images: client + 'images/**/*.*',
            index: client + 'index.html',
            js: [
                clientApp + '**/*.module.js',
                clientApp + '**/*.js',
                '!' + clientApp + '**/*.spec.js'
            ],
            sass: client + 'styles/styles.sass',
            server: server,
            temp: temp,

            //
            // Bower & npm locations
            //
            bower: {
                json: require('./bower.json'),
                directory: './bower_components',
                ignorePath: '../..'
            },

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

        return config;
    };
})();