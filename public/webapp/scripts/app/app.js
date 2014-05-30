'use strict';

/* App Module */

var calcApp = angular.module('calcApp', [
    'ngResource',
    'ngRoute',
    'ngCookies',
    'ui.bootstrap',                     // angular-ui bootstrap elelments
    'chieffancypants.loadingBar'        // loading indicator for xhr requests
  ]);

calcApp
    .constant('_', window._)
    .config(['$routeProvider', '$httpProvider',
        function ($routeProvider, $httpProvider) {
            $routeProvider
                .when('/intro', {
                    templateUrl: 'views/intro.html',
                    controller: 'IntroController'
                })
                .otherwise({
                    templateUrl: 'views/calc.html',
                    controller: 'MainController'
                })
        }])
        .run(['$rootScope', '$location',
            function($rootScope, $location) {
            $rootScope.$on("$routeChangeStart", function(event, next, current) {
              
            });
        }]);
