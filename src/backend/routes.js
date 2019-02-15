'use strict';

let BetRoute = {
    method: "GET",
    path: "/gameID",
    handler: (request, h) => {
        let gameID = encodeURIComponent(request.params.gameID);
    }
};

let GamesTodayRoute = {
    method: "GET",
    path: "/games/today",
    handler: (request, h) => {
        // TODO: this function is not yet defined.
        let gamesToday = getGamesToday(new Date());
    }
};

// Possible (example) implementation of requesting trend data.
let AnalyzeComingGameRoute = {
    method: "GET",
    path: "/games/{ID}",
    handler: (request, h) => {
        // TODO: this function is not yet defined.
        let gameID = encodeURIComponent(request.params.ID);

        /*
            TODO: this function is not yet defined. Should return object like
                {
                    home: "Some Team A"
                    away: "Some Team B",
                }
         */
        let gameData = reqGameData(gameID);

        let last10GamesHomeTeam = getLastXGamesPlayedBy(10, gameData.home, (games) => {
            return games;
        });
        let last10GamesAwayTeam = getLastXGamesPlayedBy(10, gameData.away, (games) => {
            return games;
        });

        Promise.all([last10GamesHomeTeam, last10GamesAwayTeam]).then(values => {
            let [htGames, atGames] = values;

        })
    }
};

let TeamRoute = {
    method: "GET",
        path: "/{team}",
    handler: (request, h) => {
    let teamName = getFullTeamName(encodeURIComponent(request.params.team)); // for example if: http://somehostaddr.com/ANA, will retrieve some data D for team "Anaheim Mighty Ducks" (ANA).
    }
};

let DefaultRoute = {
    method: "GET",
    path: "/",
    handler: (req, h) => {
        // here we handle the request, and send back the requested data, or requested analytical information
        return `This data gets sent to, for example the browser.`
    }
};

module.exports = [BetRoute, GamesTodayRoute, TeamRoute, DefaultRoute, AnalyzeComingGameRoute];