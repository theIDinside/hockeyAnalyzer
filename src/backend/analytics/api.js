const {dateStringify} = require("../../util/utilities");

const {Game} = require("../models/GameModel");
const {GameInfo} = require("../models/GameInfoModel");

const GameAPI = require("./game");
const PeriodAPI = require("./period");

const DefaultPredicate = team => {
    return {$or: [{"teams.home": team}, {"teams.away": team}]};
};

const LossPredicate = team => {
    return {
        $and: [
            {$or: [{"teams.home": team}, {"teams.away": team}]},
            {"teamWon": {$ne: team} }
            ]
    }
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
            console.log(`Found: ${games.length} games with ${team} playing and they won.`);
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
            console.log(`Found: ${games.length} games with ${team} playing and they lost.`);
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
 * @param gameID
 * @return {Promise<*>}
 */
async function reqGameInfo(gameID) {
    return GameInfo.find({gameID: gameID}).then((gi) => {
        if(gi.length > 0)
            return {
                gameID: gi[0].gameID,
                teams: gi[0].teams,
            }
        else
            throw new Error(`No game with gameID ${gameID} was found.`);
    })
}

async function getGamesToday() {
    let d = new Date();
    if(d.getHours() <= 5) {
        d.setUTCDate(d.getUTCDay() - 1);
        let search = dateStringify(d);
        return GameInfo.find({datePlayed: new Date(search)}).then(res => {
            if(res.length > 0) {
                console.log(`Found ${res.length} games today.`);
                res.forEach(gi => {
                    console.log(`${gi.teams.away} vs ${gi.teams.home}`);
                })
            return res;
            } else {
                console.log("Found no games!");
                return []
            }
        })
    } else {
        let search = dateStringify(d);
        return GameInfo.find({datePlayed: new Date(search)}).then(res => {
            if(res.length > 0) {
                console.log(`Found ${res.length} games today.`);
                res.forEach(gi => {
                    console.log(`${gi.teams.away} vs ${gi.teams.home}`);
                })
                return res;
            } else {
                console.log("Found no games!");
                return []
            }
        })
    }
}

const API = { ...GameAPI, ...PeriodAPI, getLastXGamesWonBy, getLastXGamesLostBy, getLastXGamesPlayedBy, reqGameInfo, getGamesToday};

module.exports =  { API };