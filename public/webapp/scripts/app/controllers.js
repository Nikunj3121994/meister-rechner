'use strict';

/* Controllers */


// ------------------------------------------------------
// MenuController
// ------------------------------------------------------
calcApp.controller('MenuController', ['$scope', '$rootScope', function($scope, $rootScope) {

  // ------------------------------------------------------
  // init scope
  // ------------------------------------------------------
  $scope.playerName = '';

  // ------------------------------------------------------
  // events
  // ------------------------------------------------------
  
  /**
   * pass the playerName of the targetScope onto this scope
   */
  var unbind = $rootScope.$on('::changePlayerEvent', function(args, playerName){
    if(playerName && playerName !== '') {
      $scope.playerName = playerName;
      args.stopPropagation(); // ok - done here
    }
  });
  $scope.$on('$destroy', unbind);

  /**
   * we want to change the player, the logic to do this is in a different
   * controller, pass on the message to do so!
   */
  $scope.changePlayerName = function() {
    $rootScope.$emit('::startChangePlayerEvent');
  }

}]);


// ------------------------------------------------------
// IntroController
// ------------------------------------------------------
calcApp.controller('IntroController', ['$scope',
  '$rootScope',
  'storageService',
  '$location',
  '$modal',
  '$http',
  function ($scope, $rootScope, storageService, $location, $modal, $http) {

  // ------------------------------------------------------
  // init scope
  // ------------------------------------------------------
  $scope.playerName = '';
  $scope.CalcApp = {};

  // ------------------------------------------------------
  // actions / events
  // ------------------------------------------------------

  $scope.ok = function(valid) {
    if(!valid) {
      return;
    }

    try {
      $scope.CalcApp.user = $scope.playerName;
      // save the entry
      storageService.set('CalcApp', $scope.CalcApp);
    
      // tell other controllers, that the playerName has changed
      $rootScope.$emit('::changePlayerEvent', $scope.CalcApp.user);

      // start with the game
      $location.path('/');

    } catch(err) {
      console.log(err);
      alert('Ein Fehler ist aufgetreten!');
    }
  };

}]);


// ------------------------------------------------------
// MainController
// ------------------------------------------------------
calcApp.controller('MainController', ['$scope',
  '$rootScope',
  'storageService',
  '$location',
  '$modal',
  '$http',
  function ($scope, $rootScope, storageService, $location, $modal, $http) {

  // ------------------------------------------------------
  // init scope
  // ------------------------------------------------------
  $scope.CalcApp = {};
  $scope.playerName = '';


  // ------------------------------------------------------
  // actions / events
  // ------------------------------------------------------

  /**
   * use angular-ui to open a modal dialog
   * messages are passed between different controllers by means of $rootScope events
   */
  $scope.modalOpen = function() {
    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      scope: $scope,
      controller: ModalInstanceCtrl,
      resolve: {
        items: function () {
          return;
        }
      }
    });

    /**
     * result of the operation
     * use the playerName - pass it to the local scope and
     * inform listeners about this change!
     */
    modalInstance.result.then(function (playerName) {
      $scope.playerName = playerName;

      try {
        $scope.CalcApp.user = $scope.playerName;
        // save the entry
        storageService.set('CalcApp', $scope.CalcApp);
      
        // tell other controllers, that the playerName has changed
        $rootScope.$emit('::changePlayerEvent', $scope.CalcApp.user);

      } catch(err) {
        console.log(err);
        alert('Ein Fehler ist aufgetreten!');
      }

    }, function () {
    });
  };


  // Please note that $modalInstance represents a modal window (instance) dependency.
  // It is not the same as the $modal service used above.
  var ModalInstanceCtrl = function ($scope, $modalInstance) {

    $scope.ok = function (valid) {
      if(valid) {
        $modalInstance.close(this.playerName);
      } else {
        alert("Es ist ein Fehler passiert - die Eingabe ist nicht gültig!");
        $location.path('/');
      }
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

  /**
   * trigger the validate event to check the input data against the
   * backend logic
   */
  $scope.validateResults = function() {
    $rootScope.$emit('::validateResultsEvent');
  }


  // ------------------------------------------------------
  // event bus
  // ------------------------------------------------------

  /**
   * event handling. a change of player was requestd, display the modal dialog
   */
  var changePlayer = $rootScope.$on('::startChangePlayerEvent', function(args){
    args.stopPropagation(); // stop the event here
    $scope.modalOpen();
  });
  $scope.$on('$destroy', changePlayer);

  /**
   * fetch calculation event
   */
  var newCalculation = $rootScope.$on('::fetchNewCalculationEvent', function(args, level){
    args.stopPropagation(); // stop the event here
    console.log('Fetch calculation! ' + level);

    $http.get('./api/1.0/calculation/' + level).success(function(data) {

      // got the data - preset the selection
      $scope.CalcApp.calculation = data;
      console.log($scope.CalcApp);

    })
    .error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });

  });
  $scope.$on('$destroy', newCalculation);

  /**
   * validate the input data 
   */
  var valideResults = $rootScope.$on('::validateResultsEvent', function(args) {
    
    var postData = JSON.stringify($scope.CalcApp);
    $http({
        url: './api/1.0/calculation',
        method: 'POST',
        data: postData,
        headers: {'Content-Type': 'application/json'}
    }).success(function(data) {

      if(data && data.user === $scope.CalcApp.user && data.calculation.entries &&
        data.calculation.entries.length === $scope.CalcApp.calculation.entries.length) {
        $scope.CalcApp = data;
      }
    })
    .error(function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });

  });
  $scope.$on('$destroy', valideResults);


  // ------------------------------------------------------
  // startup events
  // ------------------------------------------------------

  // check if there is a local user
  if(storageService.get('CalcApp') && storageService.get('CalcApp').user) {
    $scope.CalcApp.user = $scope.playerName = storageService.get('CalcApp').user;
    $scope.CalcApp.level = storageService.get('CalcApp').level || 1;

    // tell other controllers, that the playerName has changed
    $rootScope.$emit('::changePlayerEvent', $scope.playerName);

    // highscores, etc ...
    
    $rootScope.$emit('::fetchNewCalculationEvent', $scope.CalcApp.level);

  } else {
    // no object or user here - display a friendly reminder
    // $scope.modalOpen();

    // $scope.CalcApp.level = 1; // start with this level
    // $scope.$emit('::fetchNewCalculationEvent', $scope.CalcApp.level);

    $location.path('/intro');
    return;
  }

  

}]);
