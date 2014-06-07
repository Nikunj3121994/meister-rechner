/*
 * calculation controller provides the logic for
 * calucation, levels, highscores, ...
 * calculation.js created by Henrik Binggl
 */
'use strict';

var calculation = require('../config/calculation');
var base = require('./base');
var logger = require('../util/logger' );
var _ = require('lodash');

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return _.random(min, max);
}

/**
 * create a calculation
 */
function getCalculation(minNumber, maxNumber) {
  var calc = {},
      num1 = 0,
      num2 = 0,
      operation = 0;    // 0 = +, 1 = -

  num1 = getRandomInt(minNumber, maxNumber);
  if(num1 === 0) {
    num1 = getRandomInt(minNumber, maxNumber);
  }
  num2 = getRandomInt(minNumber, maxNumber);
  if(num2 === 0) {
    num2 = getRandomInt(minNumber, maxNumber);
  }

  console.log('num1: ' + num1);
  console.log('num2: ' + num2);

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
 * create a calculation for a given level
 */
exports.newCalculation = function(req, res){
  var level = req.params.level,
      maxNumber,
      calc,
      minNumber = 1;

  if(level > 0 && level <= calculation.levels) {
    // create calculations in the range from 0 to maxNumber    
    maxNumber = calculation.level[level-1].maxNumber;
    minNumber = calculation.level[level-1].minNumber;

    calc = {};
    calc.maxNumber = maxNumber;
    calc.entries = [];

    for(var i=0;i<6;i++) {
      console.log('min: ' + minNumber + ' max: ' + maxNumber);
      calc.entries.push(getCalculation(minNumber, maxNumber));
    }

    base.jsonNoCache(res, calc);
  } else {
    return res.send('Wrong level parameter supplied! ', 500);
  }
};

/*
 * url: /calculation
 * verify the calculation
 */
exports.verifyCalculation = function(req, res) {
  var toVerify,
      check = false,
      numCorrect = 0,
      level = 0;

  try {

    toVerify = req.body;
    
    _.forEach(toVerify.calculation.entries, function(item) {
      check = false;
      if(item.operation === 0) {
        check = (item.num1 + item.num2 === item.result);
      } else if(item.operation === 1) {
        check = (item.num1 - item.num2 === item.result);
      }
      if(check === true) {
        numCorrect += 1;
      }
      item.check = check;
    });

    toVerify.score = calculation.scores[numCorrect];
    toVerify.totalScore = toVerify.totalScore + toVerify.score;
    // recalculate the level
    _.forEach(calculation.level, function(item, index) {

      if(toVerify.totalScore > item.score) {
        level = index;
        level += 1; // 0-based index
        level += 1; // level-score is the upper-bound, so we are in the next level

        if(level >= calculation.levels) { // limit to max level
          level = calculation.levels;
        }
      }
    });
    if(level === 0) { // not enough score
      level = 1;
    }
    toVerify.level = level;

    logger.dump(toVerify);

    base.jsonNoCache(res, toVerify);

  } catch(err) {
    console.log('Got an error: ' + err);
    console.log(err.stack);
  }
  
};