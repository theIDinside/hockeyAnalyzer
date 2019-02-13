const mongoose = require('mongoose');
let Schema = mongoose.Schema;


/**
 * This is the schema for the individual player stats, not the stats that can be scraped from the game summaries.
 */
let PlayerModelSchema = new Schema({
    scoringTeam:               String,
    jersey:             Number,
    name:               String,
    age:                Number,
    position:           String,         // LW, C, RW, LD, RD
    gamesPlayed:        Number,
    goals:              Number,
    assists:            Number,
    points:             Number, 
    difference:         Number,         // the +/- statistics 
    penaltyMinutes:     Number,         // full pim are calculated. So if a goal is scored against during pk, the full PK period is still counted here.
    powerPlayGoals:     Number,
    powerPlayPoints:    Number,
    shortHandedGoals:   Number,
    shortHandedPoints:  Number,
    gameWinningGoals:   Number,
    overtimeGoals:      Number,
    shots:              Number,
    shootingPercentage: Number    
});