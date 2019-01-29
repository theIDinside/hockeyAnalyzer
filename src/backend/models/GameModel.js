const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// This is the full model for all game stats, provided by www.nhl.com

/// Recording individual player data for every game, can later on be used for individual player trends, something that is worth
/// taking note of, when analyzing what the most likely outcome will be of an upcoming game. Initially, this will be excluded from our analysis,
/// until, it's been figured out, how to take this data into consideration regarding the simulation/analysis. The data will however be scraped,
/// together with general game team stats, so this data will be available in the future.
let PlayerGameModelSchema = new Schema({
    jersey:         Number,
    name:           String,
    position:       String,
    goals:          Number,
    assists:        Number, 
    points:         Number,
    difference:     Number,
    penaltyMinutes: Number,
    shotsOnGoal:    Number,
    hits:           Number,
    blockedShots:   Number,
    giveAways:      Number,
    takeAways:      Number,
    faceOffWins:    Number,
    timeOnIce:      { minutes: Number, seconds: Number },
    ppTimeOnIce:    { minutes: Number, seconds: Number },
    pkTimeOnIce:    { minutes: Number, seconds: Number },
});

let GoalieGameModelSchema = new Schema({
    jersey: Number,
    name: String,
    evenStrength: { shots: Number, saves: Number },
    powerPlay: { shots: Number, saves: Number },
    penaltyKill: { shots: Number, saves: Number },
    savePercentage: Number,
    penaltyMinutes: Number,
    timeOnIce: { minutes: Number, seconds: Number },
});


let GameModelSchema = new Schema({
    gameID:         { type: String, required: true, max: 25},
    teams:          { home: String,  away: String },
    datePlayed:     { type: Date, required: true },
    finalResult:    { home: Number, away: Number },
    shotsOnGoal:    { home: Number, away: Number },
    faceOffWins:    { home: Number, away: Number },
    powerPlay:      { home: { pps: Number, goals: Number }, away: { pps: Number, goals: Number } },
    penaltyMinutes: { home: Number, away: Number },
    hits:           { home: Number, away: Number },
    blockedShots:   { home: Number, away: Number },
    giveAways:      { home: Number, away: Number },
    playersHome: {
        players: [PlayerGameModelSchema], // each game, will have a subdocument included for every player who participated in the game
        goalies: [GoalieGameModelSchema]
    },
    playersAway: {
        players: [PlayerGameModelSchema],
        goalies: [GoalieGameModelSchema]
    }
});