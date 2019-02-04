const mongoose = require('mongoose');
let Schema = mongoose.Schema;
const StandingCollection = "standings";
/**
    This is not a collection that will keep multiple records. It will only keep one, the most current and updated season standing
*/

/// together with general game team stats, so this data will be available in the future.
let SeasonStandings = new Schema({
    position:           Number,
    teamName:           String,
    gamesPlayed:        Number,
    wins:               Number,
    losses:             Number,
    ties:               Number,
    overtimeLosses:     Number,
    points:             Number,
    ROwins:             Number,
    pointsPercentage:   Number,
    goalsFor:           Number,
    goalsAgainst:       Number,
    SOwins:             Number,
    goalsForPerGame:    Number,
    goalsAgainstPerGame:Number,
    powerPlay:          Number,
    penaltyKill:        Number,
    shotsPerGame:       Number,
    shotsAgainstPerGame:Number,
    faceoffWins:        Number,
});