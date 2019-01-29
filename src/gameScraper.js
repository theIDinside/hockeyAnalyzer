const C = require('cheerio')
const Constants = require('./constants')
const phantom = require('phantom');
const l = msg => console.log(msg);
const {anyOf, daysFrom} = require('./utilities');

const seasonStart = '2018-10-03'
const today = new Date().toLocaleDateString()
const gameCenterButtonClass = `li.g5-component--nhl-scores__buttons-item`

/// This function, retrieves from the site, the games for the coming 6 days (including the provided date in the argument. This is I guess somehow, what the site prefetches or something.)
async function getGameNumbersAtDate(date) {
    if(date !== String)
    {
        l("Date is a date object and not string")
        date = date.toISOString().split("T")[0]
    }
    let gamesDateURL = `https://www.nhl.com/scores/${date}`;
    let gameCardClass = "g5-component--nhl-scores__game-wrapper"
    const pInstance = await phantom.create();
    const page = await pInstance.createPage();
    await page.on('onResourceRequested', function(requestData) {});
    l(`Requesting data from: ${gamesDateURL}... Please wait`);
    const status = await page.open(gamesDateURL)
    const content = await page.property('content')
    let navData = C.load(content);
    l(`Printing games starting at ${date} and 6 days forward, ${daysFrom(date, 6).toISOString().split("T")[0]}`)
    let gameList = navData(`div.${gameCardClass}`).each((index, element) => {
        let gameNumber = navData(element).children().first().attr('id');
        l(`GameID: ${gameNumber}`);
    })

    await pInstance.exit()
    return "someDataGoesHere";
}

function getGamePageURL(gameNumber) {
    return `https://www.nhl.com/gamecenter/201802${gameNumber}`
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
async function scrapeGameSummaryReport(gameID, season="20182019") {
    let summaryURL = `http://www.nhl.com/scores/htmlreports/${season}/GS${gameID}.HTM`

}

function Goal(goalNumber, period, time, strength, scoringTeam, goalScorer, assists, playersOnIceAway, playersOnIceHome) {
    this.rawStringData = `${goalNumber} ${period} ${time} ${strength} ${scoringTeam} ${goalScorer} ${assists} ${playersOnIceAway} ${playersOnIceHome}`
    this.goalNumber = goalNumber;
    this.period = period;
    this.time = time;
    this.strength = strength;
    this.scoringTeam = scoringTeam;
    this.goalScorer = goalScorer;
    this.assists = assists;
    this.playersOnIceHome = playersOnIceHome;
    this.playersOnIceAway = playersOnIceAway;
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
    this.goalNumber = () => {
        return Number.parseInt(this.goalNumber);
    }
    this.getScoringPeriod  = () => {
        if(this.period === "OT")
            return 4;
        else
            return Number.parseInt(this.period)
    }
    this.getPlayerJersey = () => {
        return Number.parseInt(this.getPlayerJerseyStr());
    };
    this.getPlayerJerseyStr = () => {
        return this.player.split(" ")[0];
    };
    this.getPlayerName = () => {
        return this.player.split(" ")[1].split("(")[0];
    }
    this.getJerseyAndName = () => {
        return `#${this.player.split("(")[0]}`;
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
    let summary = dataNav('tbody').children().filter((i, e) => i === 4).each((index, row) => {
            /* scrape scoring summary sub table, example:
            // this is how the data, in the scoring summary looks, but the | | represents the <td> </td> in the html.
            let tmpstr = "1|2|5:01|EV|NSH|13 N.BONINO(13)|19 C.JARNKROK(10)||4, 10, 13, 14, 19, 35|1, 4, 10, 11, 13, 16"
            let res = tmpstr.split("|").map((e, index) => {
                if(index < 8) {
                    if(e === "")
                    return "None";
                else 
                    return e;
                } else  {
                    return e.split(",").map(e => e.trim()).map(e => Number.parseInt(e))
                }
            })*/
            let ScoringSummary = dataNav(row).children().children().children().children().filter((idx, elem) => idx > 1).map((rowNumber, rowScoreData) => { 
                    // iterate through the td's
                let score = dataNav(rowScoreData).children().map((idx, td) => {
                    if((idx === 7 || idx === 8) && dataNav(td).text() === "") {
                        // if there are no primary and secondary assists 
                        return "None";
                    } else if((idx == 8) && dataNav(td).prev().attr("colspan") === "2") {
                        return dataNav(td).text().split(",").map(e => e.trim()).map(e => Number.parseInt(e));
                    } else if(idx > 8) {
                        return dataNav(td).text().split(",").map(e => e.trim()).map(e => Number.parseInt(e));
                    } else {
                        return dataNav(td).text();
                    }
                }).get();
                // now we can use spread syntax as arguments. Beautiful.
                let g = new Goal(...score);
                return g;
            }).get().filter(goal => goal.isGood());
            return ScoringSummary;
    });
    this.summary = summary;
}

function PeriodSummary(htmlData) {
    
}

function GameSummary(htmlData) {
    let dataNav = C.load(htmlData)
    let tableRows = dataNav('tbody').children().each((index, row) => {
        if(index === 4) {
            /* scrape scoring summary sub table, example:
            // this is how the data, in the scoring summary looks, but the | | represents the <td> </td> in the html.
            let tmpstr = "1|2|5:01|EV|NSH|13 N.BONINO(13)|19 C.JARNKROK(10)||4, 10, 13, 14, 19, 35|1, 4, 10, 11, 13, 16"
            let res = tmpstr.split("|").map((e, index) => {
                if(index < 8) {
                    if(e === "")
                    return "None";
                else 
                    return e;
                } else  {
                    return e.split(",").map(e => e.trim()).map(e => Number.parseInt(e))
                }
            })*/
            let ScoringSummary = dataNav(row).children().children().children().children().filter((idx, elem) => idx > 1).map((rowNumber, rowScoreData) => { 
                    // iterate through the td's
                let score = dataNav(rowScoreData).map((idx, td) => {
                    if((idx === 7 || idx === 8) && dataNav(td).text() === "") {
                        // if there are no primary and secondary assists 
                        return "None";
                    } else if((idx == 8) && dataNav(td).prev().attr("colspan") === "2") {
                        return dataNav(td).text().split(",").map(e => e.trim()).map(e => Number.parseInt(e));
                    } else if(idx > 8) {
                        return dataNav(td).text().split(",").map(e => e.trim()).map(e => Number.parseInt(e));
                    } else {
                        return dataNav(td).text();
                    }
                }).get();
                // now we can use spread syntax as arguments. Beautiful.
                let g = new Goal(...score);
                return g;
            }).get().filter(goal => goal.isGood());
        } else if(index === 7) {
            // scrape penalty summary sub table
            // example:
            let penalty = 
            new Penalty("NSH", 1, 1, "1:43", "#42 C. BLACKWELL", 2, "Elbowing", true /* can be omitted for minors. Penalties are generally minors.*/)
        } else if(index === 9) {
            // scrape by-period summary sub table
        }
    })
    this.scoring = []
}


module.exports.getGameNumbersAtDate = getGameNumbersAtDate;
module.exports.seasonStart = seasonStart;