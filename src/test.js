const {getGameSummaryURL, scrapeGameSummaryReport} = require('./scrape/GameScrape');
const st = require('./scrape/SeasonTable');
const {TeamTotal, scrapeTeamsTotals, PlayerStat,GoalieStat,scrapePlayerTotals,scrapeShotsOnGoal, getGameDate} = require('./scrape/GameStats');
const {anyOf, daysFrom} = require('./util/utilities');
const l = (msg) => console.log(msg);
const {seasonStart, teams} = require('./util/constants');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const {getGameIDRange, IDRange, setupDates} = require('./setup');
let {createGameDocument, Game} = require('./backend/models/GameModel');

/**
 * This test function scrapes a game's full statistics such as,
 * - Team totals:
 * Shots on goal | Face off win % | Power play statistics | Penalty minutes | Hits | Blocked shots | Giveaways.
 * - Individual player statistics of the game.
 * - Shots on goal per period
 * - Scoring summary:
 *  Goal number | Period | Time | Strength | Team | Scorer | 1st Assist | 2nd Assist | On ice away | On ice home
 *
 *  When scraping the entire season, this is the content that will be scraped for each game.
 * @returns {Promise<void>}
 */
async function testScrapeDucksVsJets() {
    let teamStats = `https://www.nhl.com/gamecenter/ana-vs-wpg/2019/02/02/2018020797#game=2018020797,game_state=final,game_tab=stats`;
    let gameSummary = `http://www.nhl.com/scores/htmlreports/20182019/GS020797.HTM`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(teamStats, {waitUntil: "networkidle2"});
    const _ = page.evaluate(() => {});
    const htmlData = await page.content();
    l(`Requesting data from: ${teamStats}... Please wait`);
    browser.close();
    let gameID = "2018020797";
    let gameDate = new Date("2019-02-02");
    let pTeams = scrapeTeamsTotals(htmlData);
    l("Scraping player totals");
    let pPlayers = scrapePlayerTotals(htmlData);
    let pScoringSummary = gs.scrapeGameSummaryReport(gameSummary);
    let pShotsPeriod = scrapeShotsOnGoal(htmlData);

    Promise.all([pTeams, pPlayers, pScoringSummary, pShotsPeriod]).then(results => {
        let [tTotal, [ap, hp], scoringSummary, shotStats] = results;
        l("Shots per period:");
        let aTeam = tTotal[0];
        let hTeam = tTotal[1];
        for(let period in shotStats)
        {
            l(`Period ${period+1}: ${shotStats[period].away} - ${shotStats[period].home}`)
        }
        l("Team totals: ");
        l(`${aTeam.name} ${aTeam.toString()}`);
        l(`${hTeam.name} ${hTeam.toString()}`);
        l("Away player stats:");
        for(let skater of ap.skaters) {
                l(skater.toString());
        }
        l("Away goalie stats:");
        for(let goalie of ap.goalies) {
            l(goalie.toString());
        }

        l("Home player stats:");
        for(let skater of hp.skaters) {
            l(skater.toString());
        }
        l("Home goalie stats");
        for(let goalie of hp.goalies) {
            l(goalie.toString());
        }
        scoringSummary.print();
        let mPath = "mongodb://localhost/nhltest";
        mongoose.connect(mPath);
        mongoose.Promise = global.Promise;
        let db = mongoose.connection;
        db.once('open', () => {
            l(`Connected to database: ${mPath}`);
            createGameDocument(gameID, gameDate, aTeam, hTeam, ap, hp, shotStats, scoringSummary).then(doc => {
                doc.save();
            }).catch(err => {
                l(`Error occurred: ${err}`)
            });
        });
        // l("Trying to find document:")
        // Game.find({gameID: `${gameID}`}).exec((err, game) => { l(game);});
    }).catch(err => {
        l("Couldn't scrape or insert document: ");
        l(err);
    });
}

async function saveFirst10GamesToDB() {
    l("Team count: " + teams.length);
    let gameRange = Array.from(IDRange(2018020001, 2018020011));
    l(`${gameRange}`);
    l("Begin scraping of " + gameRange.length + " games");
    let gameCenterURLPrefix = `https://www.nhl.com/gamecenter/`;
    let summarySuffix = ",game_tab=stats";
    let mPath = "mongodb://localhost/nhltest";
    mongoose.connect(mPath, {useNewUrlParser: true});
    mongoose.Promise = global.Promise;
    let db = mongoose.connection;
    db.once('open', () => {
        l(`Connected to database: ${mPath}`);
    });

    for(let gid of gameRange) {
        let func = async () => {
            let browser = await puppeteer.launch();
            l(`Scraping game: ${gid}`);
            let gameCenterURL = `${gameCenterURLPrefix}${gid}`;
            const page = await browser.newPage();
            // await page.goto(gameCenterURL, {waitUntil: "networkidle2"});
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
                    document.save();
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
    mongoose.disconnect();
}

(async function() {
    let today = new Date().toISOString().split("T")[0];
    l(`Today's date: ${today}. Tomorrow: ${daysFrom(today, 1).toISOString().split("T")[0]}`);
    await testScrapeDucksVsJets();
    await saveFirst10GamesToDB();
})();