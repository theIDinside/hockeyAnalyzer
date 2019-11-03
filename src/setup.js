/**
    Setup file. This will scrape the entire NHL season up until today's date, and store all the data inside provided
    MongoDB. Run this once. Running this multiple times, should result in basically clearing the DB and refreshing the DB.
*/
const {getGameSummaryURL, getGameIDsAtDate, scrapeGameSummaryReport } = require('./scrape/GameScrape');
const {getGameDate,scrapeShotsOnGoal,scrapePlayerTotals,GoalieStat,PlayerStat,scrapeTeamsTotals,TeamTotal} = require('./scrape/GameStats');
const UTIL = require('./util/utilities')
const {teams, getFullTeamName, getSeasonStart} = require("./util/constants");
const puppeteer = require('puppeteer');
const {createGameDocument, Game, getLastXGamesPlayedBy} = require('./backend/models/GameModel');
const { GameInfo, findTodaysGames }= require("./backend/models/GameInfoModel");
const mongoose = require('mongoose');

const SCHEDULE_FILE = "2019_2020_NHL_Schedule.csv";

function* IDRange(start, end) {
    let i = start;
    while(i < end)
        yield i++;
}
const user = process.env.NHL;
const pass = process.env.NHLPASS;
const SEASON=process.env.SEASON; // HAS TO BE IN THE FORMAT OF STARTINGYEAR/ENDYEAR: 19/20, 20/21 etc... 
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
function setupDates(season) {
    let startDate = new Date(getSeasonStart(season));
    let currentDate = new Date();
    return [startDate, currentDate];
}

function getSeason() {
    let season = SEASON.split("/")[0]; // starting year of season
    return Number.parseInt(`20${season}`);
}

/**
 * Returns all the game ID's of the games between the dates [start; end]. 
 * @param {Date} start The begin date to start retrieving game ID span from
 * @param {Date} end  The end date to start retrieving game ID span from
 * @return {Promise<Number[]>} returns an array of all the game ID's between date start and date end.
 */
async function getGameIDRange(start, end) {
    // begin scraping all games between first and last (exclusive).-
    // For example, if we want all games up until today, we dont want to scrape today, since it has most likely not been played yet
    let beginID = getGameIDsAtDate(start);
    let endID = getGameIDsAtDate(end);

    return Promise.all([beginID, endID]).then(values => {
        let res1 = values[0];
        let res2 = values[1];
        console.log(`Begin scraping from ${res1[0]} to ${res2[0]}. (End EXCLUSIVE.)`)
        let rangeBegin = 2019020001; // regular season's first game.
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
    let season = getSeason();
    let [seasonGameIDBegin, seasonGameIDEnd] = getFullGameIDRange(season);
    if(startID === null) {
        startID = seasonGameIDBegin;
    }
    console.log(`Begin id to scrape: ${seasonGameIDBegin}, ending ID: ${seasonGameIDEnd}`);
    let [start, end] = setupDates("19/20");
    let gameRange = await getGameIDRange(start, end);
    let gameCenterURLPrefix = `https://www.nhl.com/gamecenter/`;
    let summarySuffix = ",game_tab=stats";

    let scrapedSuccessfully = 0;
    endID = (endID === null || endID === undefined) ? seasonGameIDEnd : endID;

    gameRange = gameRange.filter((val, index) => val >= startID && val <= endID);
    let browser = await puppeteer.launch();
    for(let gid of gameRange) {
        const func = async () => {
            UTIL.l(`Scraping game: ${gid}`);
            let gameCenterURL = `${gameCenterURLPrefix}${gid}`;
            const page = await browser.newPage();
            await page.goto(gameCenterURL);
            let scrapeUrl = await page.url().concat(summarySuffix);
            UTIL.l(`Requesting data from: ${scrapeUrl}... Please wait`);
            await page.goto(scrapeUrl, {waitUntil: "networkidle2"});
            const htmlData = await page.content();
            let pGameDate = GameInfo.findOne({gameID: gid}).then(async doc => {
                if(doc.datePlayed === null) console.log("ERROR RETRIEVING THE GAME DATE");
                let pGameDate = doc.datePlayed;
                return pGameDate;
            });
            // let pGameDate = getGameDate(htmlData);   
            let pTeams = scrapeTeamsTotals(htmlData);
            let gameSummary = getGameSummaryURL(gid);
            let pPlayers = scrapePlayerTotals(htmlData);
            let pScoringSummary = scrapeGameSummaryReport(gameSummary);
            let pShotsPeriod = scrapeShotsOnGoal(htmlData);
            await Promise.all([pGameDate, pTeams, pPlayers, pScoringSummary, pShotsPeriod]).then(values => {
                let [gameDate, [aTeam, hTeam], [aPlayers, hPlayers], scoringSummary, shotsOnGoal] = values;
                createGameDocument(gid.toString(), gameDate, aTeam, hTeam, aPlayers, hPlayers, shotsOnGoal, scoringSummary).then(document => {
                    document.save().then(_ => scrapedSuccessfully++);
                }).catch(err => {
                    if(err)
                        throw err;
                })
            }).catch(err => {
                let logdata = UTIL.dumpErrorStackTrace(err);
                require("fs").writeFile("./error.log", logdata, err => {
                    if(err) {
                        throw err;
                    }
                    console.log("Saved log data to error.log");
                });
            });
            await page.close();
        };
        await func().catch(err =>
        {
            let logdata = UTIL.dumpErrorStackTrace(err);
            require("fs").writeFile("./error.log", logdata, err => {
                if(err) {
                    throw err;
                }
                console.log("Saved log data to error.log");
            });
        });
    }
    browser.close();
    return { games: gameRange.length, scraped: scrapedSuccessfully };
}

function createGameInfoObject(urlString, id) {
    let [teams, year, month, day] = urlString.split("gamecenter/")[1].split("/");
    let [a, h] = teams.split("-vs-");
    let away = getFullTeamName(a);
    let home = getFullTeamName(h);
    let date = new Date(`${year}-${month}-${day}`);
    return {
        gameID: id,
        teams: {
            away: away,
            home: home,
        },
        datePlayed: date
    };
}

/**
 * Takes the starting year of a season. So the season 19/20, starts in the year 2019, therefore this takes either 2019 or 19 as parameter for that season.
 * @param {Number} season 
 */
function getFullGameIDRange(season){
    console.log(`Season is ${season}`);
    if(Number.isInteger(season)) {
        let beginID = `${season}020001`;
        let endID = `${season}021271`
        return [Number.parseInt(beginID), Number.parseInt(endID)];
    } else {
        return [0, 0];
    }
}

const gameCenterURL = (id) => `https://www.nhl.com/gamecenter/${id}`;

// NB: Run once
/**
 * Updated. Pretty cool. At least now, we scrape 10 pages / game id and game info in "parallell". Increases the speed quite dramatically.
 * @return {Promise<void>}
 */
async function scrapeGameInfo() {
    let season = getSeason();
    let [seasonGameIDBegin, seasonGameIDEnd] = getFullGameIDRange(season);
    console.log("Scrape game info between " + seasonGameIDBegin + " and " + seasonGameIDEnd + " Of season: " + SEASON + ":" + season);

    // scrape ALL upcoming games, so that a gameID can be searched for quickly getting teams playing in that game.
    // that way, we wont have to scrape an upcoming game's page, every time we do a search or something, because that
    // data will be stored in the GameInfo collection.
    const gameCenterURL = (id) => `https://www.nhl.com/gamecenter/${id}`;
    let browser = await puppeteer.launch();
    await GameInfo.find({}).sort({gameID: -1}).exec(async (err, gInfoDocs) => {
        if(gInfoDocs.length > 0) {
            let lastGameInfoDoc = gInfoDocs[0];
            if (lastGameInfoDoc.gameID === seasonGameIDEnd && gInfoDocs.length === (seasonGameIDEnd - (seasonGameIDBegin-1)) ) {
                console.log("All game info documents have been scraped and saved. No need to continue.")
            } else {
                console.log("Starting to scrape Game Info documents...");
                let gameIDs = Array.from(IDRange(lastGameInfoDoc.gameID + 1, (seasonGameIDEnd) + 1));
                let WORK_COUNT = 5;
                for (let id = gameIDs[0]; id < gameIDs[gameIDs.length - 1]; id += WORK_COUNT) {
                    let from = id;
                    let to = (id+WORK_COUNT > gameIDs[gameIDs.length-1] ? id + (gameIDs[gameIDs.length-1] - id) + 1 : id+WORK_COUNT);
                    let pageNums = Array.from(IDRange(from, to)).map(async gID => {
                        /// console.log(`Navigating to page of game id ${gID}`)
                        let page = await browser.newPage();
                        await page.goto(gameCenterURL(gID));
                        return { page: page, GameID: gID };
                    });
                    await Promise.all(pageNums).then(async pages => {
                        pages.forEach(async payload => {
                            console.log(`Scraping gameinfo for game id: ${payload.GameID}.`)
                            let page = payload.page;
                            let id = payload.GameID;
                            let url = await page.url();
                            let gameInfoDocData = createGameInfoObject(url, id);
                            let gameInfo = new GameInfo(gameInfoDocData);
                            gameInfo.save(); // save to MongoDB database
                            await page.close();
                        })
                    }).catch(err => {
                        console.log("Error scraping game info data: ");
                        UTIL.dumpErrorStackTrace(err);
                    });
                }
            }
        } else {
            let gameIDs = Array.from(IDRange(seasonGameIDBegin, (seasonGameIDEnd) + 1));
            let WORK_COUNT = 5;
            for (let id = gameIDs[0]; id < gameIDs[gameIDs.length - 1]; id += WORK_COUNT) {
                let from = id;
                let to = (id+WORK_COUNT > gameIDs[gameIDs.length-1] ? id + (gameIDs[gameIDs.length-1] - id) + 1 : id+WORK_COUNT);
                let pageNums = Array.from(IDRange(from, to)).map(async gID => {
                    let page = await browser.newPage();
                    await page.goto(gameCenterURL(gID));
                    return { page: page, GameID: gID };
                });
                await Promise.all(pageNums).then(async pages => {
                    pages.forEach(async payload => {
                        let page = payload.page;
                        let id = payload.GameID;
                        let url = await page.url();
                        let gameInfoDocData = createGameInfoObject(url, id);
                        let gameInfo = new GameInfo(gameInfoDocData);
                        gameInfo.save();
                        await page.close();
                    })
                })
            }
        }
        await browser.close();
    });
    console.log("Done saving game info objects. Begin updating game times to exact hour on day.");
}

function processTimeString(datestring, timestring) {
    let time_string_parts = timestring.split(" ");
    let [num_str, period_str] = time_string_parts;
    let [hour_str, min_str] = num_str.split(":");
    let hours = Number.parseInt(hour_str);
    let mins = Number.parseInt(min_str);
    if(period_str === "PM") {
        if(hours !== 12) 
            hours += 12;
    } else if(period_str === "AM") {
        if(hours === 12)
            hours = 0;
    }

    const date_string = `${datestring}T${hours}:${(mins === 0 ? "00" : mins)}:00.000Z` // if it's NHL games, this is saved in Eastern Time.

    return date_string;
}

function validate_calendar_data(calendar) {
    let [seasonGameIDBegin, seasonGameIDEnd] = getFullGameIDRange(2019);
    let game_count = seasonGameIDEnd - seasonGameIDBegin + 1;
    // validate calendar game count
    let validated_count = 0;
    for(let day in calendar) {
        for(let g of calendar[day]) {
            validated_count += 1;
        }
    }

    return {
        status: game_count === validated_count,
        actual_game_count: game_count,
        validated_count: validated_count
    }
}

async function updateAllGameInfoDateTimes() {
    console.log("Updating all game info objects");
    let data = require('fs').readFileSync(SCHEDULE_FILE, 'utf-8');
    await processCalendar(data).then(async calendar => {
        let validation = validate_calendar_data(calendar);
        if(!validation.status) {
            console.error(`Could not validate game count in calendar file. Actual game count: ${validation.actual_game_count}, found games in file: ${validation.validated_count}. ${calendar.length}`);
        }
        
        let processed_games = 0;
        for(let day in calendar) {
            for(let game of calendar[day]) {
                let [time, away, home] = game.split(",");
                let date = new Date(day);
                let tomorrow = UTIL.daysFromDate(date, 1);
                await GameInfo.findOne({ datePlayed: { $gte: new Date(day), $lt: new Date(tomorrow) }, teams: { away: away, home: home } }).then(async doc => {
                    if(doc) {
                        let gameDateTime = new Date(processTimeString(day, time));
                        let old_date = doc.datePlayed;
                        doc.datePlayed = gameDateTime;
                        await doc.save();
                        processed_games += 1;
                    } else {
                        console.log(`Could not find a game between ${new Date(day)} and ${tomorrow} with the teams ${away}-${home}`);
                    }
                });
            }
        }
        console.log(`Processed games: ${processed_games}. Calendar validation status: ${validation.status ? "OK" : "ERROR"}, Validated count: ${validation.validated_count}, Actual game count: ${validation.actual_game_count}`);
    });
}


/**
 * This data structure, that this function returns, is to sort the entries in the CSV file. Since they are not in GAME ID order, 
 * we will have to sort them, by comparing the games by each date, by the games already entered in the GameInfo collection. Since there are only a handful of games
 * each day, sorting these values won't be so difficult.
 * @param {*} data 
 * @return {string[][]} A multi-dim associative array, where the keys to the sub arrays are dates in the format of "YYYY-MM-DD", and where each sub array contains game info in the format of 
 * "TIME,AWAY,HOME"
 */
async function processCalendar(data) {
    let calendar = [];
    let [seasonGameIDBegin, seasonGameIDEnd] = getFullGameIDRange(2019);
    let game_count = seasonGameIDEnd - seasonGameIDBegin;

    let last_date = "";
    let lines = data.split('\n').filter(Boolean);
    let [date, _] = lines[0].split(",");
    last_date = date;
    calendar[date] = [];

    for(let line of lines) {
        let [date, time, away, home] = line.split(",");
        if(date !== last_date) {
            calendar[date] = [];
        }
        calendar[date].push(`${time},${away},${home}`);
        last_date = date;
    }

    return calendar;
}


(async () => {
    console.log("Setting up database.");
    console.log(`Connecting to database... @${mongoDBHost()}`);
    mongoose.Promise = global.Promise;
    mongoose.connect(mongoDBHost(), {useNewUrlParser: true});
    let db = mongoose.connection;

    let OPERATION = process.env.SCRAPE_TYPE || "ALL"; 

    db.on('close', () => {
        UTIL.l("Disconnected from database.")
        UTIL.l(`Scrape operation ${OPERATION} done`);
    });
    db.once('open', async () => {
        UTIL.l(`Connected to database: ${mongoDBHost()}`);
        if(OPERATION === "GAME_INFO_ONLY") {
            let [seasonGameIDBegin, seasonGameIDEnd] = getFullGameIDRange(2019);
            let _ = scrapeGameInfo().then(async _ => {
                let scan = async () => {
                    for(let i = 2019020001; i <= seasonGameIDEnd; i++) {
                        // TODO: scan database and fill in whatever gaps there are
                        GameInfo.findOne({gameID: i}).then(async doc => {
                            if(doc === null || doc === undefined)  {
                                console.log(`FOUND MISSING GAME ${i}. Attempting to scrape info...`);
                                let browser = await puppeteer.launch();
                                let page = await browser.newPage();
                                await page.goto(gameCenterURL(i));
                                let url = await page.url();
                                let gameInfoDocData = createGameInfoObject(url, i);
                                let gameInfo = new GameInfo(gameInfoDocData);
                                await gameInfo.save();
                                await page.close();
                                await browser.close();
                            }
                        });
                    }
                };
                await scan().then(_ => {
                    updateAllGameInfoDateTimes().then(_ => {
                        db.close();
                    });
                });
            });
            // TODO: Here we need to go over all the Game Info entries in the database
            // and update the Date for each one so they have the correct time, otherwise all will be set to 00:00.
            // to do this, we must read the file 2019_2020_NHL_Schedule.csv
            let line_number = 0;
            let game_id = 2019020001;
        } else if(OPERATION === "GAMES_ONLY") {
            await Game.find({}).sort({gameID: -1}).limit(1).exec((err, games) => {
                if(games.length > 0) {
                    UTIL.l(`Found ${games.length} games`);
                    UTIL.l(`Start scraping at ${games[0].gameID}`);
                    let gID = (games[0] === undefined || games[0] === null) ? 2019020001 : games[0].gameID;
                    gID += 1;
                    let games_today = findTodaysGames("nhl").then(games_today => {
                        let end_id = games_today[0].gameID - 1;
                        GameInfo.findOne({gameID: end_id-1}).then(doc => {
                            console.log(`Last game played was: ${doc.gameID} with teams: ${doc.teams.away}-${doc.teams.home}. Date played: ${doc.datePlayed}`)
                            scrapeGames(gID, end_id).then(res => {
                                UTIL.l(`Out of ${res.games} games, scraped ${res.scraped} successfully`);
                                db.close();
                            });
                        });
                    });
                } else {
                    UTIL.l("Found no games");
                    scrapeGames(2019020001, 2019021272).then(res => {
                        UTIL.l(`Out of ${res.games} games, scraped ${res.scraped} successfully`);
                        db.close();
                    });
                }
            });
        } else if(OPERATION === "ALL") {
            let [seasonGameIDBegin, seasonGameIDEnd] = getFullGameIDRange(2019);
            let _ = scrapeGameInfo().then(async _ => {
                let scan = async () => {
                    for(let i = 2019020001; i <= seasonGameIDEnd; i++) {
                        // TODO: scan database and fill in whatever gaps there are
                        GameInfo.findOne({gameID: i}).then(async doc => {
                            if(doc === null || doc === undefined)  {
                                console.log(`FOUND MISSING GAME ${i}. Attempting to scrape info...`);
                                let browser = await puppeteer.launch();
                                let page = await browser.newPage();
                                await page.goto(gameCenterURL(i));
                                let url = await page.url();
                                let gameInfoDocData = createGameInfoObject(url, i);
                                let gameInfo = new GameInfo(gameInfoDocData);
                                await gameInfo.save();
                                await page.close();
                                await browser.close();
                            }
                        });
                    }
                };
                await scan().then(_ => {
                    updateAllGameInfoDateTimes().then(async _ => {
                        await Game.find({}).sort({gameID: -1}).limit(1).exec((err, games) => {
                            if(games.length > 0){
                                UTIL.l(`Found ${games.length} games`);
                                UTIL.l(`Start scraping at ${games[0].gameID}`);
                                let gID = (games[0] === undefined || games[0] === null) ? 2019020001 : games[0].gameID;
                                scrapeGames(gID+1, null).then(res => {
                                    UTIL.l(`Out of ${res.games} games, scraped ${res.scraped} successfully`);
                                });
                            } else {
                                UTIL.l("Found no games: " + games.length);
                                scrapeGames(2019020001, null).then(res => {
                                    UTIL.l(`Out of ${res.games} games, scraped ${res.scraped} successfully`);
                                });
                            }
                        });
                    });
                });
            });
        } else {
            console.log("Environment variable for operation type is invalid. Set to: " + OPERATION);
            db.close();
        }
    });
})();


module.exports = {
    getGameIDRange,
    setupDates,
    IDRange
};
