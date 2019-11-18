'use strict';
const {getDivision, getConference, Conferences, Divisions} = require("../util/constants");
const {getFullTeamName} = require("../util/utilities");
const {GameInfo} = require("./models/GameInfoModel");
const {GameData} = require('../data/GameData');
// const {Game} = require("./models/GameModel");
const API = require("./analytics/api").API;
const DivisionAnalysis = API.DivisionAnalysis;
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



async function SeasonAnalysis(team, isHome) {
    // getter function for periods
    // this getter function makes it possible to write obj.GFA.period(1) and get the goals for average for period 1,
    // where obj is the returned object from this function
    try {
        return await API.getAllGamesPlayedBy(team).then(games => {
            let gameDatas = games.map(g => g.toGameData());
            let teamInfo = {
                name: team,
                division: getDivision(team),
                conference: getConference(team),
            };

            let divAnalysis = new DivisionAnalysis(team);
            divAnalysis.analyzeGameData(gameDatas);

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
                },
                divisionAnalysis: divAnalysis
                // Shots against [periods...], game
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

function calculateAnalysisDifference(valuesA, valuesB) {
    return { // we take the average of the 5 game trend, calculate diffs between this abs value and the average
        SF: valuesA.SF - valuesB.SFA,
        SA: valuesA.SA - valuesB.SAA,
        GF: valuesA.GF - valuesB.GFA,
        GA: valuesA.GA - valuesB.GAA,
        Save: valuesA.Save - valuesB.Save,
        PDO: valuesA.PDO - valuesB.PDO,
        Corsi: valuesA.Corsi - valuesB.Corsi
    };
}

/**
 * Analyze the five last games of @param team, and for each game, analyze the opponents 5 games prior to that game,
 * to find out, for example, what their stats was, and what possible effect that might have had on the outcome of that game
 * that @param team was in. This way, we can see if @param team's last 5 games, were more or less flukes, or if
 * the opponents they met, were coming into that game strong, or in a slump so to speak. This will give us a more
 * in depth understanding of @param team's last 5 games.
 *
 * For example; if @param team has won it's last 5 games, we want to see, if the opponents in those 5 games, were actually
 * in trends that were positive or negative. (This is data, that actually might be useful to plug into some AI/ML stuff
 * but that is still kind of out of my reach of knowledge at this point.
 * @param team
 * @returns {Promise<void>}
 * @constructor
 */
async function AnalyzeResultAndTeamsOfLastFiveGames(team) {
    return await API.getLastXGamesPlayedBy(10, team).then(games => {
        let lastFiveGames = games.map(g => g).splice(0, 5);
        // TODO:
        // this will define what to search for. So the last game, we will search for the opponents prior
        // five games to that, in order to see what stats the opponent had, and what the outcome was in that game,
        // to find out, what was the stats the other team had coming in to that game, and what role it (might) play
        // in the result in the game between team vs opponent.
        let result = lastFiveGames.map(g => g.toGameData()).map(async gd => {
            let p_oppAnalysis = TrendAnalysisBefore(gd.getOtherTeamName(team), gd.date, 5);     // TODO: Define & Implement
            let p_teamAnalysis = TrendAnalysisBefore(team, gd.date, 5);                  // TODO: Define & Implement
            return await Promise.all([p_oppAnalysis, p_teamAnalysis]).then(values => {
                let [oppAnalysis, teamAnalysis] = values;
                let opponentThisGame = gd.getAnalysisData(oppAnalysis.team);
                let teamThisGame = gd.getAnalysisData(teamAnalysis.team);

                let opponentDifference = calculateAnalysisDifference(opponentThisGame, oppAnalysis);
                let teamDifference = calculateAnalysisDifference(teamThisGame, teamAnalysis);

                let tAnalysis = {
                    game: teamThisGame,
                    trend: teamAnalysis
                };
                let oAnalysis = {
                    game: opponentThisGame,
                    trend: oppAnalysis
                };

                  // TODO: Define & Implement
                return createComparisonAfterOutcome(tAnalysis, oAnalysis, gd);
            });


        });
        return result;
    });
}

/// Used when analyzing 1 teams past 5 games, and the opponents of those 5 games trends/game stats.
class ResultAnalysis {

    constructor(teamTrendData, opponentTrendData, teamGameData, opponentGameData) {
        this.team.trend = teamTrendData;
        this.team.game = teamGameData;
        this.opponent.trend = opponentTrendData;
        this.opponent.game = opponentGameData;
    }

    get teamGameDifferences() {
        let arr = [];
        for(let propertyName in this.team.game) {
            arr[propertyName] = { team}
        }

        return {
            team: {

            },
            opponent: {

            }
        }
    }

    get teamTrendDifferences() {

    }
}

/**
 *
 * @param {Object} teamAnalysis
 * @param {Object} oppAnalysis
 * @param {GameData} gameData
 * @return {Object}
 */
function createComparisonAfterOutcome(teamAnalysis, oppAnalysis, gameData) {
    // If a value is negative, it means the team analyzed for is better & did better
    // If a value is positive, the opposite is obviously true

    let winner = gameData.winner;

    let TrendGameDifferenceTeam = {
        team: teamAnalysis.team,
        GAA: teamAnalysis.trend.GAA - teamAnalysis.game.GAA,
        GFA: teamAnalysis.trend.GFA - teamAnalysis.game.GFA,
        SAA: teamAnalysis.trend.SAA - teamAnalysis.game.SAA,
        SFA: teamAnalysis.trend.SFA - teamAnalysis.game.SFA,
        Save: teamAnalysis.trend.Save - teamAnalysis.game.Save,
        PDO: teamAnalysis.trend.PDO - teamAnalysis.game.PDO,
        Corsi: teamAnalysis.trend.Corsi - teamAnalysis.game.Corsi
    };

    let TrendGameDifferenceOpponent = {
        team:   oppAnalysis.team,
        GAA:    oppAnalysis.trend.GAA - oppAnalysis.game.GAA,
        GFA:    oppAnalysis.trend.GFA - oppAnalysis.game.GFA,
        SAA:    oppAnalysis.trend.SAA - oppAnalysis.game.SAA,
        SFA:    oppAnalysis.trend.SFA - oppAnalysis.game.SFA,
        Save:   oppAnalysis.trend.Save - oppAnalysis.game.Save,
        PDO:    oppAnalysis.trend.PDO - oppAnalysis.game.PDO,
        Corsi:  oppAnalysis.trend.Corsi - oppAnalysis.game.Corsi
    };

    let trendDifferencesTeams = {
        teams: { team: teamAnalysis.team, opponent: oppAnalysis.team },
        GAA: teamAnalysis.trend.GAA - oppAnalysis.trend.GAA,
        GFA: teamAnalysis.trend.GFA - oppAnalysis.trend.GFA,
        SAA: teamAnalysis.trend.SAA - oppAnalysis.trend.SAA,
        SFA: teamAnalysis.trend.SFA - oppAnalysis.trend.SFA,
        Save: teamAnalysis.trend.Save - oppAnalysis.trend.Save,
        PDO: teamAnalysis.trend.PDO - oppAnalysis.trend.PDO,
        Corsi: teamAnalysis.trend.Corsi - oppAnalysis.trend.Corsi
    };
    let gameStatsDifferencesTeams = {
        teams: { team: teamAnalysis.team, opponent: oppAnalysis.team },
        GAA: teamAnalysis.game.GAA - oppAnalysis.game.GAA,
        GFA: teamAnalysis.game.GFA - oppAnalysis.game.GFA,
        SAA: teamAnalysis.game.SAA - oppAnalysis.game.SAA,
        SFA: teamAnalysis.game.SFA - oppAnalysis.game.SFA,
        Save: teamAnalysis.game.Save - oppAnalysis.game.Save,
        PDO: teamAnalysis.game.PDO - oppAnalysis.game.PDO,
        Corsi: teamAnalysis.game.Corsi - oppAnalysis.game.Corsi
    };

    if(winner === teamAnalysis.team) {
        let trendsBetterThanGame = {
            GAA: (TrendGameDifferenceTeam.GAA > 0),
            GFA: (TrendGameDifferenceTeam.GFA > 0),
            SAA: (TrendGameDifferenceTeam.SAA > 0),
            SFA: (TrendGameDifferenceTeam.SFA > 0),
            Save: (TrendGameDifferenceTeam.Save > 0),
            PDO: (TrendGameDifferenceTeam.PDO > 0),
            Corsi: (TrendGameDifferenceTeam.Corsi > 0),
        };
        let trendsBetterThanOpponent = {
            GAA: teamAnalysis.trend.GAA > oppAnalysis.trend.GAA,
            GFA: teamAnalysis.trend.GFA > oppAnalysis.trend.GFA,
            SAA: teamAnalysis.trend.SAA > oppAnalysis.trend.SAA,
            SFA: teamAnalysis.trend.SFA > oppAnalysis.trend.SFA,
            Save: teamAnalysis.trend.Save > oppAnalysis.trend.Save,
            PDO: teamAnalysis.trend.PDO > oppAnalysis.trend.PDO,
            Corsi: teamAnalysis.trend.Corsi > oppAnalysis.trend.Corsi,
        };

    } else {

    }
}


/**
 * Returns a trend analysis of the last @param span games before date.
 * @param {string} team
 * @param {Date} date
 * @param {number} span
 * @constructor
 * @return {Object}
 */
async function TrendAnalysisBefore(team, date, span) {
    const PF = (str) => Number.parseFloat(str); // local rebinding of Number.parseFloat(...). Makes code easier to read

    return API.findLastXGamesByTeamBefore(team, date, span).then(games => {
        let gds = games.map(g => g.toGameData());
        let GAGameAverage = PF((gds.map(gd => gd.getGoalsBy(gd.getOtherTeamName(team))).reduce((res, goals) => res + goals) / span).toFixed(4));
        let GFGameAverage = PF((gds.map(gd => gd.getGoalsBy(team)).reduce((res, goals) => res + goals) / span).toFixed(4));
        let SAGameAverage = PF((gds.map(gd => gd.getShotsBy(gd.getOtherTeamName(team))).reduce((res, shots) => res+shots) / span).toFixed(4));
        let SFGameAverage = PF((gds.map(gd => gd.getShotsBy(team)).reduce((res, shots) => res + shots) / span).toFixed(4));
        let SavePercentAverage = 1-PF(( (gds.map(gd => gd.getGoalsBy(gd.getOtherTeamName(team))).reduce((res, goals) => res + goals)) / (gds.map(gd => gd.getShotsBy(gd.getOtherTeamName(team))).reduce((res, shots) => res+shots))).toFixed(4));
        let Corsi = CorsiAverage(SFGameAverage, SAGameAverage);
        let PDO = PDOAverage(GAGameAverage, SAGameAverage, GFGameAverage, SFGameAverage);
        let result = { team: team, GAA: GAGameAverage, GFA: GFGameAverage, SAA: SAGameAverage, SFA: SFGameAverage, PDO: PDO, Corsi: Corsi, Save: SavePercentAverage };
        return result;
    });
}




/**
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

            let last_5_games = games.map(g => g);
            last_5_games.splice(0, games.length/2);

            let last_5 = last_5_games.map(g => g.toGameData()).map(gd => ({ won: gd.winner === team, opponent: gd.getOtherTeamName(team), result: gd.finalResult, date: gd.date }));

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
                LastFive: last_5,
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
                    SeasonAnalysis(gameInfo.teams.home, true),
                    SeasonAnalysis(gameInfo.teams.away, false)]).then(values => {
            let [homeAnalysis, awayAnalysis, homeSeason, awaySeason] = values;
            let homeTeam = { name: gameInfo.teams.home, division: getDivision(gameInfo.teams.home) };
            let awayTeam = { name: gameInfo.teams.away, division: getDivision(gameInfo.teams.away) };
                return {
                    teams: {home: homeTeam, away: awayTeam}, // just for division data
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