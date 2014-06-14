'use strict';

/**
 * define Event constants 
 */
var Events = {
  START_CHANGE_PLAYER:    '::startChangePlayerEvent',
  CHANGE_PLAYER:          '::changePlayerEvent',
  VALIDATE_RESULT:        '::validateResultsEvent',
  FETCH_NEW_CALCULATION:  '::fetchNewCalculationEvent'
};

/* Controllers */

// ------------------------------------------------------
// MenuController
// ------------------------------------------------------
calcApp.controller('SettingsController', ['$scope', '$rootScope', '$http', 'userService', function($scope, $rootScope, $http, userService) {
  $scope.CalcApp = {};
  $scope.saveSuccess = false;
  $scope.loadSuccess = false;

  // ------------------------------------------------------
  // actions
  // ------------------------------------------------------

  $scope.save = function() {
    var postData = JSON.stringify($scope.CalcApp);
    $http({
        url: './api/1.0/savescore',
        method: 'POST',
        data: postData,
        headers: {'Content-Type': 'application/json'}
    }).success(function(data) {

      if(data) {
        $scope.CalcApp.uid = data;
        $scope.saveSuccess = true;
        userService.set($scope.CalcApp);
      }
    })
    .error(function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });
  };

  $scope.load = function(valid) {
    if(!valid) {
      alert('Kein gültiger Code wurde eingegeben!');
      return;
    }

    $http.get('./api/1.0/getscore/' + $scope.fetchCode).success(function(data) {

      $scope.CalcApp = data;
      $scope.loadSuccess = true;
      userService.set($scope.CalcApp);

    })
    .error( function(data, status, headers) {
      alert('Error: ' + data + '\nHTTP-Status: ' + status);
    });
  }

  // ------------------------------------------------------
  // events
  // ------------------------------------------------------
  
  /**
   * pass the playerName of the targetScope onto this scope
   */
  var unbind = $rootScope.$on(Events.CHANGE_PLAYER, function(args, playerName){
    if(playerName && playerName !== '') {
      $scope.CalcApp.user = playerName;
      args.stopPropagation(); // ok - done here
    }
  });
  $scope.$on('$destroy', unbind);


  // ------------------------------------------------------
  // startup events
  // ------------------------------------------------------
  $scope.CalcApp = userService.get();

}]);


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
  var unbind = $rootScope.$on(Events.CHANGE_PLAYER, function(args, playerName){
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
    $rootScope.$emit(Events.START_CHANGE_PLAYER);
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
      $rootScope.$emit(Events.CHANGE_PLAYER, $scope.CalcApp.user);

      // start with the game
      $location.path('/');

    } catch(err) {
      console.log(err);
      alert('Ein Fehler ist aufgetreten!');
    }
  };


  // ------------------------------------------------------
  // startup events
  // ------------------------------------------------------

  // check if there is a local user
  if(storageService.get('CalcApp') && storageService.get('CalcApp').user) {
    $scope.CalcApp.user = $scope.playerName = storageService.get('CalcApp').user;
    $scope.CalcApp.level = storageService.get('CalcApp').level || 1;
    $scope.CalcApp.levelDisplay = $scope.CalcApp.level;
    $scope.CalcApp.totalScore = storageService.get('CalcApp').totalScore || 0;
    $scope.CalcApp.totalScoreDisplay = $scope.CalcApp.totalScore;
    $scope.CalcApp.validated = false;

    $scope.playerName = $scope.CalcApp.user;
  }


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
        $rootScope.$emit(Events.CHANGE_PLAYER, $scope.CalcApp.user);

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
    $rootScope.$emit(Events.VALIDATE_RESULT);
  };

  /**
   * the results were validated, get me some new calculations
   */
  $scope.next = function() {
    try {
      $scope.CalcApp.totalScoreDisplay = $scope.CalcApp.totalScore;
      $scope.CalcApp.levelDisplay = $scope.CalcApp.level;
      $scope.CalcApp.score = undefined;
      $scope.CalcApp.calculation = undefined;
      $scope.CalcApp.validated = false;

      // save the current values
      storageService.set('CalcApp', $scope.CalcApp);

      // get me fresh calculations
      $rootScope.$emit(Events.FETCH_NEW_CALCULATION, $scope.CalcApp.level);
    } catch(err) {
      console.log('Error: ' + err);
      alert('An error occured: ' + err);
    }
  };


  // ------------------------------------------------------
  // event bus
  // ------------------------------------------------------

  /**
   * event handling. a change of player was requestd, display the modal dialog
   */
  var changePlayer = $rootScope.$on(Events.START_CHANGE_PLAYER, function(args){
    args.stopPropagation(); // stop the event here
    $scope.modalOpen();
  });
  $scope.$on('$destroy', changePlayer);

  /**
   * fetch calculation event
   */
  var newCalculation = $rootScope.$on(Events.FETCH_NEW_CALCULATION, function(args, level){
    args.stopPropagation(); // stop the event here
    console.log('Fetch calculation! ' + level);
    $scope.CalcApp.validated = false;
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
  var valideResults = $rootScope.$on(Events.VALIDATE_RESULT, function(args) {
    $scope.CalcApp.validated = false;
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

        $scope.CalcApp.validated = true;
      }
    })
    .error(function(data, status, headers) {
      $scope.CalcApp.validated = false;
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
    $scope.CalcApp.levelDisplay = $scope.CalcApp.level;
    $scope.CalcApp.totalScore = storageService.get('CalcApp').totalScore || 0;
    $scope.CalcApp.totalScoreDisplay = $scope.CalcApp.totalScore;
    $scope.CalcApp.validated = false;

    // tell other controllers, that the playerName has changed
    $rootScope.$emit(Events.CHANGE_PLAYER, $scope.playerName);

    // highscores, etc ...
    
    $rootScope.$emit(Events.FETCH_NEW_CALCULATION, $scope.CalcApp.level);

  } else {

    $location.path('/intro');
    return;
  }

}]);
