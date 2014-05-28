  'use strict';


function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

/**
 * @see http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
 */
function hashCode(str){
  var hash = 0, i, char;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 *
 * @see http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
 */
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

angular.module('calcApp')
    
    // found here: http://stackoverflow.com/questions/10931315/how-to-preventdefault-on-anchor-tags-in-angularjs
    .directive('a', function() {
        return {
            restrict: 'E',
            link: function(scope, elem, attrs) {
                if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
                    elem.on('click', function(e){
                        e.preventDefault();
                        if(attrs.ngClick){
                            scope.$eval(attrs.ngClick);
                        }
                    });
                }
            }
        };
    });
    
