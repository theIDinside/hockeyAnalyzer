'use strict';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
let localTestMDBHost = 'mongodb://localhost/nhltest';
let databaseName = "";

const mongoDBHost = () => {
    const user = "NHLAnalytics"; // this user does not have write access
    const pw = "season2018"; // so this will be what the end user uses to connect.
    const remoteNHLDB = `mongodb://${user}:${pw}@ds125945.mlab.com:25945/nhl`;
    if(process.env.DEBUGDB === "ON")
        return `mongodb://localhost/nhltest`;
    else
        return remoteNHLDB;
};

mongoose.connect(mongoDBHost(), {useNewUrlParser: true}).then(v => {
    console.log(`Connected to database backend: ${mongoDBHost()}`);
});

let DB = mongoose.connection;
DB.on('error', console.error.bind(console, 'MongoDB connection error.'));
DB.on("open", () => {
    console.log(`Connected to database @ ${mongoDBHost()}`);
});

module.exports = {
    mongoDBHost, DB
}