'use strict';
const {Game} = require("../models/GameModel");
const { GameData } = require("../../data/GameData");
let value = 0;
/// ------ PERIOD AVERAGES & ANALYSIS ------
const SpanFilter = (_, idx) => idx <= (span+index) && idx > index;

/**
 * Returns goals made average per game, over a period of gameSeriesLength, by @param team
 * @param team {String}
 * @param games {Game[]}
 * @param period {Number}
 * @return {{average: Number, games: Number}}
 */
function GFPeriodAverage(team, games, period) {
    // oh the lovely universe of functional programming.
    const span = Math.floor(games.length / 2);
    let trendChartData = [...Array(span).keys()]
        .map((v, index) =>
            (games
                .filter((g, i) => i <= (span+index) && i > index)
                .map(g => {
                    return g.toGameData().getGoalsByPeriod(team, period)
                })
                .reduce((res, goals) => res + goals, 0) / span).toFixed(4));
    return {
        games: span,
        period: period,
        trendChartData: trendChartData,
        average: (games.filter((g,i) => i >= span).map(g => g.toGameData().getGoalsByPeriod(team, period))
            .reduce((res, goals) => res + goals, 0) / span).toFixed(4)
    }
}


/**
 * Function that analyses @param period, for the last games {gameSeriesLength}, and returns goals against average.
 * @param team {String}
 * @param games {Game[]}
 * @param period {Number}
 * @return {{average: Number, games: Number, period: Number}}
 */
function GAPeriodAverage(team, games, period) {
    const span = Math.floor(games.length / 2);
    let trendChartData = [...Array(span).keys()]
        .map((v, index) =>
            (games
                .filter((g, i) => i <= (span+index) && i > index)
                .map(g => g.toGameData())
                .map(gd => {
                    let goals = gd.getGoalsByPeriod(gd.getOpponentTeamName(team), period);
                    return goals;
                })
                .reduce((res, goals) => res + goals, 0) / span).toFixed(4));
    console.log(`Sending back analysis for GAPeriodAverage. Span ${span}. Period: ${period}. Trend chart data: ${[...trendChartData]}`)
    let res = {
        games: span,
        period: period,
        trendChartData: [...trendChartData],
        average: (games.filter((g, i) => i >= span).map(g => g.toGameData())
            .map(gameData => {
                return gameData.getGoalsByPeriod(gameData.getOpponentTeamName(team), period)
            })
            .reduce((res, goals) => res + goals, 0) / span).toFixed(4)
    };
    return res;
}

/**
 * Returns the total goal average by period, in a period of gameSeriesLength, that team played in.
 * @param team {String}
 * @param games {Game[]}
 * @param period {Number}
 * @return {{average: Number, games: Number, period: Number}}
 */
function GPeriodAverage(team, games, period) {
    const span = Math.floor(games.length / 2);
    let trendChartData = [...Array(span).keys()]
        .map((v, index) =>
            (games
                .filter((g, i) => i <= (span+index) && i > index)
                .map(g => g.toGameData().getGoalTotalByPeriod(period))
                .reduce((res, goals) => res + goals, 0) / span).toFixed(4));
    return {
        games: span,
        period: period,
        trendChartData: trendChartData,
        average: (games.filter((g,i) => i>=span).map(g => g.toGameData())
            .map(gd => gd.getGoalTotalByPeriod(period))
            .reduce((res, goals) => res+goals, 0) / span).toFixed(4)
    }
}

/**
 * Returns array of bools, describing if period P was won or lost (true / false).
 * @param team {String}
 * @param games {Game[]}
 * @param period {Number}
 * @return {{wins: Boolean[], period: Number, games: Number, pct: Number}}
 */
function PeriodWins(team, games, period) {
    const span = Math.floor(games.length / 2);
    let wins = games.map(g => g.toGameData()).filter(gd => gd.getGoalsByPeriod(team, period) > gd.getGoalsByPeriod(gd.getOpponentTeamName(team), period)).length;
    let losses = games.length - wins;
    return {
        games: games.length,
        period: period,
        wins: wins,
        losses: losses,
        pct:  wins / games.length * 100.00
    }
}

module.exports = { GAPeriodAverage, GFPeriodAverage, GPeriodAverage, PeriodWins };