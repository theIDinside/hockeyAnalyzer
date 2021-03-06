const mongoose = require('mongoose');
let Schema = mongoose.Schema;
const {TeamTotal, PlayerStat, GoalieStat} = require('../../scrape/GameStats');
const {Goal} = require('../../data/Goal');
const {Time} = require('../../util/Time');
const {GameData} = require("../../data/GameData")

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
        enum: ['Even', 'Even Penalty Shot', 'Penalty Shot', 'Even Empty Net', 'Power Play', 'Short Handed', 'Short Handed Empty Net', 'Short Handed Penalty Shot', "Power Play Empty Net", "Power Play Penalty Shot", "Shootout"]
    },
    scoringTeam: String,
    goalScorer: String,
    assists: [String],
});

function toGoalData(g) {
    return new Goal(g.goal, g.period, new Time(g.time.minutes, g.time.seconds).toString(), g.strength, g.scoringTeam, g.goalScorer, g.assists[0], g.assists[1]);
}

ScoringSummarySchema.methods.toGoal = function(){
    return new Goal(this.goal, this.period, new Time(this.time.minutes, this.time.seconds).toString(), this.strength, this.scoringTeam, this.goalScorer, [...this.assists])
};


/**
 * Data that get scraped from, for example: https://www.nhl.com/gamecenter/chi-vs-buf/2019/02/01/2018020781#game=2018020781,game_state=final,game_tab=stats
 * (example is URL to game between Chicago Blackhawks vs Buffalo Sabres (N.B! nhl format; Away vs Home)
 */
let GameModelSchema = new Schema({
    gameID:         { type: Number, required: true, unique: true},
    teams:          {
        type: { away: String,  home: String },
        required: true
    },
    teamWon: {
        type:  String,
        required: true
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

GameModelSchema.methods.getGameID = function(){
    return this.gameID;
};

GameModelSchema.post('save', (gameDoc) => {
    console.log(`Saved game ${gameDoc.gameID}, successfully to database. ${gameDoc.teams.away} vs ${gameDoc.teams.home}`)
});

GameModelSchema.methods.getTeams = function(){
    return [this.teams.home, this.teams.away];
};

GameModelSchema.methods.getTotalShots = function(){
    for(let period of this.shotsOnGoal) {

    }
};

GameModelSchema.methods.getTeamStats = function(){
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


/**
 * Converts the GameModel, a MongoDB type (Extended from Model<*>) to our own Javascript type GameData. That way we
 * are not sending GameModel types over the network to the browser.
 * @returns {GameData}
 */
GameModelSchema.methods.toGameData = function() {
    return new GameData(this.gameID, this.teams.away, this.teams.home, this.datePlayed, this.finalResult, this.shotsOnGoal, this.faceOffWins, this.powerPlay, this.penaltyMinutes, this.hits, this.blockedShots, this.giveAways, this.scoringSummary.map(g => g.toGoal()));
};


GameModelSchema.methods.getGoals = function(period=0) {
    return this.scoringSummary.reduce((res, goal) => {
        if(goal.scoringTeam === this.teams.away) {
            return {away: res.away +1, home: res.home }
        } else {
            return {away: res.away, home: res.home + 1 }
        }
    }, {away: 0, home: 0});
};

GameModelSchema.methods.getGoalsByHomeTeam = function(){
    let goals = [0, 0, 0];
        for(let g of this.scoringSummary) {
            if(g.scoringTeam === this.teams.home) {
                goals[g.period - 1]++;
            }
        }
    return goals;
};

GameModelSchema.methods.getGoalsByAwayTeam = function(){
    let goals = [0, 0, 0];
        for(let g of this.scoringSummary) {
            if(g.scoringTeam === this.teams.away) {
                goals[g.period - 1]++;
            }
        }
    return goals;
};

GameModelSchema.methods.getFinalResult = function(){
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
    try {
        let game = {
            gameID: Number.parseInt(gameId),
            teams: { 
                away: aTeam.name, 
                home: hTeam.name
            },
            datePlayed: new Date(date),
            finalResult: finalResult,
            teamWon: (finalResult.home > finalResult.away ? hTeam.name : aTeam.name),
            shotsOnGoal: shotsOnGoal,
            faceOffWins: { 
                away: aTeam.faceoffWins, 
                home: hTeam.faceoffWins
            },
            powerPlay: {
                away: {goals: aTeam.ppGoals, total: aTeam.ppAttempts},
                home: {goals: hTeam.ppGoals, totals: hTeam.ppAttempts}
            },
            penaltyMinutes: {
                away: aTeam.penaltyMinutes, 
                home: hTeam.penaltyMinutes
            },
            hits: { 
                away: aTeam.hitsMade, 
                home: hTeam.hitsMade
            },
            blockedShots: { 
                away: aTeam.shotsBlocked, 
                home: hTeam.shotsBlocked
            },
            giveAways: {
                away: aTeam.giveAways, 
                home: hTeam.giveAways
            },
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
    } catch(err) {
        throw err;
    }
}

async function getLastXGames(x, team, wins=false) {
    const {dateStringify} = require("../../util/utilities");
    let dateSort = {datePlayed: -1}; // descending sort
    if(wins) {
        return Game.find({"teamWon": team}).sort(dateSort).limit(x).then(games => {
            if(games.length > 0) {
                // TODO: Remove this logging to the console once fully functional and containing no issues.
                console.log(`Found: ${games.length} games with ${team} playing.`);
                console.log(`These are the games:`);
                for(let g of games) {
                    console.log(`Game: ${g.gameID}\t "${g.teams.away} vs ${g.teams.home}".\t Date played: ${dateStringify(g.datePlayed)}`);
                }
                return games;
            } else {
                throw new Error(`Could not find any games with team ${team}`);
            }
        });
    } else {
        return Game.find({$or: [{"teams.home": team}, {"teams.away": team}]}).sort(dateSort).limit(x).then(games => {
            if(games.length > 0) {
                // TODO: Remove this logging to the console once fully functional and containing no issues.
                console.log(`Found: ${games.length} games with ${team} playing.`);
                console.log(`These are the games:`);
                for(let g of games) {
                    console.log(`Game: ${g.gameID}\t "${g.teams.away} vs ${g.teams.home}".\t Date played: ${dateStringify(g.datePlayed)}`);
                }
                return games;
            } else {
                throw new Error(`Could not find any games with team ${team}`);
            }
        });
    }
}


module.exports = {
    Game, ScoringSummary, GamePlayer, createGameDocument };