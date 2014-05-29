'use strict';

/* Controllers */

calcApp.controller('MenuController', ['$scope', '$rootScope', function($scope, $rootScope) {

  // ------------------------------------------------------
  // init scope
  // ------------------------------------------------------
  $scope.playerName = 'NIEMAND';

  // ------------------------------------------------------
  // events
  // ------------------------------------------------------
  
  /**
   * pass the playerName of the targetScope onto this scope
   */
  var unbind = $rootScope.$on('::changePlayerEvent', function(args){
    $scope.playerName = args.targetScope.playerName;
    args.stopPropagation(); // ok - done here
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


calcApp.controller('MainController', ['$scope','$rootScope', 'storageService','$location', '$modal', function ($scope, $rootScope, storageService, $location, $modal) {

  var calcApp = {};

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
        calcApp.user = $scope.playerName;
        // save the entry
        storageService.set('CalcApp', calcApp);
      
        // tell other controllers, that the playerName has changed
        $scope.$emit('::changePlayerEvent');

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
   * event handling. a change of player was requestd, display the modal dialog
   */
  var unbind = $rootScope.$on('::startChangePlayerEvent', function(args){
    args.stopPropagation(); // stop the event here
    $scope.modalOpen();
  });
  $scope.$on('$destroy', unbind);


  // ------------------------------------------------------
  // startup events
  // ------------------------------------------------------

  // check if there is a local user
  if(storageService.get('CalcApp') && storageService.get('CalcApp').user) {
    $scope.CalcApp.user = storageService.get('CalcApp').user;
    calcApp.user = $scope.CalcApp.user;
    $scope.playerName = calcApp.user;

  // tell other controllers, that the playerName has changed
    $scope.$emit('::changePlayerEvent');

    // highscores, etc ...
    

  } else {
    // no object or user here - display a friendly reminder
    $scope.modalOpen();
  }

  

}]);
