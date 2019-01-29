const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PlayerModelSchema = new Schema({
    team:               String,
    jersey:             Number,
    name:               String,
    age:                Number,
    position:           String,         // LW, C, RW, LD, RD
    gamesPlayed:        Number,
    goals:              Number,
    assists:            Number,
    points:             Number, 
    difference:         Number,         // the +/- statistics 
    penaltyMinutes:     Number,         // full PIM are calculated. So if a goal is scored against during pk, the full PK period is still counted here.
    powerPlayGoals:     Number,
    powerPlayPoints:    Number,
    shortHandedGoals:   Number,
    shortHandedPoints:  Number,
    gameWinningGoals:   Number,
    overtimeGoals:      Number,
    shots:              Number,
    shootingPercentage: Number    
});