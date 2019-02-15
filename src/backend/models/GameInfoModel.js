const {dateStringify} = require("../../util/utilities");

const mongoose = require('mongoose');
let Schema = mongoose.Schema;

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

GameInfoSchema.post("save", (gInfoDoc) => {
   console.log(`Saved game info. ID: ${gInfoDoc.gameID} ${gInfoDoc.teams.away} vs ${gInfoDoc.teams.home}. Date played: ${dateStringify(gInfoDoc.datePlayed)}`)
});

let GameInfo = mongoose.model("GameInfo", GameInfoSchema);

module.exports = GameInfo;
