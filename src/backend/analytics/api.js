const {Game} = require("../models/GameModel");
const {GameInfo} = require("../models/GameInfoModel");

// const {EmptyNetScoring, GAGameAverage, GFGameAverage, GGameAverage} = require("./game");
// const {GAPeriodAverage, GFPeriodAverage, GPeriodAverage, PeriodWins} = require("./period");

const GameAPI = require("./game");
const PeriodAPI = require("./period");

const DefaultPredicate = team => {
    return {$or: [{"teams.home": team}, {"teams.away": team}]};
};

const LossPredicate = team => {
    return {$and: [{$or: [{"teams.home": team}, {"teams.away": team}]}, {$and: [{"teamWon": {$ne: team}}]}]}
};

const WinsPredicate = team => {
    return { "teamWon": team };
};

/**
 * @param x {Number}
 * @param team {String}
 * @return {Promise}
 */
async function getLastXGamesWonBy(x, team) {
    const {dateStringify} = require("../../util/utilities");
    let dateSort = {datePlayed: -1}; // descending sort
    return Game.find(WinsPredicate(team)).sort(dateSort).limit(x).then((games) => {
        if(games.length > 0) {
            // TODO: Remove this logging to the console once fully functional and containing no issues.
            console.log(`Found: ${games.length} games with ${team} playing.`);
            console.log(`These are the games:`);
            for(let g of games) {
                console.log(`Game: ${g.gameID}\t "${g.teams.away} vs ${g.teams.home}".\t Date played: ${dateStringify(g.datePlayed)}`);
            }
            return games;
        } else {
            throw new Error(`Could not find any games with team ${team}`);
        }
    })
}

/**
 * @param x {Number}
 * @param team {String}
 * @return {Promise}
 */
async function getLastXGamesLostBy(x, team) {
    const {dateStringify} = require("../../util/utilities");
    let dateSort = {datePlayed: -1}; // descending sort
    return Game.find(LossPredicate(team)).sort(dateSort).limit(x).then((games) => {
        if(games.length > 0) {
            // TODO: Remove this logging to the console once fully functional and containing no issues.
            console.log(`Found: ${games.length} games with ${team} playing.`);
            console.log(`These are the games:`);
            for(let g of games) {
                console.log(`Game: ${g.gameID}\t "${g.teams.away} vs ${g.teams.home}".\t Date played: ${dateStringify(g.datePlayed)}`);
            }
            return games;
        } else {
            throw new Error(`Could not find any games with team ${team}`);
        }
    })
}

/**
 *
 * @param x
 * @param team
 * @return {Promise}
 */
async function getLastXGamesPlayedBy(x, team) {
    const {dateStringify} = require("../../util/utilities");
    let dateSort = {datePlayed: -1}; // descending sort
    return Game.find(DefaultPredicate(team)).sort(dateSort).limit(x).then((games) => {
        if(games.length > 0) {
            // TODO: Remove this logging to the console once fully functional and containing no issues.
            console.log(`Found: ${games.length} games with ${team} playing.`);
            console.log(`These are the games:`);
            for(let g of games) {
                console.log(`Game: ${g.gameID}\t "${g.teams.away} vs ${g.teams.home}".\t Date played: ${dateStringify(g.datePlayed)}`);
            }
            return games;
        } else {
            throw new Error(`Could not find any games with team ${team}`);
        }
    })
}

/**
 *
 * @param gameID
 * @return {Promise<Promise|never|ChildProcess|RegExpExecArray>}
 */
async function reqGameInfo(gameID) {
    return GameInfo.find({gameID: gameID}).exec((err, gi) => {
        if(gi.length > 0)
            return {
                gameID: gi.gameID,
                teams: gi.teams,
            }
        else
            throw new Error(`No game with gameID ${gameID} was found.`);
    })
}

// const API = { EmptyNetScoring, GAGameAverage, GFGameAverage, GGameAverage, GAPeriodAverage, GFPeriodAverage, GPeriodAverage, PeriodWins};
const API = { ...GameAPI, ...PeriodAPI, getLastXGamesWonBy, getLastXGamesLostBy, getLastXGamesPlayedBy, reqGameInfo};

module.exports =  { API };