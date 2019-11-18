const {getConference, getDivision, Divisions, Conferences} = require("../../util/constants");

const {dateStringify} = require("../../util/utilities");

const {Game} = require("../models/GameModel");
const {GameInfo, findTodaysGames} = require("../models/GameInfoModel");
const {GameData} = require("../../data/GameData");

const GameAPI = require("./game");
const PeriodAPI = require("./period");
const SeasonAPI = require("./season");

const DefaultPredicate = team => {
    return {$or: [{"teams.home": team}, {"teams.away": team}]};
};
// {$or: [{"teams.home": "Anaheim Ducks" }, {"teams.away": "Anaheim Ducks" }]}
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

async function findLastXGamesByTeamBefore (team, date, span) {
    let dateFilter = { datePlayed: { $lt: date }};
    let teamFilter = {$or: [{"teams.home": team}, {"teams.away": team}]};
    let full = { $and: [dateFilter, teamFilter ] };
    let sortBy = {datePlayed: -1};
    return Game.find(full).sort(sortBy).limit(span).then(games => {
        if(games.length === 0) {
            throw new Error(`No games were found, played by ${team} before ${date}.`);
        }
        return games;
    })
}

async function getAllGamesPlayedBy(team) {
    return Game.find(DefaultPredicate(team)).then(games => {
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
   return findTodaysGames();
}

class DivisionAnalysis {
    constructor(team) {
        this.team = team;
        this.conference = getConference(team);
        this.division = getDivision(team;
        this.divWins = [];
        this.divLosses = [];
        this.divGA = [];
        this.divGF = [];
        this.divSA = [];
        this.divSF = [];
        this.games = 0;
        this.done = false;

        Divisions.forEach(div => {
            this.divWins[div] = 0;
            this.divLosses[div] = 0;
            this.divGA[div] = 0;
            this.divGF[div] = 0;
            this.divSA[div] = 0;
            this.divSF[div] = 0;
        })
    }

    /**
     *
     * @param {GameData[]} gameDatas
     */
    analyzeGameData(gameDatas) {
        if(this.done) {
            throw new Error(`Trying to initialize with game data, when object is already initialized.`);
        }
        this.games = gameDatas.length;
        gameDatas.forEach(gd => {
            let opp = gd.getOtherTeamName(this.team);
            let opponentDivision = getDivision(opp);
            if(gd.winner === this.team)
                this.divWins[opponentDivision] += 1;
            else
                this.divLosses[opponentDivision] += 1;
            this.divGA[opponentDivision] += gd.getGoalsBy(opp);
            this.divGF[opponentDivision] += gd.getGoalsBy(this.team);
            this.divSA[opponentDivision] += gd.getShotsBy(opp);
            this.divSF[opponentDivision] += gd.getShotsBy(this.team);
        });
        this.done = true;
    }

    getDivGameCount(div) {
        return this.divWins[div] + this.divLosses[div];
    }

    getDivGAA(div) {
        if(this.getDivGameCount(div) === 0) return 0;
        return this.divGA[div] / this.getDivGameCount(div);
    }
    getDivGFA(div) {
        if(this.getDivGameCount(div) === 0) return 0;
        return this.divGF[div] / this.getDivGameCount(div);
    }
    getDivSFA(div) {
        if(this.getDivGameCount(div) === 0) return 0;
        return this.divSF[div] / this.getDivGameCount(div);
    }
    getDivSAA(div) {
        if(this.getDivGameCount(div) === 0) return 0;
        return this.divSA[div] / this.getDivGameCount(div);
    }

    /**
     * Gets division results for this team, against opponents in division that @param team plays in.
     * @param team The opponent's team name. Used to look up what division they play in.
     * @return {Object}
     */
    getOpponentDivisionResults(team) {
        let div = getDivision(team);
        let result = {
            division: div,
            conference: getConference(team),
            wins: this.divWins[div],
            losses: this.divLosses[div],
            averages: {
                GAA: this.getDivGAA(div)
                GFA: this.getDivGFA(div),
                SAA: this.getDivSAA(div),
                SFA: this.getDivSFA(div)
            },
            totals: {
                GA: this.divGA[div],
                GF: this.divGF[div],
                SA: this.divSA[div],
                SF: this.divSF[div]
            }
        }
    }
}

const API = { ...GameAPI, ...PeriodAPI, DivisionAnalysis, getLastXGamesWonBy, getLastXGamesLostBy, getLastXGamesPlayedBy, reqGameInfo, getGamesToday, getAllGamesPlayedBy, findLastXGamesByTeamBefore,...SeasonAPI};

module.exports =  { API };