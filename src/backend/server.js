// Backend server, written in either Hapi || Express.

const express = require('express');
const mongoose = require('mongoose');

const Standings = require('./models/StandingsModel')
const Game = require('./models/GameModel')
const Player = require('./models/PlayerModel')

let user = "NHLAnalytics";
let pw = "season2018";
let remoteNHLDB = `mongodb://${user}:${pw}@ds125945.mlab.com:25945/nhl`;
let localTestMDBHost = 'mongodb://localhost/nhltest';
let databaseName = "";

const mongoDBHost = () => {
    if(process.env.DEBUGDB)
        return `mongodb://localhost/nhltest`;
    else
        return remoteNHLDB;
};

mongoose.Promise = global.Promise;
mongoose.connect(mongoDBHost());
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error.'));
db.on("open", () => {
    console.log(`Connected to database @${mongoDBHost()}`);
});