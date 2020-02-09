const {dateStringify} = require("../../util/utilities");
const {Game} = require("./GameModel");
const { daysFromDate } = require('../../util/utilities');
const getGamesPlugin = require("./plugins/getTeamLastGames");

const mongoose = require('mongoose');
let Schema = mongoose.Schema;

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

let GameInfoSchema = new Schema({
    gameID: {type: Number, unique: true},
    teams: {
        away: { type: String, required: '{PATH} is required!'},
        home: { type: String, required: '{PATH} is required!'}
    },
    datePlayed: {
        type: Date,
        required: true
    }
});

GameInfoSchema.methods.getHomeTeamLastGames = function(x) {
    let dateSort = {datePlayed: -1};
    return Game.find(DefaultPredicate(this.teams.home)).sort(dateSort).limit(x).then((games) => {
        if(games.length > 0) {
            return games;
        } else {
            throw new Error(`Could not find any games with team ${team}`);
        }
    })
};

GameInfoSchema.methods.getAwayTeamLastGames = function(x) {
    let dateSort = {datePlayed: -1};
    return Game.find(DefaultPredicate(this.teams.away)).sort(dateSort).limit(x).then((games) => {
        if(games.length > 0) {
            return games;
        } else {
            throw new Error(`Could not find any games with team ${team}`);
        }
    })
};

async function findTodaysGames(league="nhl") {
    let l = league.toUpperCase();
    if(l === "NHL")
    {
        console.log(`Searching for games today. League: ${league}`);
        let date_str = new Date().toLocaleString("en-us", { timeZone: "America/New_York"}); // All games are shown in Eastern Time, on www.nhl.com
        let date = new Date(date_str);

        let tomorrow = daysFromDate(date, 1);
        tomorrow.setUTCHours(0); // no games start (usually, i have no way of knowing at this point) at 00:00 midnight. So the day ends there.
        let midnight = date.toISOString().split("T")[0];
        let d = new Date(midnight);
        console.log(`Searching for games between: ${d} and ${tomorrow}`);
        return GameInfo.find({ datePlayed: { $gte: d, $lt: tomorrow }}).then(res => {
            console.log("Search results: ");
            if(res.length > 0) {
                console.log(`Found ${res.length} games today.`);
                res.forEach(gi => {
                    console.log(`${gi.teams.away} vs ${gi.teams.home}`);
                });
                return res;
            } else {
                console.log(`Found no games between ${date} and ${tomorrow}. Returning last (regular season) game played.`);
                GameInfo.find({ datePlayed: { $lt: d } }).then(res => {
                    let gameIDs = res.map(gInfo => gInfo.gameID).sort();
                });
                
                return []
            }
        })
    } else if(l === "SHL") {
        console.log("ERROR: SHL FUNCTIONALITY NOT YET IMPLEMENTED");
        return [];
    }
}

async function findLastPlayedGameID(league="NHL", regSeasonOnly=true) {
    if(regSeasonOnly) {
        let date_str = new Date().toLocaleString("en-us", { timeZone: "America/New_York"}); // All games are shown in Eastern Time, on www.nhl.com
        let date = new Date(date_str);
        let midnight = date.toISOString().split("T")[0];
        let d = new Date(midnight);
        console.log("Searching for all games played up until: " + d);
        let res = await GameInfo.find({datePlayed: { $lte: d}}).then(gs => {
            return gs;
        });
        let lastGame = res.sort((a, b) => a.gameID - b.gameID)[res.length-1];
        console.log(`Last played game's ID: ${lastGame}`);
        return lastGame.gameID;
    }
}

GameInfoSchema.statics.findGamesToday = function() {
    let d = new Date();
    if(d.getHours() <= 5) { // correct for time difference. 5-6 am Sweden, is around 8-9 LA time.
        d.setUTCDate(d.getUTCDate() - 1);
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

GameInfoSchema.post("save", (gInfoDoc) => {
   console.log(`Saved game info. ID: ${gInfoDoc.gameID} ${gInfoDoc.teams.away} vs ${gInfoDoc.teams.home}. Date played: ${gInfoDoc.datePlayed}`)
});

let GameInfo = mongoose.model("GameInfo", GameInfoSchema);

module.exports = { GameInfo, findTodaysGames, findLastPlayedGameID};
