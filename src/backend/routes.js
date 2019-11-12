'use strict';
const {getFullTeamName} = require("../util/utilities");

const {GameInfo} = require("./models/GameInfoModel");
// const {Game} = require("./models/GameModel");
const API = require("./analytics/api").API;
const {dumpErrorStackTrace} = require("../util/utilities");

const FULL_SEASON = 81; // Full regular season

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
 * Returns the calculated Corsi, from team average.
 * @return {number}
 */
function CorsiAverage(for_average, against_average) { return for_average - against_average; }

/**
 * Returns the calculated Corsi, from team average.
 * @return {number}
 */
function CorsiAveragePct(favg, aavg) { return favg / (favg+aavg); }

/**
 * Returns the calculated PDO, from team average.
 * @return {number}
 */
function PDOAverage(gaavg, saavg, gfavg, sfavg) { return (1-(gaavg/saavg) + gfavg/sfavg) * 100.0; }



async function SeasonAverageAnalysis(team, isHome) {
    // getter function for periods
    // this getter function makes it possible to write obj.GFA.period(1) and get the goals for average for period 1,
    // where obj is the returned object from this function
    try {
        return await API.getAllGamesPlayedBy(team).then(games => {
            let r = {
                team: team,
                GFA: {
                    periods: [...Array(4).keys()].filter(i => i > 0).map(p => games.map(g => g.toGameData().getGoalsByPeriod(team, p)).reduce((res, goals) => res + goals, 0) / games.length),
                    game: games.map(g => g.toGameData().getGoalsBy(team)).reduce((res, goals) => res + goals, 0) / games.length
                }, // Goals for [periods...], game
                GAA: {
                    periods: [...Array(4).keys()].filter(i => i > 0).map(p => games.map(g => g.toGameData().getGoalsByPeriod(g.toGameData().getOtherTeamName(team), p)).reduce((res, goals) => res + goals, 0) / games.length),
                    game: games.map(g => g.toGameData().getGoalsBy(g.toGameData().getOtherTeamName(team))).reduce((res, goals) => res + goals, 0) / games.length
                }, // Goals against [periods...], game
                SFA: {
                    periods: [...Array(4).keys()].filter(i => i > 0).map(p => games.map(g => g.toGameData().getShotsByPeriod(team, p)).reduce((res, shots) => res + shots, 0) / games.length),
                    game: games.map(g => g.toGameData().getShotsBy(team)).reduce((res, shots) => res + shots, 0) / games.length
                }, // Shots for [periods...], game
                SAA: {
                    periods: [...Array(4).keys()].filter(i => i > 0).map(p => games.map(g => g.toGameData().getShotsByPeriod(g.toGameData().getOtherTeamName(team), p)).reduce((res, shots) => res + shots, 0) / games.length),
                    game: games.map(g => g.toGameData().getShotsBy(g.toGameData().getOtherTeamName(team))).reduce((res, shots) => res + shots, 0) / games.length,
                } // Shots against [periods...], game
                /*
                Corsi: CorsiAverage(this.SFA.game, this.SAA.game),
                CorsiPct: CorsiAveragePct(this.SFA.game, this.SAA.game),
                PDOAverage: PDOAverage(this.GAA.game, this.SAA.game, this.GFA.game, this.SFA.game)
                */
            };
            console.log("SAA: " + r.SAA.game);
            console.log(`SAA periods: ${[...r.SAA.periods]}`);
            console.log("SFA: " + r.SFA.game);
            console.log(`SFA periods: ${[...r.SFA.periods]}`);

            return r;
        });
    } catch(e) {
        dumpErrorStackTrace(e);
    }
}

/**
 *
 * @param team
 * @param isHome
 * @returns { Promise< {
 *  team: string,
 *  GAAverage: { periods: number[], game: number },
 *  GFAverage: { periods: number[], game: number },
 *  GAverageTotal: { periods: number[], game: number },
 *  PeriodWins: { wins: boolean[], period: number, games: number, pct: number },
 *  EmptyNetGoals: { all_wins: number, games: number, ENGoals: number, pct: number },
 *  EmptyNetLetUps: { all_losses: number, games: number, ENLetUps: number, pct: number }
 * }> | { passed: boolean, msg: string } }
 */
async function SpanAnalysis(team, isHome) {
    let gameSpan = 10;

    try {
        return await Promise.all([API.getLastXGamesPlayedBy(gameSpan, team),
            API.getLastXGamesWonBy(gameSpan, team),
            API.getLastXGamesLostBy(gameSpan, team),
            API.getLastXGamesWonBy(FULL_SEASON, team)]).then(allGames => {
        let [games, wonGames, lostGames, empty_net_games] = allGames; // lostGames, used to analyze how often they let up a goal, into empty net, when they lose.
            games = games.reverse();
            wonGames = wonGames.reverse();
            lostGames = lostGames.reverse();
            let PK_data = API.PenaltyKilling(team, games); // Array of objects, like: [{total, goals, pct}, {total, goals, pct}, {total, goals, pct}, ...]
            let PP_data = API.PowerPlay(team, games);

            let PK = {
                trendChartData: PK_data.map(pk_stats => Number.parseFloat(pk_stats.pct.toFixed(3))),
                data: PK_data,
                penalties_amount_avg: PK_data.map(pk_stats => Number.parseFloat(pk_stats.penalties_taken_avg.toFixed(3)))
            };
            let PP = {
                trendChartData: PP_data.map(pp_stats => Number.parseFloat(pp_stats.pct.toFixed(3))),
                data: PP_data,
                power_plays_amount_avg: PP_data.map(pp_stats => Number.parseFloat(pp_stats.power_plays_amount_avg.toFixed(3))),
            };

            console.log(`PK data: ${[...PK.trendChartData]}`);

            return {
                team: team,
                GAAverage: {
                    periods: [...Array(4).keys()].filter(i => i > 0).map(period => API.GAPeriodAverage(team, games, period)),
                    game: API.GAGameAverage(team, games)
                },
                GFAverage: {
                    periods: [...Array(4).keys()].filter(i => i > 0).map(period => API.GFPeriodAverage(team, games, period)),
                    game: API.GFGameAverage(team, games)
                },
                GAverageTotal: {
                    periods: [...Array(4).keys()].filter(i => i > 0).map(period => API.GPeriodAverage(team, games, period)),
                    game: API.GGameAverage(team, games)
                },
                PeriodWins: [...Array(4).keys()].filter(i => i > 0).map(period => API.PeriodWins(team, games, period)),
                PK: PK,
                PP: PP,
                EmptyNetGoals: API.EmptyNetScoring(team, empty_net_games),
                EmptyNetLetUps: API.EmptyNetLetUps(team, lostGames),
                passed: true
            };
        }).catch(err => {
            dumpErrorStackTrace(err, "Error in full analysis function:")
        });
    } catch (err) {
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
        return await GameInfo.find({gameID: gameID}).then((err, gameInfo) => {
            return {
                gameID: gameInfo.gameID,
                datePlayed: gameInfo.datePlayed,
                home: gameInfo.teams.home,
                away: gameInfo.teams.away
            }
        });
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
        let gameID = Number.parseInt(request.params.ID);
        try {
            let gameInfo = await API.reqGameInfo(gameID);
            return await Promise.all(
            [SpanAnalysis(gameInfo.teams.home, true),
                    SpanAnalysis(gameInfo.teams.away, false),
                    SeasonAverageAnalysis(gameInfo.teams.home, true),
                    SeasonAverageAnalysis(gameInfo.teams.away, false)]).then(values => {
            let [homeAnalysis, awayAnalysis, homeSeason, awaySeason] = values;
            console.log(`Season object verifier: ${homeSeason.GFA!==undefined && awaySeason.GFA!==undefined && awaySeason.GFA!==null && homeSeason.GFA!==null}, Type of awaySeason && homeSeason: ${typeof homeSeason}/${typeof awaySeason}.`);
            console.log(`Home season SFA: ${homeSeason.SFA.game}`);
                return {
                    homeTeamSpanAnalysis: homeAnalysis,
                    homeTeamSeasonAnalysis: homeSeason,
                    awayTeamSpanAnalysis: awayAnalysis,
                    awayTeamSeasonAnalysis: awaySeason
                };
            });
        } catch (e) {
            console.log(`Error in Route handler: ${e}`);
            console.log(e.stack);
            return {};
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

function makeLiveComparator(team, data) {
    if(team === data.away) {

    } else {
        return {
            team: team,
            score_diff: data.scoreHome - data.scoreAway,
        }
    }
}

let LiveResult = {
    method: "POST",
    path: "/live",
    handler: async (request, h) => {
        let payload = request.payload;
        console.log(`Received payload via POST`);
        for(let prop in payload) {
            console.log(`Property: ${prop} = ${payload[prop]}`);
        }
        let {home, away, scoreHome, scoreAway, period, time} = payload;
        let {mins, sec} = time;

        let GameTime = {
            period: period,
            time: {
                mins: mins,
                secs: sec,
            }
        };
        let Score = {
            home: scoreHome,
            away: scoreAway
        };

        let liveResult = {
            score: Score,
            gameTime: GameTime
        };

        let teams = {home: home, away: away};
        // { score: { home: X, away: Y }, gameTime: { period: P, time: { mins: M, secs: S } } }
        return await API.LiveResult(liveResult, teams).then(res => {

            return {}; // return some JSON object holding all the analysis data
        })

    }
};

module.exports = [BetRoute, GamesTodayRoute, TeamRoute, DefaultRoute, AnalyzeComingGameRoute];