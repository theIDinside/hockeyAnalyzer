'use strict';
// Backend server, written in either Hapi || Express.
// NB, the server won't actually be serving any HTML. This part of the backend, is only really supposed to server JSON data,
// so that we can build whatever UI, to interact with it. We don't want to constrict ourselves to purely HTML, even though that might be
// a good alternative as well, with the proper tools.

const Hapi = require("hapi");
const {dumpErrorStackTrace} = require("../util/utilities");
const {DB, mongoDBHost} = require('./db');
const routes = require("./routes")
const fs = require("fs");
const Standings = require('./models/StandingsModel');
const {getLastXGamesPlayedBy} = require('./models/GameModel');
const Player = require('./models/PlayerModel');
const {getFullTeamName} = require("../util/constants");


const server = Hapi.server({
    port: 3000,
    host: "localhost",
    routes: {
        "cors": true
    }
});

const init = async () => {
    try {
        routes.forEach(r => server.route(r));
        await server.start();
        console.log(`Server started and running at: ${server.info.uri}`);
    } catch (e) {
        let logData = dumpErrorStackTrace(e);
        fs.writeFile("./initerror.log", logData, (err) => {
            console.error("Couldn't log error data!");
            let _ = dumpErrorStackTrace(err);
        })
    }
};

process.on('unhandledRejection', (err) => {
    let errData = dumpErrorStackTrace(err);
    fs.writeFile("./serverError.log", errData, (err) => {
        dumpErrorStackTrace(err);
    });
    process.exit(1);
});

init();