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
var randomstring = require('randomstring');
var fs = require('fs');
var path = require('path');
var async = require('async');

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
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

  // not the same numbers
  if(calc.num1 === calc.num2) {
    calc.num1 += 1;
  }

  if(calc.num2 === 0) {
    calc.num2 += 1;
  }

  if(calc.num1 === 0) {
    calc.num1 += 1;
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


/*
 * url: /savescore
 * save the current user-score
 */
exports.saveScore = function(req, res) {
  var userScore,
      uniqueId = '',
      payload = '',
      fileName = '';
    
  userScore = req.body;

  logger.dump(userScore);

  uniqueId = userScore.uid;
  if(!uniqueId || uniqueId === '') {
    uniqueId = randomstring.generate(5);
    userScore.uid = uniqueId;
  }

  // take the object and persist it on the filesystem
  payload = JSON.stringify(userScore);
  fileName = path.join(__dirname, '../../store', uniqueId + '.json');

  fs.writeFile(fileName, payload, function(err) {
    if(err) {
      console.log('Got an error: ' + err);
      console.log(err.stack);
      return res.send('Could not save the user-score! ' + err, 500);
    } else {
      return res.send(uniqueId, 200);
    }
  });
};


/*
 * url: /getscore
 * get the score for a given id
 */
exports.getScore = function(req, res) {
  var userScore,
      fileName,
      uid = req.params.uid;

  fileName = path.join(__dirname, '../../store', uid + '.json');

  async.waterfall([
    function(callback){
      fs.exists(fileName, function (exists) {
        if(!exists) {
          return callback('Does not exist!');
        }
        callback(null);
      });
    },
    function(callback){
      fs.readFile(fileName, function (err, data) {
        if (err) {
          return callback(err);
        }
        userScore = JSON.parse(data);
        callback(null, userScore);
      });
    }
  ], function (err, result) {
    if(err) {
      console.log('Got an error: ' + err);
      console.log(err.stack);
      return res.send('Could not get the user-score! ' + err, 500);
    }

    base.jsonNoCache(res, result);
  });

};