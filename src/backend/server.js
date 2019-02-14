'use strict';
// Backend server, written in either Hapi || Express.
// NB, the server won't actually be serving any HTML. This part of the backend, is only really supposed to server JSON data,
// so that we can build whatever UI, to interact with it. We don't want to constrict ourselves to purely HTML, even though that might be
// a good alternative as well, with the proper tools.

const Hapi = require("hapi");
const {dumpErrorStackTrace} = require("../util/utilities");
const mongoose = require('mongoose');
const fs = require("fs");
const Standings = require('./models/StandingsModel');
const {getLastXGamesPlayedBy} = require('./models/GameModel');
const Player = require('./models/PlayerModel');
const {getFullTeamName} = require("../util/constants");


const server = Hapi.server({
    port: 3000,
    host: "localhost"
});

const mongoDBHost = () => {
    const user = "NHLAnalytics"; // this user does not have write access
    const pw = "season2018"; // so this will be what the end user uses to connect.
    const remoteNHLDB = `mongodb://${user}:${pw}@ds125945.mlab.com:25945/nhl`;
    if(process.env.DEBUGDB)
        return `mongodb://localhost/nhltest`;
    else
        return remoteNHLDB;
};

const init = async () => {
    mongoose.Promise = global.Promise;
    await server.start();
    mongoose.connect(mongoDBHost()).then(v => {
        console.log(`Connected to database backend: ${mongoDBHost()}`);
    });
    console.log(`Server started and running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    let errData = dumpErrorStackTrace(err);
    fs.writeFile("./serverError.log", errData, (err) => {
        dumpErrorStackTrace(err);
    });
    process.exit(1);
});

let localTestMDBHost = 'mongodb://localhost/nhltest';
let databaseName = "";

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error.'));
db.on("open", () => {
    console.log(`Connected to database @ ${mongoDBHost()}`);
});

// how to register a route
server.route({
    method: "GET",
    path: "/",
    handler: (req, h) => {
        // here we handle the request, and send back the requested data, or requested analytical information
        return `This data gets sent to, for example the browser.`
    }
});

// registering a route with params
server.route({
    method: "GET",
    path: "/{team}",
    handler: (request, h) => {
        let teamName = getFullTeamName(encodeURIComponent(request.params.team)); // for example if: http://somehostaddr.com/ANA, will retrieve some data D for team "Anaheim Mighty Ducks" (ANA).

    }
});

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

server.route(BetRoute);
server.route(GamesTodayRoute);
server.route(AnalyzeComingGameRoute);

init();