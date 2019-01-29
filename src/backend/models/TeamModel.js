const mongoose = require('mongoose')
let Schema = mongoose.Schema;

let TeamModelSchema = new Schema({
    team: String,
    teamAbbr: String,
    teamID: String,
})