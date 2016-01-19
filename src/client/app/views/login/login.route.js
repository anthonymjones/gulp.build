(function() {
    'use strict';

    angular
        .module('app.views.login')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates(), '/');
    }

    function getStates() {
        return [
            {
                state: 'login',
                config: {
                    url: '/',
                    templateUrl: 'app/views/login/login.html',
                    title: 'login'
                }
            }
        ];
    }
})();