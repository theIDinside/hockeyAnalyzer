/**
    Setup file. This will scrape the entire NHL season up until today's date, and store all the data inside provided
    MongoDB. Run this once. Running this multiple times, should result in basically clearing the DB and refreshing the DB.
*/
const {seasonStart} = require('./util/constants');
const {getGameSummaryURL, getGameIDsAtDate, scrapeGameSummaryReport, getGamePageURL,getGameIDsAtDateHTML,ScoringSummary,removePrefixOf} = require('./scrape/GameScrape');
const {getGameDate,scrapeShotsOnGoal,scrapePlayerTotals,GoalieStat,PlayerStat,scrapeTeamsTotals,TeamTotal} = require('./scrape/GameStats');
const {getGameURL, l} = require('./util/utilities');
const puppeteer = require('puppeteer');
const {createGameDocument, Game} = require('./backend/models/GameModel');
const mongoose = require('mongoose');
function* IDRange(start, end) {
    let i = start;
    while(i < end)
        yield i++;
}
const user = process.env.NHL;
const pass = process.env.NHLPASS;
const remoteDB = `mongodb://${user}:${pass}@ds125945.mlab.com:25945/nhl`;

const mongoDBHost = () => {
    if(process.env.DEBUGDB)
        return `mongodb://localhost/nhltest`;
    else
        return remoteDB;
};


/**
 * Returns dates for start of the season, and today's date.
 * @returns {Date[]}
 */
function setupDates() {
    let startDate = new Date(seasonStart);
    let currentDate = new Date();
    return [startDate, currentDate];
}

async function getGameIDRange(start, end) {
    // begin scraping all games between first and last (exclusive).-
    // For example, if we want all games up until today, we dont want to scrape today, since it has most likely not been played yet
    let beginID = getGameIDsAtDate(start);
    let endID = getGameIDsAtDate(end);

    return Promise.all([beginID, endID]).then(values => {
        let res1 = values[0];
        let res2 = values[1];
        let rangeBegin = 2018020001; // regular season's first game.
        let rangeEnd = Number.parseInt(res2[0]);
        for(let idx of res1) {
            let t = idx.toString();
            if(t[5] !== "2") {
                // the game id does not look like: 201802xxxx, but for example 201801xxxx, this means its not reg season
            } else {
                rangeBegin = Number.parseInt(idx);
                break;
            }
        }
        let arr = Array.from(IDRange(rangeBegin, rangeEnd));
        for(let id in arr) {
            // 2018020121
            let tmp_str = arr[id].toString();
            if(tmp_str[5] !== '2')
            {
                console.log(`Game with ID ${arr[id]} is not part of the regular season`);
                arr.splice(id, 1);
            }
        }
        return arr;
    })
}

async function scrapeGames() {
    // read input from the console, or parameters, that can determine if this script is being run correctly
    let [start, end] = setupDates();
    let gameRange = await getGameIDRange(start, end);
    let gameCenterURLPrefix = `https://www.nhl.com/gamecenter/`;
    let summarySuffix = ",game_tab=stats";
    let mPathDefault = "mongodb://localhost/nhltest";
    let mdb = process.env.MDB || mPathDefault;
    mongoose.connect(mPathDefault, {useNewUrlParser: true});
    mongoose.Promise = global.Promise;
    let db = mongoose.connection;
    db.once('open', () => {
        l(`Connected to database: ${mdb}`);
    });
    let scrapedSuccesfully = 0;

    for(let gid of gameRange) {
        const func = async () => {
            let browser = await puppeteer.launch();
            l(`Scraping game: ${gid}`);
            let gameCenterURL = `${gameCenterURLPrefix}${gid}`;
            const page = await browser.newPage();
            await page.goto(gameCenterURL);
            let scrapeUrl = await page.url().concat(summarySuffix);
            l(`Requesting data from: ${scrapeUrl}... Please wait`);
            await page.goto(scrapeUrl, {waitUntil: "networkidle2"});
            const htmlData = await page.content();
            let pGameDate = getGameDate(htmlData);
            let pTeams = scrapeTeamsTotals(htmlData);
            let gameSummary = getGameSummaryURL(gid);
            let pPlayers = scrapePlayerTotals(htmlData);
            let pScoringSummary = scrapeGameSummaryReport(gameSummary);
            let pShotsPeriod = scrapeShotsOnGoal(htmlData);
            await Promise.all([pGameDate, pTeams, pPlayers, pScoringSummary, pShotsPeriod]).then(values => {
                let [gameDate, [aTeam, hTeam], [aPlayers, hPlayers], scoringSummary, shotsOnGoal] = values;
                createGameDocument(gid.toString(), gameDate, aTeam, hTeam, aPlayers, hPlayers, shotsOnGoal, scoringSummary).then(document => {
                    document.save().then(_ => scrapedSuccesfully++);
                })
            }).catch(err => {
                l("Error occured: " + `${err}`);
                browser.close();
                throw new Error(`Error occured. Closing connection. Error message: ${err}`);
            });
            browser.close();
        };
        await func();
    }

    db.once('close', () => {
        l("Disconnected from database.")
    });
    return { games: gameRange.length, scraped: scrapedSuccesfully };
}

(async () => {
    console.log("Setting up database.");
    console.log(`Connecting to database... @${mongoDBHost()}`)
    mongoose.connect(mongoDBHost());
    let db = mongoose.connection;
    scrapeGames().then(res => {
        l(`Out of ${res.games} games, scraped ${res.scraped} successfully`);
    });
});



module.exports = {
    getGameIDRange,
    setupDates,
    IDRange
};