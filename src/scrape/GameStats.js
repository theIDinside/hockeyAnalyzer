const {PlayerStat} = require("../data/PlayerStat");
const {GoalieStat} = require("../data/GoalieStat");
const {TeamTotal} = require("../data/TeamTotal");
const {Time} = require("../util/Time");
const C = require('cheerio');
const {l, Int, Float} = require('../util/utilities');
const {teams} = require('../util/constants');
const shotsOnGoalDiv = "shotsongoal-container";
const teamTotals = `wrap-teamstats-container`;


function monthNameToNumber(month) {
    switch (month) {
        case "January":
            return 1;
        case "February":
            return 2;
        case "March":
            return 3;
        case "April":
            return 4;
        case "May":
            return 5;
        case "June":
            return 6;
        case "July":
            return 7;
        case "August":
            return 8;
        case "September":
            return 9;
        case "October":
            return 10;
        case "November":
            return 11;
        case "December":
            return 12;
        default:
            return 0;
    }
}

async function getGameDate(htmlData) {
    let nav = C.load(htmlData);
    let [mName, mDay, year] = nav(".date").text().split(" ").map(e => e.split(",").filter(e => e !== "")).join(" ").split(" ");
    let mNum = monthNameToNumber(mName);
    mDay = Int(mDay);
    let dStr = `${year}-${((mName < 10) ? `0${mNum}` : `${mNum}`)}-${((mDay < 10) ? `0${mDay}` : `${mDay}`)}`;
    l(`Date is: ${dStr}`);
    return new Date(dStr);
}

/**
 *
 * @param htmlData
 * @returns {Promise<TeamTotal[]>}
 */
async function scrapeTeamsTotals(htmlData) {
    let nav = C.load(htmlData);
    return nav(`.${teamTotals}`).children()
        .children()
        .children()
        .filter((index) => index > 0)
        .children()
        .map((I, E) => new TeamTotal(...nav(E)
            .children()
            .map((INDEX, ELEM) => {
                const data = nav(ELEM).text()
                    .trim()
                    .split(" ")
                    .map(e => e.trim());
                return (data.length > 2) ? `${data[0]} ${data[1]}` : data[0];
            })
            .get()))
        .get()
}

async function scrapeShotsOnGoal(htmlData) {
    let nav = C.load(htmlData);
    let periods = nav(`.${shotsOnGoalDiv}`).children().children().filter(i => i > 0).children().filter(i => i < 3).map((i, elem) => {
        let [shotsAway, shotsHome] = nav(elem).children().filter((index) => index > 0).map((I, E) => {
            return Number.parseInt(nav(E).text());
        }).get();
        return {away: shotsAway, home: shotsHome};
    }).get();
    l("Scraped shots on goal");
    return periods;
}

function pTotalFilter(dAttr) {
    return !(dAttr === "gp" || dAttr === "points" || dAttr === "s" || dAttr === "preview-pim" || dAttr === "pp" || dAttr === "gw");
}

function gTotalFilter(dAttr) {
    switch(dAttr) {
        case "gp":
        case "rec":
        case "ga":
        case "save":
        case "sa":
        case "shots":
        case "gaa":
            return false;
        default:
            return true;
    }
}

async function scrapePlayerTotals(htmlData) {
    let divHomeClass = ".home";
    let divAwayClass = ".away";
    let nav = C.load(htmlData);
    let hPlayers = nav(divHomeClass).map((_, e) =>
        nav(e).find("table")
            .filter((i, E) => nav(E).attr("data-position") === "skaters")
            .filter(i => i === 0 || i === 2)
            .find("tbody")
            .children() // search tr's, table rows
            .map((i, row) =>
                new PlayerStat(...nav(row)
                    .children()
                    .filter((_, ELEM) => pTotalFilter(nav(ELEM).attr("data-visible")))
                    .map((index, td) => {
                        {
                            if (nav(td).text() === " " || nav(td).text().length === 0)
                                return "0";
                            return nav(td).text().trim();
                        }
                    }).get()))
            .get())
        .get();

    let hGoalies = nav(divHomeClass).map((_, e) =>
        nav(e).find("table")
            .filter((i, E) => nav(E).attr("data-position") === "goalies")
            .filter(i => i === 0 || i === 2)
            .find("tbody")
            .children() // search tr's, table rows
            .map((i, row) =>
                new GoalieStat(...nav(row)
                    .children()
                    .filter((_, ELEM) => gTotalFilter(nav(ELEM).attr("data-visible")))
                    .map((index, td) => {
                        {
                            if (nav(td).text() === " " || nav(td).text().length === 0)
                                return "0";
                            return nav(td).text().trim();
                        }
                    }).get()))
            .get())
        .get();

    let aPlayers = nav(divHomeClass).map((_, e) =>
        nav(e).find("table")
            .filter((i, E) => nav(E).attr("data-position") === "skaters")
            .filter(i => i === 0 || i === 2)
            .find("tbody")
            .children() // search tr's, table rows
            .map((i, row) =>
                new PlayerStat(...nav(row)
                    .children()
                    .filter((_, ELEM) => pTotalFilter(nav(ELEM).attr("data-visible")))
                    .map((index, td) => {
                        {
                            if (nav(td).text() === " " || nav(td).text().length === 0)
                                return "0";
                            return nav(td).text().trim();
                        }
                    }).get()))
            .get())
        .get();

    let aGoalies = nav(divAwayClass).map((_, e) =>
        nav(e).find("table")
            .filter((i, E) => nav(E).attr("data-position") === "goalies")
            .filter(i => i === 0 || i === 2)
            .find("tbody")
            .children() // search tr's, table rows
            .map((i, row) =>
                new GoalieStat(...nav(row)
                    .children()
                    .filter((_, ELEM) => gTotalFilter(nav(ELEM).attr("data-visible")))
                    .map((index, td) => {
                        {
                            if (nav(td).text() === " " || nav(td).text().length === 0)
                                return "0";
                            return nav(td).text().trim();
                        }
                    }).get()))
            .get())
        .get();

    let away = {
        skaters: aPlayers,
        goalies: aGoalies
    };
    let home = {
        skaters: hPlayers,
        goalies: hGoalies
    };
    return [away, home];
}

module.exports = {
    scrapeShotsOnGoal,
    scrapeTeamsTotals,
    scrapePlayerTotals,
    getGameDate
};