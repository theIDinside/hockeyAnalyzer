'use strict';
const {Game} = require("../models/GameModel");
/// ------ GAME AVERAGES & ANALYSIS ------

/**
 * Returns goals for average over the last games, lastGames.
 * @param team {String}
 * @param games {Game[]}
 * @return {{average: number, games: *}}
 */
function GFGameAverage(team, games) {
    // oh the lovely universe of functional programming.
    return {
        games: games.length,
        average: games.map(g => g.toGameData())
            .map(gd => gd.getGoalsBy(team))
            .reduce((res, goals) => res + goals, 0) / games.length
    };
}

/**
 * Returns goals against average over the last games, lastGames.
 * @param team {String}
 * @param games {Game[]}
 * @return {{average: number, games: *}}
 */
function GAGameAverage(team, games) {
    // oh the lovely universe of functional programming.
    return {
        games: games.length,
        average: games.map(g => g.toGameData())
            .map(gd => gd.getGoalsBy(gd.getOtherTeamName(team)))
            .reduce((res, goals) => res + goals, 0) / games.length
    };
}

/**
 * Returns total goal average over the last games, lastGames.
 * @param team {String}
 * @param games {Game[]}
 * @return {{average: number, games: *}}
 */
function GGameAverage(team, games) {
    return {
        games: games,
        average: games.map(g => g.toGameData().totalScore)
            .reduce((res, goals) => res + goals, 0) / games.length
    };
}

/**
 * @param team {String}
 * @param games {Game[]}
 * @return {{ENGoals: *, games: *}}
 */
function EmptyNetScoring(team, games) {
    return {
        games: games,
        ENGoals: games.map(g => {
                let gd = g.toGameData();
                for(let g of gd.scoringSummary) {
                    if(g.isEmptyNet() && g.getScoringTeam() === team) {
                        let goalNumber = g.goalNumber;
                        // we also need to know, if the lead was by 1 or 2, when they netted in the empty net
                        let priorScore = gd.summary.filter((index, goal) => goal.goalNumber < goalNumber).reduce((res, goal) => {
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
            })
    }
}

function EmptyNetLetUps(team, games) {
    return {
        games: games,
        ENGoals: games.map(g => {
            let gd = g.toGameData();
            for(let g of gd.scoringSummary) {
                if(g.isEmptyNet() && g.getScoringTeam() !== team) {
                    return true;
                }
            }
            return false;
        })
    }
}

module.exports = { GFGameAverage, GAGameAverage, GGameAverage, EmptyNetScoring, EmptyNetLetUps };