'use strict';
const {Game} = require("../models/GameModel");
const {GameData} = require('../../data/GameData')
/// ------ GAME AVERAGES & ANALYSIS ------

/**
 * Returns goals for average over the last games, lastGames.
 * @param team {String}
 * @param games {Game[]}
 * @return {{average: Number, games: Number}}
 */
function GFGameAverage(team, games) {
    // oh the lovely universe of functional programming.
    const span = Math.floor(games.length / 2);

    let avg = [];
    let games_goals = [];
    games.forEach(g => games_goals.push(g.toGameData().getGoalsBy(team)));
    for(let i = 0; i < span; i++) {
        let goals_for_average_over_span_games = 0;
        for(let j = (games.length - 1 - i); j > (games.length - 1 - i - span) && j > 0; j--) {
            let gameData = games[j].toGameData();
            goals_for_average_over_span_games += gameData.getGoalsBy(team);
        }
        let average = goals_for_average_over_span_games / span;
        avg.push(average);
    }
    avg.reverse();
//    console.log(`Games and the score made by ${team} each games: ${[...games_goals]}`);
//    console.log(`Average data in GFGameAverage for team ${team}: ${[...avg]}`);
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
    const span = Math.floor((games.length / 2));
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
    const span = Math.floor((games.length / 2));
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
 * Pre-condition: Games passed as a parameter to this function, must be sorted as "Won games". Passing lost games to this function
 * is non-sensical and is considered UB as far as result of analysis.
 * @param team {String}
 * @param games {Game[]}
 * @return {{ENGoals: { lead: Number, scored: Boolean}|{scored: Boolean}, games: Number, pct: Number}}
 */
function EmptyNetScores(team, games) {
    const span = games.length / 2;


    let ENGoals = games.filter((g, i) => i >= span).map(g => {
        let gd = g.toGameData();
        for(let g of gd.scoringSummary) {
            if(g.isEmptyNet() && g.getScoringTeamFullName() === team) {
                let goalNumber = g.goalNumber;
                // we also need to know, if the lead was by 1 or 2, when they netted in the empty net
                let priorScore = gd.scoringSummary.filter(goal => goal.goalNumber < goalNumber).reduce((res, goal) => {
                    if(goal.getScoringTeamFullName() === team) {
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

/**
 * Pre-condition: Games passed in as parameter games must be games won by team, otherwise this function performs UB as far as result of the analysis.
 * 
 * @param {string} team 
 * @param { Game[] } games 
 * @return {  { result: { games: number, ENGoals: number, pct: number } } }
 */
async function EmptyNetScoring(team, games) {
    let games_won_regular = games.filter(game => {
        let gd = game.toGameData();
        for(let goal of gd.scoringSummary) {
           if(goal.getScoringPeriod() === 4 || goal.getScoringPeriod() === 5) {
               return false;
           }
        }
       return true;
    });
    let games_analyzed = games_won_regular.length;

    let empty_net_goal_games = games_won_regular.map(game => game.toGameData()).filter(gd => {
        for(let goal of gd.scoringSummary) {
            if(goal.isEmptyNet() && goal.getScoringTeamFullName() === team) {
                return true;
            }
        }
        return false; 
    });

    let result = {
        all_wins: games.length,
        games: games_won_regular.length,
        ENGoals: empty_net_goal_games.length,
        pct: (empty_net_goal_games.length / games_analyzed) * 100.0
    };

    console.log(`Empty net scoring stats: Goals: ${result.ENGoals}. Games won: ${result.games}, Percentage: ${result.pct}`);

    return result;
}


/**
 * Pre-condition: The games passed to this function, must be games were the team lost. Otherwise this produces UB, as far
 * as the result of the analysis.
 * @param {string} team
 * @param {GameModel[]} games
 * @returns {{pct: number, games: number, ENLetUps: *}}
 * @constructor
 */
function EmptyNetLetUps(team, games) {
    let all_losses = games.length;
    let games_lost_regular = games.filter(game => {
        let gameData = game.toGameData();
        for(let goal of gameData.scoringSummary) {
            if(goal.getScoringPeriod() === 4 || goal.getScoringPeriod() === 5) {
                return false;
            }
        }
        return true;
    });
    let games_analyzed = games_lost_regular.length;
    let empty_net_letup_games = games_lost_regular.map(game => game.toGameData()).filter(gd => {
        for(let g of gd.scoringSummary) {
            if(g.isEmptyNet() && g.getScoringTeamFullName() !== team) {
                return true;
            }
        }
        return false;
    });

    return {
        all_losses: all_losses,
        games: games_lost_regular.length,
        ENLetUps: empty_net_letup_games.length,
        pct: (empty_net_letup_games.length / games_analyzed) * 100.0
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
                    score: { team: gd.finalResult[key], opponent: gd.finalResult[key2] },
                    scorePct: { team: gd.shotsOnGoal[key] / gd.finalResult[key], opponent: gd.shotsOnGoal[key2] / gd.finalResult[key2] },
                    periods: gd.periods,
                    won: (team === gd.winner)
                }
            });

module.exports = { GFGameAverage, GAGameAverage, GGameAverage, EmptyNetScoring, EmptyNetLetUps, lastXGameStats };