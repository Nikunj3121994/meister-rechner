/*
 * calculation controller provides the logic for
 * calucation, levels, highscores, ...
 * calculation.js created by Henrik Binggl
 */
'use strict';

var version = require('../config/version');
var calculation = require('../config/calculation');


/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * create a calculation
 */
function getCalculation(maxNumber) {
  var calc = {},
      num1 = 0,
      num2 = 0,
      operation = 0;    // 0 = +, 1 = -

  num1 = getRandomInt(0, maxNumber);
  if(num1 === 0) {
    num1 = getRandomInt(1, maxNumber);
  }
  num2 = getRandomInt(0, maxNumber);
  if(num2 === 0) {
    num2 = getRandomInt(1, maxNumber);
  }

  operation = getRandomInt(0, 1);

  calc.num1 = num1;
  calc.num2 = num2;
  calc.operation = operation;

  // prevent negative numbers
  if(operation === 1) {
    if(num1 < num2) {
      calc.num1 = num2;
      calc.num2 = num1;
    }
  } else {
    // prevent that the sum of the numbers is greater than the maxNumber
    if((calc.num1 + calc.num2) > maxNumber) {
      calc.num1 = maxNumber - calc.num1;
      
      if((calc.num1 + calc.num2) > maxNumber) {
        calc.num2 = maxNumber - calc.num2;
      }
    }
  }
  return calc;
}

/*
 * url: /calculation/:level
 * get a document by the given id
 */
exports.newCalculation = function(req, res){
  var level = req.params.level,
      maxNumber,
      calc;

  if(level > 0 && level <= calculation.levels) {
    // create calculations in the range from 0 to maxNumber    
    maxNumber = calculation.level[level-1].maxNumber;

    calc = {};
    calc.maxNumber = maxNumber;
    calc.entries = [];
    for(var i=0;i<6;i++) {
      calc.entries.push(getCalculation(maxNumber));
    }

    res.json(calc);
  } else {
    return res.send('Wrong level parameter supplied! ', 500);
  }

  
};