(function() {
    'use strict';

    angular
        .module('app.components.loginButton')
        .directive('loginButton', loginButton);

    function loginButton() {
        return {
            restrict: 'E',
            templateUrl: 'app/components/login-button/login-button.html',
            controller: LoginButton,
            controllerAs: 'vm'
        };
    }

    /* @ngInject */
    function LoginButton(logger) {
        var vm = this;

        vm.submit = submit;

        function submit() {
            logger.success('Submit button has been clicked!');
        }
    }
})();