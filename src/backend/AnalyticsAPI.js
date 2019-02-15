'use strict';
const {getLastXGamesPlayedBy, Game} = require("./models/GameModel");
const GameInfo = require("./models/GameInfoModel");
const {Team} = require("./Team");
const {GameData} = require("../data/GameData");

// File that defines functions for analyzing team & player trends. This will contains basically all functionality this
// application is supposed to provide to the user.

/**
 *
 * @param team
 * @param lastGames
 * @param period
 * @return {Promise<{period: Number, GFAverage: Number}>}
 * @constructor
 */
async function GFPeriodAverage(team, lastGames, period) {
    let GFAverage = await getLastXGamesPlayedBy(lastGames, team, (games) => {
        // oh the lovely universe of functional programming.
        return games.map(g => g.toGameData()).map(gd => gd.getGoalsByPeriod(team, period)).reduce((res, goals) => res + goals, 0) / lastGames;
    });
    return { period: period, GFAverage: GFAverage }
}

/**
 *
 * @param team {Team}
 * @param games {GameData[]}
 * @return {Promise<{games: Number, GFAverage: Number}>}
 * @constructor
 */
async function GFGameAverage(team, lastGames) {
    return {
        games: lastGames, GFAverage: await getLastXGamesPlayedBy(lastGames, team, (games) => {
            // oh the lovely universe of functional programming.
            return games.map(g => g.toGameData()).map(gd => gd.getGoalsBy(team)).reduce((res, goals) => res + goals, 0) / lastGames;
        })
    };
}

/** TODO:
 * Function that analyses @param period, in each game in the array @param games, and returns goals against average.
 * @param team {Team}
 * @param games {GameData[]}
 * @param period
 */
function GAPeriodAverage(team, games, period) {
    return [{period: 1, avg: 0.0}]
}

/** TODO:
 * Function that analyses @param period, in each game in the array @param games, and returns goals made by both teams average.
 * @param team {Team}
 * @param games {GameData[]}
 * @param period
 */
function GPeriodAverage(team, games, period) {
    return [{period: 1, avg: 0.0}]
}

/**
 * TODO:
 * @param team
 * @param games
 * @param period
 */
function getPeriodWon(team, games, period) {

}

/** TODO:
 * @return {number}
 */
function TotalGoalsAvg(games) {
    return (games.reduce((res, current) => res + current.goals) / games.length);
}


class AnalyticsAPI {
    /**
     *
     * @param team {String}
     * @param games {GameData[]}
     * @param lambda {Function}
     */
    constructor(team, games, lambda) {
        this.team = team;
        this.games = games;
        this.lambda = lambda;
    }
}

class FirstPeriodWin extends AnalyticsAPI {
    constructor(team, games) {
        super(team, games, (game) => {
            const result = game.scoringSummary
                .filter((goal) => goal.period === 1)
                .reduce((res, g) => g.getScoringTeam() === team.name ? { teamChecked: res.teamChecked + 1, other: res.other } : {teamChecked: res.teamChecked, other: res.other + 1}
                    , {teamChecked: 0, other: 0});
            return (result.teamChecked > result.other) ? 1 : 0;
        })
    }
    get results() {
        return {
            games: this.games.length,
            cameTrue: this.games.reduce((res, game) => {
                return res + this.lambda(game);
            }, 0)
        }
    }
}

class SecondPeriodWin extends AnalyticsAPI {
    constructor(team, games) {
        super(team, games, (game) => {
            const result = game.scoringSummary
                .filter((goal) => goal.period === 2)
                .reduce((res, g) => g.getScoringTeam() === team.name ? { teamChecked: res.teamChecked + 1, other: res.other } : {teamChecked: res.teamChecked, other: res.other + 1}
                    , {teamChecked: 0, other: 0});
            return (result.teamChecked > result.other) ? 1 : 0;
        })
    }
    get results() {
        return {
            games: this.games.length,
            cameTrue: this.games.reduce((res, game) => {
                return res + this.lambda(game);
            }, 0)
        }
    }
}

class ThirdPeriodWin extends AnalyticsAPI {
    constructor(team, games) {
        super(team, games, (game) => {
            const result = game.scoringSummary
                .filter((goal) => goal.period === 3)
                .reduce((res, g) => g.getScoringTeam() === team.name ? { teamChecked: res.teamChecked + 1, other: res.other } : {teamChecked: res.teamChecked, other: res.other + 1}
            , {teamChecked: 0, other: 0});
            return (result.teamChecked > result.other) ? 1 : 0;
        })
    }
    get results() {
        return {
            games: this.games.length,
            cameTrue: this.games.reduce((res, game) => {
                return res + this.lambda(game);
            }, 0)
        }
    }
}

class EmptyNetGoalGames extends AnalyticsAPI {
    constructor(team, games) {
        super(team, games, (game) => game.scoringSummary.filter((goal) => goal.period === 3 && goal.strength === "SH-EN" || goal.strength === "EV-EN").length)
    }

    get result() {
        return {
            games: this.games.length,
            goalsMade: this.games.map((game) => { this.lambda(game) }),
            cameTrue: this.games.map((game) => this.lambda(game) > 0)
        }
    }
}

class GamesOver extends AnalyticsAPI {
    constructor(team, games, totalScoredGoals) {
        super(team, games, (game) => {
            // calculate last games.length games, the average goals for and against
        })
    }

    get result() {
        return {
            games: this.games.length,
            goalsGame: this.games.map(game => game.scoringSummary.length),
            goalAverageTotal: this.games.reduce((res, game) => res + game.scoringSummary.length) / this.games.length,
        }
    }
}

module.exports = {
    GFPeriodAverage, GFGameAverage
}