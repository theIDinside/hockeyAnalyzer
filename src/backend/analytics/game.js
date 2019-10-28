'use strict';
const {Game} = require("../models/GameModel");
/// ------ GAME AVERAGES & ANALYSIS ------

/**
 * Returns goals for average over the last games, lastGames.
 * @param team {String}
 * @param games {Game[]}
 * @return {{average: Number, games: Number}}
 */
function GFGameAverage(team, games) {
    // oh the lovely universe of functional programming.
    const span = games.length / 2;
    let trendAtChartData = [...Array(span).keys()]
        .map((v, index) =>
            games
                .filter((g, i) => i < (span+index+1) && i > index)
                .map(g => g.toGameData().getGoalsBy(team))
                .reduce((res, goals) => res + goals, 0.0) / span);

    return {
        games: span,
        average: trendAtChartData[trendAtChartData.length-1],
        trendChartData: [...trendAtChartData]
    };
}

/**
 * Returns goals against average over the last games, lastGames.
 * @param team {String}
 * @param games {Game[]}
 * @return {{average: Number, games: Number, trendChartData: Number[]}}
 */
function GAGameAverage(team, games) {
    // oh the lovely universe of functional programming.
    const span = (games.length / 2);
    let trendAtChartData = [...Array(span).keys()]
        .map((v, index) =>
            games
                .filter((g, i) => i < (span+index+1) && i > index)
                .map(g => g.toGameData())
                .map(gd => gd.getGoalsBy(gd.getOtherTeamName(team)))
                .reduce((res, goals) => res + goals, 0) / span);
    return {
        games: span,
        average: trendAtChartData[trendAtChartData.length-1],
        trendChartData: [...trendAtChartData]
    };
}

/**
 * Returns total goal average over the last games. Only the last half of the game span, will be calculated on. The first half,
 * is only to determine, the average going into the last half of the game span. So to determine what the average is, at game 1, one
 * must first analyze the prior games. But the returned average in parameter average, is the average over the last {span} games.
 * @param team {String}
 * @param games {Game[]}
 * @return {{average: Number, games: Number, trendChartData: Number[]}}
 */
function GGameAverage(team, games) {
    const span = (games.length / 2);
    let trendAtChartData = [...Array(span).keys()]
        .map((v, index) =>
            games
                .filter((g, i) => i < (span+index+1) && i > index)
                .map(g => g.toGameData().totalScore)
                .reduce((res, goals) => res + goals, 0) / span);

    return {
        games: span,
        average: trendAtChartData[trendAtChartData.length-1],
        trendChartData: [...trendAtChartData]
    };
}

/**
 * @param team {String}
 * @param games {Game[]}
 * @return {{ENGoals: { lead: Number, scored: Boolean}|{scored: Boolean}, games: Number, pct: Number}}
 */
function EmptyNetScoring(team, games) {
    const span = games.length / 2;
    let ENGoals = games.filter((g, i) => i >= span).map(g => {
        let gd = g.toGameData();
        for(let g of gd.scoringSummary) {
            if(g.isEmptyNet() && g.getScoringTeam() === team) {
                let goalNumber = g.goalNumber;
                // we also need to know, if the lead was by 1 or 2, when they netted in the empty net
                let priorScore = gd.scoringSummary.filter(goal => goal.goalNumber < goalNumber).reduce((res, goal) => {
                    if(goal.getScoringTeam() === team) {
                        return { analyzedTeam: res.analyzedTeam +1, otherTeam: res.otherTeam }
                    } else {
                        return { analyzedTeam: res.analyzedTeam, otherTeam: res.otherTeam + 1 }
                    }
                }, {analyzedTeam: 0, otherTeam: 0});

                return {
                    lead: priorScore.analyzedTeam - priorScore.otherTeam,
                    scored: true
                };
            }
        }
        return {
            scored: false
        }
    });
    return {
        games: span,
        ENGoals: ENGoals,
        pct: (ENGoals.filter(v => v.scored).length / span) * 100.0
    }
}

function EmptyNetLetUps(team, games) {
    const span = games.length / 2;
    let ENGoals = games.filter((g, i) => i>=span).map(g => {
        let gd = g.toGameData();
        for(let g of gd.scoringSummary) {
            if(g.isEmptyNet() && g.getScoringTeam() !== team) {
                return true;
            }
        }
        return false;
    });
    return {
        games: span,
        ENLetUps: ENGoals,
        pct: (ENGoals.filter(v => v).length / span) * 100.0
    }
}

const lastXGameStats = (team, games) =>
    games.map(g => g.toGameData())
            .map(gd => {
                let key = (gd.home === team) ? 'home' : 'away';
                let key2 = (key === "home") ? "away" : "home";
                return {
                    at: key,
                    vs: (key === "home") ? gd.away : gd.home,
                    date: gd.date,
                    shots: gd.shotsOnGoal,
                    score: { team: this.finalResult[key], otherTeam: this.finalResult[key2] },
                    scorePct: {team: this.shotsOnGoal[key] / this.finalResult[key], otherTeam: this.shotsOnGoal[key2] / this.finalResult[key2] },
                    periods: gd.periods,
                    won: (team === gd.winner)
                }
            });

module.exports = { GFGameAverage, GAGameAverage, GGameAverage, EmptyNetScoring, EmptyNetLetUps, lastXGameStats };