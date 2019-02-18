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
        average: games.map(g => g.toGameData()).map(gd => gd.getGoalsBy(team)).reduce((res, goals) => res + goals, 0) / games.length
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
        average: games.map(g => g.toGameData()).map(gd => gd.getGoalsBy(gd.getOtherTeamName(team))).reduce((res, goals) => res + goals, 0) / games.length
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
        average: games.map(g => g.toGameData().totalScore).reduce((res, goals) => res + goals, 0) / games.length
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
                        return true;
                    }
                }
                return false;
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