'use strict';

const {getFullTeamName} = require("../util/utilities");

const {GameInfo} = require("./models/GameInfoModel");
const {Game} = require("./models/GameModel");
const API = require("./analytics/api").API;


/**
 *
 * @param team
 * @return {Promise<{GAPeriodAverages: Number[], EmptyNetGoals: Boolean[], PeriodWins: Boolean[], TotalGoalsGameAverage: Number, GFAverage: Number, GAAverage: Number, GFPeriodAverages: Number[], TotalGoalsPeriodAverage: Number[]}>}
 */
async function FullAnalysis(team) {
    try {
        let games = await API.getLastXGamesPlayedBy(10, team);
        let wonGames = await API.getLastXGamesWonBy(10, team);
        let lostGames = await API.getLastXGamesLostBy(10, team); // used to analyze how often they let up a goal, into empty net, when they lose.
        return {
            GAAverage: API.GAGameAverage(games, team),
            GFAverage: API.GFGameAverage(games, team),
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
    method: "GET",
    path: "/gameID",
    handler: (request, h) => {
        let gameID = Number.parseInt(encodeURIComponent(request.params.gameID));
        GameInfo.find({gameID: gameID}).exec((err, doc) => {

        })
    }
};

// TODO:
let GamesTodayRoute = {
    method: "GET",
    path: "/games/today",
    handler: async (request, h) => {
        // TODO: this function is not yet defined.
        let gamesToday = getGamesToday(new Date());
    }
};

// TODO:
// Possible (example) implementation of requesting trend data.
let AnalyzeComingGameRoute = {
    method: "GET",
    path: "/games/{ID}",
    handler: async (request, h) => {
        // TODO: this function is not yet defined.
        let gameID = encodeURIComponent(request.params.ID);
        let gameInfo = await API.reqGameInfo(gameID)
        let homeAnalysis = FullAnalysis(gameInfo.home);
        let awayAnalysis = FullAnalysis(gameInfo.away);

        return new Promise((resolve, reject) => {
            Promise.all([homeAnalysis, awayAnalysis]).then(values => {
                let [htGames, atGames] = values;
                let gameAnalysis = {
                    home: htGames,
                    away: atGames
                };
                resolve(gameAnalysis);
            }).catch(err => {
                reject(err);
            })
        })
    }
};
// TODO:
let TeamRoute = {
    method: "GET",
        path: "/{team}",
    handler: (request, h) => {
        let teamName = getFullTeamName(encodeURIComponent(request.params.team)); // for example if: http://somehostaddr.com/ANA, will retrieve some data D for team "Anaheim Mighty Ducks" (ANA).
    }
};
// TODO:
let DefaultRoute = {
    method: "GET",
    path: "/",
    handler: (req, h) => {
        // here we handle the request, and send back the requested data, or requested analytical information
        return `This data gets sent to, for example the browser.`
    }
};

module.exports = [BetRoute, GamesTodayRoute, TeamRoute, DefaultRoute, AnalyzeComingGameRoute];