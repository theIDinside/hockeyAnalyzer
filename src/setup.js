/**
    Setup file. This will scrape the entire NHL season up until today's date, and store all the data inside provided
    MongoDB. Run this once. Running this multiple times, should result in basically clearing the DB and refreshing the DB.
*/
const {getGameSummaryURL, getGameIDsAtDate, scrapeGameSummaryReport } = require('./scrape/GameScrape');
const {getGameDate,scrapeShotsOnGoal,scrapePlayerTotals,GoalieStat,PlayerStat,scrapeTeamsTotals,TeamTotal} = require('./scrape/GameStats');
const {getGameURL, l, seasonStart} = require('./util/utilities');
const {teams, getFullTeamName, dumpErrorStackTrace} = require("./util/constants");
const puppeteer = require('puppeteer');
const {createGameDocument, Game, getLastXGamesPlayedBy} = require('./backend/models/GameModel');
const GameInfo = require("./backend/models/GameInfoModel");
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
    if(process.env.DEBUGDB === "ON")
        return `mongodb://localhost/nhltest`;
    else
        return remoteDB;
};


/** * Returns dates for start of the season, and today's date.
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
        let rangeEnd = Number.parseInt(res2[0]); // this is a range of [res1, res2). so res1 <= x < res2
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

async function scrapeGames(startID=null, endID=null) {
    if(startID === null) {
        startID = 2018020001;
    }
    // read input from the console, or parameters, that can determine if this script is being run correctly
    let [start, end] = setupDates();
    let gameRange = await getGameIDRange(start, end);
    let gameCenterURLPrefix = `https://www.nhl.com/gamecenter/`;
    let summarySuffix = ",game_tab=stats";

    let scrapedSuccessfully = 0;
    endID = (endID === null || endID === undefined) ? gameRange[gameRange.length-1] : endID;

    gameRange = gameRange.filter((val, index) => val >= startID && val <= endID);

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
                    document.save().then(_ => scrapedSuccessfully++);
                })
            }).catch(err => {
                let logdata = dumpErrorStackTrace(err);
                require("fs").writeFile("./error.log", logdata, err => {
                    if(err) {
                        throw err;
                    }
                    console.log("Saved log data to error.log");
                });
            });
            browser.close();
        };
        await func();
    }
    return { games: gameRange.length, scraped: scrapedSuccessfully };
}

function SetupUI() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stderr
    });

    console.log("Choose action:");
    console.log("1: Start scraping season");
    console.log("2: Lookup last scraped game");
    console.log("3: Repair database");
    rl.on('line', (l) => {
        switch (l) {
            case "1":
                break;
            case "2":
                break;
            case "3":
                break;
            case "q":
            case "Q":
                break;
            default:
                console.log(`Erroneous input: ${l}`);
        }
    });
}

// NB: Run once
/**
 * Updated. Pretty cool. At least now, we scrape 10 pages / game id and game info in "parallell". Increases the speed quite dramatically.
 * @return {Promise<void>}
 */
async function scrapeGameInfo(browser) {
    // scrape ALL upcoming games, so that a gameID can be searched for quickly getting teams playing in that game.
    // that way, we wont have to scrape an upcoming game's page, every time we do a search or something, because that
    // data will be stored in the GameInfo collection.
    const gameCenterURL = (id) => `https://www.nhl.com/gamecenter/${id}`;

    GameInfo.find({}).sort({gameID: -1}).exec(async (err, gInfoDocs) => {
        if(gInfoDocs.length > 0) {
            let lastGameInfoDoc = gInfoDocs[0];
            if (lastGameInfoDoc.gameID === 2018021271 && gInfoDocs.length === (2018021271 - 2018020000)) {
                console.log("All game info documents have been scraped and saved. No need to continue.")
            } else {
                console.log("Starting to scrape Game Info documents...");
                let gameIDs = Array.from(IDRange(lastGameInfoDoc.gameID + 1, (2018021271) + 1));
                // let gameIDs = Array.from(IDRange(lastGameInfoDoc.gameID + 1, lastGameInfoDoc.gameID + 30));
                for (let id = gameIDs[0]; id < gameIDs[gameIDs.length - 1]; id += 10) {
                    let pageNums = Array.from(IDRange(id, id + 10)).map(async gID => {
                        console.log(`Navigating to page of game id ${gID}`)
                        let page = await browser.newPage();
                        await page.goto(gameCenterURL(gID));
                        return { page: page, GameID: gID };
                    });
                    await Promise.all(pageNums).then(async pages => {
                        pages.forEach(async payload => {
                            let page = payload.page;
                            let id = payload.GameID;
                            let url = await page.url();
                            console.log(`Trying to scrape game info at: ${url}`)
                            let [teams, year, month, day] = url.split("gamecenter/")[1].split("/");
                            let [a, h] = teams.split("-vs-");
                            let away = getFullTeamName(a);
                            let home = getFullTeamName(h);
                            let date = new Date(`${year}-${month}-${day}`);
                            let gameInfo = new GameInfo({
                                gameID: id,
                                teams: {
                                    away: away,
                                    home: home,
                                },
                                datePlayed: date
                            });
                            gameInfo.save();
                            await page.close();
                        })
                    })
                }
            }
        } else {
            let gameIDs = Array.from(IDRange(2018020001, (2018021271) + 1));
            for (let id = gameIDs[0]; id < gameIDs[gameIDs.length - 1]; id += 10) {
                let pageNums = Array.from(IDRange(id, id + 10)).map(async gID => {
                    let page = await browser.newPage();
                    await page.goto(gameCenterURL(gID));
                    return { page: page, GameID: gID };
                });
                await Promise.all(pageNums).then(async pages => {
                    pages.forEach(async payload => {
                        let page = payload.page;
                        let id = payload.GameID;
                        let url = await page.url();
                        let [teams, year, month, day] = url.split("gamecenter/")[1].split("/");
                        let [a, h] = teams.split("-vs-");
                        let away = getFullTeamName(a);
                        let home = getFullTeamName(h);
                        let date = new Date(`${year}-${month}-${day}`);
                        let gameInfo = new GameInfo({
                            gameID: id,
                            teams: {
                                away: away,
                                home: home,
                            },
                            datePlayed: date
                        });
                        gameInfo.save();
                        await page.close();
                    })
                })
            }
        }
    })
}

(async () => {
    console.log("Setting up database.");
    console.log(`Connecting to database... @${mongoDBHost()}`);
    mongoose.Promise = global.Promise;
    mongoose.connect(mongoDBHost(), {useNewUrlParser: true});
    let db = mongoose.connection;
    db.on('close', () => {
        l("Disconnected from database.")
    });
    db.once('open', async () => {
        l(`Connected to database: ${mongoDBHost()}`);
        let browser = await puppeteer.launch();
        await scrapeGameInfo(browser).then(async _ => {
            await Game.find({}).sort({gameID: -1}).limit(1).exec((err, games) => {
                if(games.length > 0){
                    l(`Found ${games.length} games`);
                    l(`Start scraping at ${games[0].gameID}`);
                    let gID = (games[0] === undefined || games[0] === null) ? 2018020001 : games[0].gameID;
                    scrapeGames(gID+1, null).then(res => {
                        l(`Out of ${res.games} games, scraped ${res.scraped} successfully`);
                    });
                } else {
                    l("Found no games: " + games.length);
                    scrapeGames(2018020001, null).then(res => {
                        l(`Out of ${res.games} games, scraped ${res.scraped} successfully`);
                    });
                }
            });
            browser.close();
        });
    });

})();


module.exports = {
    getGameIDRange,
    setupDates,
    IDRange
};
