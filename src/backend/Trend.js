const p = require("./models/PlayerModel");
const s = require("./models/StandingsModel");
const G = require("../data/GameData");
const {Team} = require("./Team");
const {GameData} = require("../data/GameData");

// File that defines functions for analyzing team & player trends. This will contains basically all functionality this
// application is supposed to provide to the user.

/**
 * Function that analyses @param period, in each game in the array @param games, and returns goals for average.
 * @param team {Team}
 * @param games {GameData[]}
 * @param period
 */
function GFPeriodAverage(team, games, period) {
    switch (period) {
        case 1:
            games.reduce();
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;// OT
    }
    return [{period: 1, avg: 0.0}]
}

/**
 *
 * @param team {Team}
 * @param games {GameData[]}
 *
 */
function GFGameAverage(team, games) {

}

/**
 * Function that analyses @param period, in each game in the array @param games, and returns goals against average.
 * @param team {Team}
 * @param games {GameData[]}
 * @param period
 */
function GAPeriodAverage(team, games, period) {
    return [{period: 1, avg: 0.0}]
}

/**
 * Function that analyses @param period, in each game in the array @param games, and returns goals made by both teams average.
 * @param team {Team}
 * @param games {GameData[]}
 * @param period
 */
function GPeriodAverage(team, games, period) {
    return [{period: 1, avg: 0.0}]
}

function getPeriodWon(team, games, period) {

}

/**
 * @return {number}
 */
function TotalGoalsAvg(games) {
    return (games.reduce((res, current) => res + current.goals) / games.length);
}


class Trend {
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

class FirstPeriodWin extends Trend {
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

class SecondPeriodWin extends Trend {
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

class ThirdPeriodWin extends Trend {
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

class EmptyNetGoalGames extends Trend {
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

class GamesOver extends Trend {
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