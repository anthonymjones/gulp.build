(function() {

    module.exports = function() {
        var client = './src/client/';
        var clientApp = client + 'app/';
        var server = './src/server/';
        var temp = './tmp/';

        var config = {
            //
            // File paths
            //
            alljs: [
                './src/**/*.js',
                './*.js'
            ],

            index: client + 'index.html',
            client: client,
            css: temp + 'styles.css',
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