'use strict';
const {Game} = require("../models/GameModel");

/// ------ PERIOD AVERAGES & ANALYSIS ------


/**
 * Returns goals made average per game, over a period of gameSeriesLength, by @param team
 * @param team {String}
 * @param games {Game[]}
 * @param period {Number}
 * @return {{average: number, games: *}}
 */
function GFPeriodAverage(team, games, period) {
    // oh the lovely universe of functional programming.
    return {
        games: games,
        average: games.map(g => g.toGameData().getGoalsByPeriod(team, period)).reduce((res, goals) => res + goals, 0) / games.length
    }
}


/**
 * Function that analyses @param period, for the last games {gameSeriesLength}, and returns goals against average.
 * @param team {String}
 * @param games {Game[]}
 * @param period {Number}
 * @return {{average: number, games: *}}
 */
function GAPeriodAverage(team, games, period) {
    return {
        games: games,
        average: games.map(g => g.toGameData()).map(gameData => gameData.getGoalsByPeriod(gameData.getOtherTeamName(team), period)).reduce((res, goals) => res + goals, 0) / games.length
    }
}

/**
 * Returns the total goal average by period, in a period of gameSeriesLength, that team played in.
 * @param team {String}
 * @param games {Game[]}
 * @param period {Number}
 * @return {{average: number, games: *}}
 */
function GPeriodAverage(team, games, period) {
    return {
        games: games,
        average: games.map(g => g.toGameData()).map(gd => gd.getGoalTotalByPeriod(period)).reduce((res, goals) => res+goals, 0) / games
    }
}

/**
 * Returns array of bools, describing if period P was won or lost (true / false).
 * @param team {String}
 * @param games {Game[]}
 * @param period {Number}
 * @return {{wins: *, period: *, games: *}}
 */
function PeriodWins(team, games, period) {
    return {
        games: games,
        period: period,
        wins: games.map(g => g.toGameData()).map((i, gd) => gd.getGoalsByPeriod(team, period) > gd.getGoalsByPeriod(gd.getOtherTeamName(team), period))
    }
}

module.exports = { GAPeriodAverage, GFPeriodAverage, GPeriodAverage, PeriodWins };