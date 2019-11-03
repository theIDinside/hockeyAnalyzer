const {dateStringify} = require("../../util/utilities");

const {Game} = require("../models/GameModel");
const {GameInfo} = require("../models/GameInfoModel");

const GameAPI = require("./game");
const PeriodAPI = require("./period");
const SeasonAPI = require("./season");

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

const HomeGamesPredicate = team => {
    return { "teams.home": team}
}

const AwayGamesPredicate = team => {
    return { "teams.away": team}
}

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
            console.log(`Got ${games.length} games played by ${team}. Returning these games for analysis.`);
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
        if(gi.length > 0) {
            console.log(`Game id: ${gi[0].gameID}. Teams: ${gi[0].teams.away} - ${gi[0].teams.home}`)
            return {
                gameID: gi[0].gameID,
                teams: gi[0].teams,
            }
        } else
            throw new Error(`No game with gameID ${gameID} was found.`);
    })
}

async function getGamesToday() {
   return GameInfo.findTodaysGames();
}

const API = { ...GameAPI, ...PeriodAPI, getLastXGamesWonBy, getLastXGamesLostBy, getLastXGamesPlayedBy, reqGameInfo, getGamesToday, ...SeasonAPI};

module.exports =  { API };