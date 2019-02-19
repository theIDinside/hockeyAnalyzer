'use strict';

const {dumpErrorStackTrace} = require("../util/utilities")

const {getFullTeamName} = require("../util/utilities");

const {GameInfo} = require("./models/GameInfoModel");
const {Game} = require("./models/GameModel");
const API = require("./analytics/api").API;


/**
 *
 * @param team
 * @return {Promise<{GAPeriodAverages: Number[], EmptyNetGoals: Boolean[], EmptyNetLetUps: Boolean[], PeriodWins: Boolean[], TotalGoalsGameAverage: Number, GFAverage: Number, GAAverage: Number, GFPeriodAverages: Number[], TotalGoalsPeriodAverage: Number[]}>}
 */
async function FullAnalysis(team) {
    try {
        let games = await API.getLastXGamesPlayedBy(10, team);
        let wonGames = await API.getLastXGamesWonBy(10, team);
        let lostGames = await API.getLastXGamesLostBy(10, team); // used to analyze how often they let up a goal, into empty net, when they lose.
        return {
            GAAverage: API.GAGameAverage(team, games),
            GFAverage: API.GFGameAverage(team, games),
            TotalGoalsGameAverage: API.GGameAverage(team, games),
            GAPeriodAverages: [...Array(4).keys()].filter(i => i > 0).map(period => API.GAPeriodAverage(team, games, period)),
            GFPeriodAverages: [...Array(4).keys()].filter(i => i > 0).map(period => API.GFPeriodAverage(team, games, period)),
            PeriodWins: [...Array(4).keys()].filter(i => i > 0).map(period => API.PeriodWins(team, games, period)),
            TotalGoalsPeriodAverage: [...Array(4).keys()].filter(i => i > 0).map(period => API.GPeriodAverage(team, games, period)),
            EmptyNetGoals: API.EmptyNetScoring(team, wonGames),
            EmptyNetLetUps: API.EmptyNetLetUps(team, lostGames),
            passed: true
        }
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
    method: "POST",
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
    }
};

// TODO:
let GamesTodayRoute = {
    method: "GET",
    path: "/games/today",
    handler: async (request, h) => {
        // TODO: this function is not yet defined.
        try {
            let games = await API.getGamesToday(new Date());
            let result = games.map(gameInfo => {
                return {
                    gameID: gameInfo.gameID,
                    datePlayed: gameInfo.datePlayed,
                    home: gameInfo.teams.home,
                    away: gameInfo.teams.away
                }
            });
        return { result: result };
        } catch (e) {
            dumpErrorStackTrace(e);
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
            let homeAnalysis = await FullAnalysis(gameInfo.teams.home);
            let awayAnalysis = await FullAnalysis(gameInfo.teams.away);
            return {
                homeTeamAnalysis: homeAnalysis,
                awayTeamAnalysis: awayAnalysis
            }
        } catch (e) {

        }
    }
};
// TODO:
let TeamRoute = {
    method: "GET",
        path: "/{team}",
    handler: async (request, h) => {
        let teamName = getFullTeamName(encodeURIComponent(request.params.team)); // for example if: http://somehostaddr.com/ANA, will retrieve some data D for team "Anaheim Mighty Ducks" (ANA).
    }
};
// TODO:
let DefaultRoute = {
    method: "GET",
    path: "/",
    handler: async (req, h) => {
        // here we handle the request, and send back the requested data, or requested analytical information
        return `This data gets sent to, for example the browser.`
    }
};

module.exports = [BetRoute, GamesTodayRoute, TeamRoute, DefaultRoute, AnalyzeComingGameRoute];