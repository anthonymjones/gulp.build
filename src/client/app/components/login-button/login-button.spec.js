/* jshint -W117, -W030 */
describe('app.components.loginButton', function() {
    var expect = chai.expect;
    var $scope, compiledElement;

    beforeEach(function() {
        bard.appModule('app.components.loginButton', 'app.core');
        bard.inject(
            '$compile',
            '$rootScope'
        );
    });

    beforeEach(function() {
        var element = angular.element('<login-button></login-button>');
        $scope = $rootScope.$new();
        compiledElement = $compile(element)($scope);

        $scope.$digest();
    });

    describe('When: Using the login-button component', function() {
        it('Should: exist', function() {
            expect(compiledElement).to.exist;
        });
    });
});