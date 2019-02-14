const mongoose = require('mongoose');
let Schema = mongoose.Schema;
const {TeamTotal, PlayerStat, GoalieStat} = require('../../scrape/GameStats');
const {Goal} = require('../../scrape/ScoringSummary');
const {Time} = require('../../util/Time');
// This is the full model for all game stats, provided by www.nhl.com

/// Recording individual player data for every game, can later on be used for individual player trends, something that is worth
/// taking note of, when analyzing what the most likely outcome will be of an upcoming game. Initially, this will be excluded from our analysis,
/// until, it's been figured out, how to take this data into consideration regarding the simulation/analysis. The data will however be scraped,
/// together with general game scoringTeam stats, so this data will be available in the future.
let PlayerGameModelSchema = new Schema({
    jersey:         Number,
    name:           String,
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
    evenStrength: { saves: Number, shots: Number },
    powerPlay: { saves: Number, shots: Number },
    penaltyKill: { saves: Number, shots: Number },
    savePercentage: Number,
    penaltyMinutes: Number,
    timeOnIce: { minutes: Number, seconds: Number },
});

let ScoringSummarySchema = new Schema({
    goal: Number,
    period: Number,
    time: { type: { minutes: Number, seconds: Number } },
    strength: {
        type: String,
        required: true,
        enum: ['Even', 'Even Penalty Shot', 'Penalty Shot', 'Even Empty Net', 'Power Play', 'Short Handed', 'Short Handed Empty Net', "Power Play Empty Net"]
    },
    scoringTeam: String,
    goalScorer: String,
    assists: [String],
});

ScoringSummarySchema.methods.toGoal = () => {
    return {
        goalNumber: this.goal,
        period: this.period,
        time: new Time(this.time.minutes, this.time.seconds),
        strength: this.strength,
        scoringTeam: this.scoringTeam,
        goalScorer: this.goalScorer,
        assists: this.assists
    }
};


/**
 * Data that get scraped from, for example: https://www.nhl.com/gamecenter/chi-vs-buf/2019/02/01/2018020781#game=2018020781,game_state=final,game_tab=stats
 * (example is URL to game between Chicago Blackhawks vs Buffalo Sabres (N.B! nhl format; Away vs Home)
 */
let GameModelSchema = new Schema({
    gameID:         { type: Number, required: true, unique: true},
    teams:          {
        type: { away: String,  home: String },
        required: true,
    },
    teamWon: {
        type:  String,
        required: true,
        validate: {
            validator: (team) => (team === teams.home || team === teams.away),
            message: m => `Provided winning team isn't even playing in this game. Provided winner: ${m.value}`
        }
    },
    datePlayed:     { type: Date, required: true },
    finalResult:    { type: { away: Number, home: Number }, required: true  },
    shotsOnGoal:    {
        type: [{ away: Number, home: Number}],
        validate: {
            validator: (periods) => periods.length >= 3,
            messsage: props => `You must provide stats for 3 periods at least, you provided ${props.value.length} periods`
        }
    },
    faceOffWins:    { type: { away: Number, home: Number }, required: true },
    powerPlay:      { away: { goals: Number, total: Number }, home: { goals: Number, totals: Number } },
    penaltyMinutes: { away: Number, home: Number },
    hits:           { away: Number, home: Number },
    blockedShots:   { away: Number, home: Number },
    giveAways:      { away: Number, home: Number },
    playersAway: {
            players: {
                type: [PlayerGameModelSchema],
                validate: {
                    validator: (p) => p.length > 0,
                    message: props => `You must provide stats for the players and goalies. You provided ${props.value.length} players`
                }
            }, // each game, will have a subdocument included for every player who participated in the game
            goalies: {
                type: [GoalieGameModelSchema],
                validate: {
                    validator: (p) => p.length > 0,
                    message: props => `You must provide stats for the players and goalies. You provided ${props.value.length} players`
                }
            }
    },
    playersHome: {
        players: {
            type: [PlayerGameModelSchema],
            validate: {
                validator: (p) => p.length > 0,
                message: props => `You must provide stats for the players and goalies. You provided ${props.value.length} players`
            }
        }, // each game, will have a subdocument included for every player who participated in the game
        goalies: {
            type: [GoalieGameModelSchema],
            validate: {
                validator: (p) => p.length > 0,
                message: props => `You must provide stats for the players and goalies. You provided ${props.value.length} players`
            }
        }
    },
    scoringSummary: [ScoringSummarySchema]
});

GameModelSchema.methods.getGameID = () => {
    return this.gameID;
}

GameModelSchema.post('save', (gameDoc) => {
    console.log(`Saved game ${gameDoc.gameID}, successfully to database. ${gameDoc.teams.away} vs ${gameDoc.teams.home}`)
});

GameModelSchema.methods.getTeams = () => {
    return [this.teams.home, this.teams.away];
};

GameModelSchema.methods.getTotalShots = () => {
    for(let period of this.shotsOnGoal) {

    }
};

GameModelSchema.methods.getTeamStats = () => {
    return {
        gameID: this.gameID,
        teams: this.teams,
        datePlayed: this.datePlayed,
        finalResult: this.finalResult,
        shotsOnGoal: this.shotsOnGoal,
        FOW: this.faceOffWins,
        powerPlay: this.powerPlay,
        penaltyMinutes: this.penaltyMinutes,
        hits: this.hits,
        blockedShots: this.blockedShots,
        giveAways: this.giveAways,
    }
};

GameModelSchema.methods.getGoals = (period=0) => {
    return this.scoringSummary.reduce((res, goal) => {
        if(goal.scoringTeam === this.teams.away) {
            return {away: res.away +1, home: res.home }
        } else {
            return {away: res.away, home: res.home + 1 }
        }
    }, {away: 0, home: 0});
};

GameModelSchema.methods.getGoalsByHomeTeam = () => {
    let goals = [0, 0, 0];
        for(let g of this.scoringSummary) {
            if(g.scoringTeam === this.teams.home) {
                goals[g.period - 1]++;
            }
        }
    return goals;
};

GameModelSchema.methods.getGoalsByAwayTeam = () => {
    let goals = [0, 0, 0];
        for(let g of this.scoringSummary) {
            if(g.scoringTeam === this.teams.away) {
                goals[g.period - 1]++;
            }
        }
    return goals;
};

GameModelSchema.methods.getFinalResult = () => {
    return this.finalResult
};


let Game = mongoose.model("Game", GameModelSchema);
let ScoringSummary = mongoose.model("Scoring", ScoringSummarySchema);
let GamePlayer = mongoose.model("Player", PlayerGameModelSchema);

/**
 * Saves a game to the Mongo database.
 * @param gameId {String} - GameID. NHL GameIDs has the format: seasonYear|gameType|gameNumber. A regular season game, has gametype 02. Example of a regular season game of season 2018: 2018020123, where 0123 is the game number.
 * @param date - date the game is played.
 * @param aTeam {TeamTotal} - Team total summary for the away scoringTeam.
 * @param hTeam {TeamTotal} - Team total summary for the home scoringTeam.
 * @param aPlayers - Total statistics for individual players of the away scoringTeam.
 * @param hPlayers - Total statistics for individual players of the home scoringTeam.
 * @param shotsOnGoal {[{away: Number, home: Number}]} - Total shots on goal, by period.
 * @param scoringSummaryArray { ScoringSummary } - An array of goal entries, where each entry describes scorer, assists, players on ice, goal number and what period it was made and at what strength.
 */
async function createGameDocument(gameId, date, aTeam, hTeam, aPlayers, hPlayers, shotsOnGoal, scoringSummaryArray) {
    let finalResult = scoringSummaryArray.finalResult;
    let game = {
        gameID:         Number.parseInt(gameId),
        teams:          { away: aTeam.name,  home: hTeam.name },
        datePlayed:     new Date(date),
        finalResult:    finalResult,
        teamWon: (this.finalResult.home > this.finalResult.away ? this.teams.home : this.teams.away),
        shotsOnGoal:    shotsOnGoal,
        faceOffWins:    { away: aTeam.faceoffWins, home: hTeam.faceoffWins },
        powerPlay:      { away: { goals: aTeam.ppGoals, total: aTeam.ppAttempts }, home: { goals: hTeam.ppGoals, totals: hTeam.ppAttempts } },
        penaltyMinutes: { away: aTeam.penaltyMinutes, home: hTeam.penaltyMinutes },
        hits:           { away: aTeam.hitsMade, home: hTeam.hitsMade },
        blockedShots:   { away: aTeam.shotsBlocked, home: hTeam.shotsBlocked },
        giveAways:      { away: aTeam.giveAways, home: hTeam.giveAways },
        playersAway: {
            players: aPlayers.skaters.map(e => e.model), // each game, will have a subdocument included for every player who participated in the game
            goalies: aPlayers.goalies.map(e => e.model)
        },
        playersHome: {
            players: hPlayers.skaters.map(e => e.model),
            goalies: hPlayers.goalies.map(e => e.model)
        },
        scoringSummary: scoringSummaryArray.summary.map(goal => goal.model)
    };
    return new Game(game);
}

function getGameByNumber(number) {
    let it = '';
    if(number < 1000) {
        if(number < 100) {
            if(number < 10)
                id = `201802000${number}`;
            else {
                id = `20180200${number}`
            }
        } else {
            id = `2018020${number}`
        }
    } else {
        id = `201802${number}`
    }
    let g = Game.findBy({ 'gameID': id });
}

/**
 *
 * @param x
 * @param team
 * @param analyzeCallback {function} - the type of analytical operation to be performed on the last x games.
 * @return {Promise<void>}
 */
async function getLastXGamesPlayedBy(x, team, analyzeCallback) {
    const {dateStringify} = require("../../util/utilities");
    let sortDate = {datePlayed: -1};
    Game.find({$or: [{"teams.home": team}, {"teams.away": team}]})
        .sort(sortDate)
        .limit(x)
        .then((games) => {
            if(games.length > 0) {
                console.log(`Found: ${games.length} games with ${team} playing.`);
                console.log(`These are the games:`)
                for(let g of games) {
                    console.log(`Game: ${g.gameID}\t "${g.teams.away} vs ${g.teams.home}".\t Date played: ${dateStringify(g.datePlayed)}`);
                }
                return analyzeCallback(games);
            }
        });
}

/**
 *
 * @param x
 * @param team
 * @param analyzeCallback {function} - the type of analytical operation to be performed on the last x games.
 * @return {Promise<void>}
 */
async function getLastXGamesWonBy(x, team, analyzeCallback) {
    const {dateStringify} = require("../../util/utilities");
    let sortDate = {datePlayed: -1};
    Game.find({$or: [{"teams.home": team}, {"teams.away": team}], $and: []})
        .sort(sortDate)
        .limit(x)
        .then((games) => {
            if(games.length > 0) {
                console.log(`Found: ${games.length} games with ${team} playing.`);
                console.log(`These are the games:`)
                for(let g of games) {
                    console.log(`Game: ${g.gameID}\t "${g.teams.away} vs ${g.teams.home}".\t Date played: ${dateStringify(g.datePlayed)}`);
                }
                return analyzeCallback(games);
            }
        });
}

module.exports = {
    Game, ScoringSummary, GamePlayer, createGameDocument, getLastXGamesPlayedBy
};