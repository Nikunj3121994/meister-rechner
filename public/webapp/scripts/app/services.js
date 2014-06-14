'use strict';

/* Services */

/**
 * the storageService abstracts the handling of local-storage
 */
calcApp.factory('storageService', ['$rootScope', function($rootScope) {
  
  /**
   * Pass any type of a string from the localStorage to be parsed so it returns a usable version (like an Object)
   * @see http://jsfiddle.net/agrublev/QjVq3/
   * @param res - a string that will be parsed for type
   * @returns {*} - whatever the real type of stored value was
   */
  function parseValue(res) {
    var val;
    try {
      val = JSON.parse(res);
      if (typeof val === 'undefined'){
        val = res;
      }
      if (val === 'true'){
        val = true;
      }
      if (val === 'false'){
        val = false;
      }
      if (parseFloat(val) === val && !angular.isObject(val) ){
        val = parseFloat(val);
      }
    } catch(e){
      val = res;
    }
    return val;
  }


  return {
    get: function (key) {
      var value, data = null;
      value = localStorage.getItem(key);
      if(value) {
        data = parseValue(value);
      }
      return data;
    },

    set: function (key, data) {
      localStorage.setItem(key, JSON.stringify(data));
    },

    remove: function (key) {
      localStorage.removeItem(key);
    },
      
    clearAll : function () {
      localStorage.clear();
    }
  };
}]);


/**
 * service to retrieve the stored user-object
 */
calcApp.factory('userService', ['$rootScope', 'storageService', function($rootScope, storageService) {
  var CalcApp = {};

  return {
    /**
     * retrieve the necessary data for the user object
     */
    get: function() {
      // check if there is a local user
      if(storageService.get('CalcApp') && storageService.get('CalcApp').user) {
        CalcApp.user = storageService.get('CalcApp').user;
        CalcApp.level = storageService.get('CalcApp').level || 1;
        CalcApp.levelDisplay = CalcApp.level;
        CalcApp.totalScore = storageService.get('CalcApp').totalScore || 0;
        CalcApp.totalScoreDisplay = CalcApp.totalScore;
        CalcApp.validated = false;
        CalcApp.uid = storageService.get('CalcApp').uid;

        return CalcApp;
      } else {
        return null;
      }
    },
    /**
     * save the object 
     */
    set: function(object) {
      storageService.set('CalcApp', object);
    }
  };
}]);