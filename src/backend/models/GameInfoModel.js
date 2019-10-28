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

GameInfoSchema.statics.findTodaysGames = function(league="nhl") {
    let l = league.toUpperCase();
    if(l === "NHL")
    {
        let date_str = new Date().toLocaleString("en-us", { timeZone: "America/New_York"}); // All games are shown in Eastern Time, on www.nhl.com
        let date = new Date(date_str);
        let tomorrow = daysFromDate(date, 1);
        return GameInfo.find({ datePlayed: { $gte: new Date(day), $lt: new Date(tomorrow) }}).then(res => {
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
    } else if(l === "SHL") {
        console.log("ERROR: SHL FUNCTIONALITY NOT YET IMPLEMENTED");
    }
}
80
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

module.exports = { GameInfo };
