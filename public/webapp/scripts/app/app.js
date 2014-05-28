'use strict';

/* App Module */

var calcApp = angular.module('calcApp', [
    'ngResource',
    'ngRoute',
    'ngCookies',
    'chieffancypants.loadingBar'        // loading indicator for xhr requests
  ]);

calcApp
    .constant('_', window._)
    .config(['$routeProvider', '$httpProvider',
        function ($routeProvider, $httpProvider) {
            $routeProvider
                .when('/<abc>', {
                    templateUrl: 'views/document.html',
                    controller: 'DocumentController'
                })
                .otherwise({
                    templateUrl: 'views/main.html',
                    controller: 'MainController'
                })
        }])
        .run(['$rootScope', '$location',
            function($rootScope, $location) {
            $rootScope.$on("$routeChangeStart", function(event, next, current) {
              
            });
        }]);
