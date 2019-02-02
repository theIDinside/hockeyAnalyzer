const C = require('cheerio')
const Constants = require('../constants')
const phantom = require('phantom');
const puppeteer = require('puppeteer');
const req = require('request');
let axios = require('axios');
const {anyOf, daysFrom, dateStringify, getFullTeamName, l} = require('../utilities');

const seasonStart = '2018-10-03'
const getGamesListItem = (dateString) => `nhl-scores__${dateString}`;
const getGamePageURL = (gameNumber) => `https://www.nhl.com/gamecenter/201802${gameNumber}`

/// This function, retrieves from the site, the games for the coming 6 days (including the provided date in the argument. This is I guess somehow, what the site prefetches or something.)
async function getGameIDsAtDate(date) {
    let currDate = new Date(date);
    let stopDate = new Date(currDate);
    stopDate.setUTCDate(stopDate.getUTCDate() + 1);
    if(date !== String)
        date = date.toISOString().split("T")[0]
    let gamesDateURL = `https://www.nhl.com/scores/${date}`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(gamesDateURL);
    const _ = page.evaluate(() => {});
    const htmlData = await page.content();
    l(`Requesting data from: ${gamesDateURL}... Please wait`);
    let navData = C.load(htmlData);
    let gamesAtDate = getGamesListItem(date);
    stopDate = dateStringify(stopDate);
    let gameStopListItem = getGamesListItem(stopDate);
    let games = navData(`#${gamesAtDate}`).nextUntil(`#${gameStopListItem}`).map((i, e) => navData(e).children().children().children().first().attr("id")).get();
    browser.close();
    return games;
}

function getGameIDsAtDateHTML(date, htmlData) {
    let currDate = new Date(date);
    let stopDate = new Date(currDate);
    stopDate.setUTCDate(stopDate.getUTCDate() + 1);
    if(date !== String)
        date = date.toISOString().split("T")[0]
    let navData = C.load(htmlData);
    let gamesAtDate = getGamesListItem(date);
    stopDate = dateStringify(stopDate);
    let gameStopListItem = getGamesListItem(stopDate);
    let games = navData(`#${gamesAtDate}`).nextUntil(`#${gameStopListItem}`).map((i, e) => navData(e).children().children().children().first().attr("id")).get();
    return games;
}

function getGameTeamStats(home, away, date, gameID) {
    let fmtDate = date.split("-")
    let y = fmtDate[0] 
    let m = fmtDate[1] 
    let d = fmtDate[2] 
    // OBS OBS OBS NB NB NB! In NHL, different from SHL or how european standard define home and away, is different. So SHL, it would look like: Home vs Away. In NHL it's Away vs Home
    return `https://www.nhl.com/gamecenter/${away}-vs-${home}/${y}/${m}/${d}/${gameID}#game=${gameID},game_state=final,game_tab=stats`
}


/**
 * 
 * @param { string } season  
 * @param { string } gameID 
 * @returns { Promise<GameSummary> }
 */
async function scrapeGameSummaryReport(summaryReportURL, season="20182019") {
    // let summaryURL = `http://www.nhl.com/scores/htmlreports/${season}/GS${gameID}.HTM`
    let htmlData = await axios(summaryReportURL).then(res => {
        l("Summary report data downloaded. Begin scraping...")
        return res.data
    }).catch(err => {
        l(`Error while trying to download the data: ${err}`)
    });
    let summary = new ScoringSummary(htmlData);
    return summary;
}

function Goal(goalNumber, period, time, strength, scoringTeam, goalScorer, assist1, assist2, onIceAway, onIceHome) {
    this.goalNumber = goalNumber;
    this.period = period;
    this.time = time;
    this.strength = strength;
    this.scoringTeam = scoringTeam;
    this.goalScorer = goalScorer;
    this.assists = [assist1, assist2];
    this.playersOnIceHome = [...onIceHome.players];
    this.playersOnIceAway = [...onIceAway.players];
    this.rawStringData = `${goalNumber} ${period} ${time} ${strength} ${scoringTeam} ${goalScorer} ${assist1} ${assist2} ${this.playersOnIceAway} ${this.playersOnIceHome}`
    this.isEmptyNet = () => {
        let tmp = strength.split("-");
        for(let a of tmp) {
            if(a === "EN")
                return true;
        }
        return false;
    };
    this.isGood = () => {
        if(this.period === "SO") // if it's a shootout goal in shootout OT, then we wont be trying to analyze the data. Therefore the goal will be no good for our purposes
            return false;
        return this.goalNumber !== "-";
    };
    this.getGoalNumber = () => {
        return Number.parseInt(this.goalNumber);
    };
    this.getScoringPeriod  = () => {
        if(this.period === "OT")
            return 4;
        else
            return Number.parseInt(this.period)
    };
    this.getPlayerJersey = () => {
        return Number.parseInt(this.getPlayerJerseyStr());
    };
    this.getPlayerJerseyStr = () => {
        return this.player.split(" ")[0];
    };
    this.getPlayerName = () => {
        return this.player.split(" ")[1].split("(")[0];
    };
    this.getJerseyAndName = () => {
        return `#${this.player.split("(")[0]}`;
    };
    this.printRawData = () => {
        l(this.rawStringData);
    };
    this.prettyString = () => {
        return `${this.goalNumber} \t ${this.period} \t ${this.time} \t ${this.strength} \t ${this.scoringTeam} \t ${this.goalScorer} \t ${this.assists[0]} \t ${this.assists[1]} \t ${this.playersOnIceAway} \t ${this.playersOnIceHome}`;
    }
}

const Penalties = ["Elbowing", "Tripping", "Fighting (maj)", "Cross checking", "PS-Hooking on breakaway", "Hooking", "Interference", "Kneeing", "Unsportsmanlike conduct"]
const PenaltyMIN = [2, 2, 5, 2, 0, 2, 2, 2, 2]
function Penalty(team, number, period, time, player, minutes, penaltyType, isMinor=true) {
    this.team = team;
    this.number = number;
    this.period = period;
    this.time = time;
    this.player = player;
    this.minutes = minutes;
    this.penaltyType = penaltyType;
    this.minor = isMinor;
    this.isMinor = () => {
        return this.minor;
    }
}

function ScoringSummary(htmlData) {
    let dataNav = C.load(htmlData)
    let summary = dataNav('tbody').children().filter((i, e) => i === 3).map((index, row) => {
        let ScoringSummary = dataNav(row).children().children().children().children().filter((index, elem) => index > 0).map((rowNumber, rowScoreData) => { 
                    // iterate through the td's
            let score = dataNav(rowScoreData).children().map((idx, td) => {
                if((idx === 6 && dataNav(td).text() == "unassisted")) {
                    // if there are no primary and secondary assists 
                    return "None";
                } else if((idx === 7) && dataNav(td).prev().text() === "unassisted") {
                    return "None";
                } else if((idx === 7) && dataNav(td).prev().attr("colspan") === 2) {
                    l(((idx === 7) && dataNav(td).prev().attr("colspan") === "2"));
                    return dataNav(td).text().trim().split(",").map(e => e.trim()).map(e => Number.parseInt(e));
                } else if(idx > 7) {
                    let pOnIce = dataNav(td).text().trim().split(",").map(e => e.trim()).map(e => Number.parseInt(e));
                    return { players: pOnIce };
                } else {
                    return dataNav(td).text();
                }
            }).get();
            // now we can use spread syntax as arguments. Beautiful.
            let g = new Goal(...score);
            return g;
        }).get().filter(goal => goal.isGood());
        return ScoringSummary;
    }).get();

    this.summary = summary;
    this.printScoringSummary = () => {
        l(`Goal # \t Period Time \t Strength \t Team \t Scorer \t 1st Ass. \t 2nd Ass. \t On ice away \t On ice home`);
        for(let g of this.summary) {
            l(g.prettyString());
        }
    }
}

function PeriodSummary(htmlData) {
    
}

async function scrapeGamesPlayed() {
    let today = new Date();
}



module.exports.getGameIDsAtDate = getGameIDsAtDate;
module.exports.seasonStart = seasonStart;
module.exports.getGameIDsAtDateHTML = getGameIDsAtDateHTML;
module.exports.ScoringSummary = ScoringSummary;
module.exports.scrapeGameSummaryReport = scrapeGameSummaryReport;