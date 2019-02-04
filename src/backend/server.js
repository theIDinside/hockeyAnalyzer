const express = require('express');
const mongoose = require('mongoose');

const Standings = require('./models/StandingsModel')
const Game = require('./models/GameModel')
const Player = require('./models/PlayerModel')
const Team = require('./models/TeamModel')


let mongodbHost = 'mongodb://localhost/test';
let databaseName = ""

const mongoDBHost = () => `mongodb://localhost/${databaseName}`;

function getDatabase(db) {
    return `${mongodbHost}/${db}`;
}

mongoose.connect(mongoDBHost());
mongoose.Promise = global.Promise;

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error.'));