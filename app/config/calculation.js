'use strict';

var calculation = {};

// define the possible levels
calculation.levels = 5;
calculation.scores = [];
// define the possible scores
calculation.scores[0] = 0;
calculation.scores[1] = 0;
calculation.scores[2] = 1;
calculation.scores[3] = 2;
calculation.scores[4] = 3;
calculation.scores[5] = 5;
calculation.scores[6] = 10;

calculation.level = [];
calculation.level[0] = {};
calculation.level[0].score = 30;
calculation.level[0].minNumber = 1;
calculation.level[0].maxNumber = 10;

calculation.level[1] = {};
calculation.level[1].score = 60;
calculation.level[1].minNumber = 5;
calculation.level[1].maxNumber = 20;

calculation.level[2] = {};
calculation.level[2].score = 90;
calculation.level[2].minNumber = 10;
calculation.level[2].maxNumber = 30;

calculation.level[3] = {};
calculation.level[3].score = 120;
calculation.level[3].minNumber = 10;
calculation.level[3].maxNumber = 40;

calculation.level[4] = {};
calculation.level[4].score = 150;
calculation.level[4].minNumber = 10;
calculation.level[4].maxNumber = 50;

module.exports = calculation;