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
    position:       { type: String, enum: ["Forward", "Defense"] },
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

let ScoringSummarySchema = new Schema({
    goal: Number,
    period: Number,
    time: String,
    strength: {
        type: String,
        required: true,
        enum: ['Even', 'Penalty Shot', 'Even Empty Net']
    },
    team: String,
    goalScorer: String,
    assists: [String],
});


/**
 * Data that get scraped from, for example: https://www.nhl.com/gamecenter/chi-vs-buf/2019/02/01/2018020781#game=2018020781,game_state=final,game_tab=stats
 * (example is URL to game between Chicago Blackhawks vs Buffalo Sabres (N.B! nhl format; Away vs Home)
 */
let GameModelSchema = new Schema({
    gameID:         { type: String, required: true, unique: true},
    teams:          { away: String,  home: String, required: true },
    datePlayed:     { type: Date, required: true },
    finalResult:    { away: Number, home: Number, required: true  },
    shotsOnGoal:    {
        type: [{ away: Number, home: Number}],
        validate: {
            validator: (periods) => periods.length >= 3,
            messsage: props => `You must provide stats for 3 periods at least, you provided ${props.value.length} periods`
        }
    },
    faceOffWins:    { away: Number, home: Number, required: true  },
    powerPlay:      { away: { pps: Number, goals: Number }, home: { pps: Number, goals: Number } },
    penaltyMinutes: { away: Number, home: Number },
    hits:           { away: Number, home: Number },
    blockedShots:   { away: Number, home: Number },
    giveAways:      { away: Number, home: Number },
    playersHome: {
        players: [PlayerGameModelSchema], // each game, will have a subdocument included for every player who participated in the game
        goalies: [GoalieGameModelSchema]
    },
    playersAway: {
        players: [PlayerGameModelSchema],
        goalies: [GoalieGameModelSchema]
    },
    scoringSummary: [ScoringSummarySchema]
});

GameModelSchema.methods.getTeams = () => {
    return [this.teams.home, this.teams.away];
}

GameModelSchema.methods.getTotalShots = () => {
    for(let period of this.shotsOnGoal) {

    }
}




