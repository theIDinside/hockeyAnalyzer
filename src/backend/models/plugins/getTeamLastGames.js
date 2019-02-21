const {Game} = require("../GameModel");

const DefaultPredicate = team => {
    return {$or: [{"teams.home": team}, {"teams.away": team}]};
};

function getHomeTeamLastGames(x) {
    let dateSort = {datePlayed: -1};
    return Game.find(DefaultPredicate(this.teams.home)).sort(dateSort).limit(x).then((games) => {
        if(games.length > 0) {
            return games;
        } else {
            throw new Error(`Could not find any games with team ${team}`);
        }
    })
}

function getAwayTeamLastGames(x) {
    let dateSort = {datePlayed: -1};
    return Game.find(DefaultPredicate(this.teams.away)).sort(dateSort).limit(x).then((games) => {
        if(games.length > 0) {
            return games;
        } else {
            throw new Error(`Could not find any games with team ${team}`);
        }
    })
}

module.exports = {getHomeTeamLastGamesPlugin: getHomeTeamLastGames, getAwayTeamLastGamesPlugin: getAwayTeamLastGames};