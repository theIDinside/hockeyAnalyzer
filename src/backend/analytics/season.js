const {Game} = require("../models/GameModel");

const HomeGamesPredicate = team => {
    return { "teams.home": team}
}

const AwayGamesPredicate = team => {
    return { "teams.away": team}
}

async function getHomeGames(x, team) {
    const {dateStringify} = require("../../util/utilities");
    let dateSort = {datePlayed: -1}; // descending sort
    return Game.find(HomeGamesPredicate(team)).sort(dateSort).limit(x).then((games) => {
        if(games.length > 0) {
            return games;
        } else {
            throw new Error(`Could not find any games with team ${team}`);
        }
    })
}

async function getRoadGames(x, team) {
    const {dateStringify} = require("../../util/utilities");
    let dateSort = {datePlayed: -1}; // descending sort
    return Game.find(AwayGamesPredicate(team)).sort(dateSort).limit(x).then((games) => {
        if(games.length > 0) {
            return games;
        } else {
            throw new Error(`Could not find any games with team ${team}`);
        }
    })
}

module.exports = { getHomeGames, getRoadGames };