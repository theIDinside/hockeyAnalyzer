'use strict';

const {dumpErrorStackTrace} = require("../util/utilities")

const {getFullTeamName} = require("../util/utilities");

const {GameInfo} = require("./models/GameInfoModel");
const {Game} = require("./models/GameModel");
const API = require("./analytics/api").API;

/**
 * check @span days backward, and check how many games have been played by @team
 * Useful info to account for fatigue. If one team has played 4 games in the last 6 days, vs a team with only 2 games in the last 5, that can be a pretty big advantage or disadvantage,
 * depending on what team it is (as some teams do really well with tight schedules, others less so).
 * @param {string} team 
 * @param {int} span 
 */
async function queryGamesPlayed(team, span) {
    let begin_date = new Date(); // today,
    let end_date = new Date();
    end_date.setDate(end_date.getDate()-1);
    begin_date.setDate(begin_date.getDate()-span);

    // request the last span games, then start checking if any of those games, fall within now-(span)
    let games = await API.getLastXGamesPlayedBy(span, team);
    let game_count = 0;
    for(let g of games) {
        if(g.datePlayed >= begin_date && g.datePlayed <= end_date) game_count += 1;
    }

    return game_count;
    
}

/**
 *
 * @param team
 * @return {Promise<{GAPeriodAverages: Number[], EmptyNetGoals: Boolean[], EmptyNetLetUps: Boolean[], PeriodWins: Boolean[], TotalGoalsGameAverage: Number, GFAverage: Number, GAAverage: Number, GFPeriodAverages: Number[], TotalGoalsPeriodAverage: Number[]}, passed: Boolean>}
 */
async function FullAnalysis(team, isHome) {
    let gameSpan = 10;
    const FULL_SEASON = 81;
    try {
        return await Promise.all([API.getLastXGamesPlayedBy(gameSpan*2, team),
            API.getLastXGamesWonBy(gameSpan*2, team),
            API.getLastXGamesLostBy(gameSpan*2, team),
            API.getLastXGamesWonBy(FULL_SEASON, team)]).then(allGames => {
        let [games, wonGames, lostGames, empty_net_games] = allGames; // lostGames, used to analyze how often they let up a goal, into empty net, when they lose.
            games = games.reverse();
            wonGames = wonGames.reverse();
            lostGames = lostGames.reverse();



            let res = {
                team: team,
                GAAverage: API.GAGameAverage(team, games),
                GFAverage: API.GFGameAverage(team, games),
                TotalGoalsGameAverage: API.GGameAverage(team, games),
                GAPeriodAverages: [...Array(4).keys()].filter(i => i > 0).map(period => API.GAPeriodAverage(team, games, period)),
                GFPeriodAverages: [...Array(4).keys()].filter(i => i > 0).map(period => API.GFPeriodAverage(team, games, period)),
                PeriodWins: [...Array(4).keys()].filter(i => i > 0).map(period => API.PeriodWins(team, games, period)),
                TotalGoalsPeriodAverage: [...Array(4).keys()].filter(i => i > 0).map(period => API.GPeriodAverage(team, games, period)),
                EmptyNetGoals: API.EmptyNetScoring(team, empty_net_games),
                EmptyNetLetUps: API.EmptyNetLetUps(team, lostGames),
                lastGames: API.lastXGameStats(team, games.filter((g, i) => i >= (gameSpan*2)-5)),
                passed: true
            };
            // console.log(`Returning analysis for team: ${res.team}. GFA: ${res.GFAverage.average}. GAA: ${res.GAAverage.average}.GAPA len ${res.GAPeriodAverages.length} GAPA: ${[...res.GAPeriodAverages[0].trendChartData]} `);
            return res;
        }).catch(err => {
            console.log(`Error in full analysis function: ${err}\n ${err.stack}`);
        })
    } catch (err) {
        const {dumpErrorStackTrace} = require("../util/utilities")
        dumpErrorStackTrace(err);
        return {
            passed: false,
            msg: "An error occured while analyzing the games."
        }
    }

}

// TODO:
let BetRoute = {
    method: "GET",
    path: "/game/{gameID}",
    handler: async (request, h) => {
        let gameID = Number.parseInt(encodeURIComponent(request.params.gameID));
        let g = await GameInfo.find({gameID: gameID}).then((err, gameInfo) => {
            return {
                gameID: gameInfo.gameID,
                datePlayed: gameInfo.datePlayed,
                home: gameInfo.teams.home,
                away: gameInfo.teams.away
            }
        });

        return g;
    },
    options: { // TODO: Fix so that a proper CORS header settings is set. Taking any CORS is NOT a good idea.
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    }
};

// TODO:
let GamesTodayRoute = {
    method: "GET",
    path: "/games/today",
    handler: async (request, h) => {
        // TODO: this function is not yet defined.
        try {
            let date = new Date();
            let games = await API.getGamesToday(date);
            let result = games.map(gameInfo => {
                return {
                    gameID: gameInfo.gameID,
                    datePlayed: gameInfo.datePlayed,
                    home: gameInfo.teams.home,
                    away: gameInfo.teams.away
                }
            });
        return { result: result, date: date };
        } catch (e) {
            dumpErrorStackTrace(e);
        }
    },
    options: { // TODO: Fix so that a proper CORS header settings is set. Taking any CORS is NOT a good idea.
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    }
};

// TODO:
// Possible (example) implementation of requesting trend data.
let AnalyzeComingGameRoute = {
    method: "GET",
    path: "/games/{ID}",
    handler: async (request, h) => {
        // TODO: this function is not yet defined.
        let gameID = Number.parseInt(request.params.ID);
        try {
            let gameInfo = await API.reqGameInfo(gameID);
            return await Promise.all([FullAnalysis(gameInfo.teams.home, true), FullAnalysis(gameInfo.teams.away, false)]).then(values => {
            let [homeAnalysis, awayAnalysis] = values;
                return {
                    homeTeamAnalysis: homeAnalysis,
                    awayTeamAnalysis: awayAnalysis
                }
            });
        } catch (e) {
            console.log("YOOOOOOOOO")
        }
    },
    options: { // TODO: Fix so that a proper CORS header settings is set. Taking any CORS is NOT a good idea.
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    }
};
// TODO:
let TeamRoute = {
    method: "GET",
    path: "/team/{teamName}", // example: http://localhost:3000/team/ana?at=home&amt=10
    handler: async (request, h) => {
        let teamName = getFullTeamName(encodeURIComponent(request.params.teamName)); // for example if: http://somehostaddr.com/ANA, will retrieve some data D for team "Anaheim Mighty Ducks" (ANA).
        let queryParameters = request.query;
        let gameCount = 5;
        try {
            gameCount = (queryParameters["amt"] !== '') ? Number.parseInt(queryParameters["amt"]) : 5
        } catch (e) {
            console.log("Query parameter was not a number");
        }
        if(queryParameters["at"] === "home") {
            // TODO: get home games
            return API.getHomeGames(gameCount, teamName).then(games => {
                return games.map(g => g.toGameData()).map(gd => {
                    return {
                        won: (gd.winner === teamName),
                        vs: gd.getOtherTeamName(teamName),
                        firstScoring: gd.getScoringTeam() === teamName,
                        periodGoalData: gd.periods,
                    }
                });
1            })
        } else if(queryParameters["at"] === "away") {
            // TODO: get home games
        } else if(queryParameters["at"] === "any") {
            // TODO: get both
        }
    },
    options: { // TODO: Fix so that a proper CORS header settings is set. Taking any CORS is NOT a good idea.
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    }
};
// TODO:
let DefaultRoute = {
    method: "GET",
    path: "/",
    handler: async (req, h) => {
        // here we handle the request, and send back the requested data, or requested analytical information
        return `This data gets sent to, for example the browser.`
    },
    options: { // TODO: Fix so that a proper CORS header settings is set. Taking any CORS is NOT a good idea.
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    }
};

module.exports = [BetRoute, GamesTodayRoute, TeamRoute, DefaultRoute, AnalyzeComingGameRoute];