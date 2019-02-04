const C = require('cheerio')
const {l} = require('../utilities')
const puppeteer = require('puppeteer');

const shotsOnGoalDiv = "shotsongoal-container"
const teamTotals = `wrap-teamstats-container`;

/**
 * Holds a short summary of a team's total team stats for a game.
 */
class TeamTotal {
    /**
     * Constructs a team total object, holding a full game's stats.
     * @param team
     * @param shotsOnGoal
     * @param faceOffWin
     * @param pp
     * @param pim
     * @param hits
     * @param blockedShots
     * @param giveAways
     */
    constructor(team, shotsOnGoal, faceOffWin, pp, pim, hits, blockedShots, giveAways) {
        this.teamName = team;
        this.SOG = shotsOnGoal;
        this.FO = faceOffWin;
        this.PP = pp;
        this.PIM = pim;
        this.hits = hits;
        this.blockedShots = blockedShots;
        this.giveAways = giveAways;
    }

    get name() {
        return this.teamName;
    }

    get toString() {
        return `${this.name} - ${this.SOG} - ${this.FO} - ${this.PP} - ${this.PIM} - ${this.hits} - ${this.blockedShots} - ${this.giveAways}`
    }
}

class Time
{
    constructor(minutes, seconds) {
        if(typeof minutes === "string" && typeof seconds === "string")
        {
            if(minutes === "--" && seconds === "--") {
                this.mins = 0;
                this.secs = 0;
            } else {
                this.mins = Number.parseInt(minutes);
                this.secs = Number.parseInt(seconds);
            }
        } else {
            this.mins = minutes;
            this.seconds = seconds;
        }
    }
    toString() {
        return `${this.mins}:${(this.secs < 10) ? '0' : ''}${this.secs}`;
    }

    setTime(m, s) {
        this.mins = m;
        this.secs = s;
    }

    getDifference(t) {
        try {
            if(typeof t !== "Time")
                throw Error("Parameter to getDifference needs to be of type Time");
            let thisInSeconds = this.mins * 60 + this.secs;
            let tInSeconds = t.mins*60 + t.secs;
            let diffInSeconds = Math.abs(thisInSeconds - tInSeconds);
            return new Time(Math.floor(diffInSeconds/60), diffInSeconds%60);
        } catch (e) {
            l(e);
        }
    }
}

class PlayerStat {
    constructor(jersey, pName, goals, assists, points, diff, pim, sog, hits, blocks, giveaways, takeaways, faceoff, toi, pptoi, pktoi) {
        this.jersey = Number.parseInt(jersey);
        this.playerName = pName;
        this.goals = Number.parseInt(goals);
        this.assist = Number.parseInt(assists);
        this.points = Number.parseInt(points);
        this.diff = Number.parseInt(diff);
        this.pim = Number.parseInt(pim);
        this.sog = Number.parseInt(sog);
        this.hits = Number.parseInt(hits);
        this.blocks = Number.parseInt(blocks);
        this.giveaways = Number.parseInt(giveaways);
        this.takeaways = Number.parseInt(takeaways);

        if(faceoff === "")
            this.fow = 0.0;
        else
            this.fow = Number.parseFloat(faceoff);
        this.toi = new Time(...toi.split(":"));
        this.pptoi = new Time(...pptoi.split(":"));
        this.pktoi = new Time(...pktoi.split(":"));
    }

    get name() {
        return this.playerName;
    }

    get faceoffWins() {
        return this.fow;
    }

    get shotsOnGoal() {
        return this.sog;
    }

    get asString() {
        return `${this.jersey} ${this.name} ${this.goals} ${this.assist} ${this.points} ${this.diff} ${this.pim} ${this.sog} ${this.hits} ${this.blocks} ${this.giveaways} ${this.takeaways} ${this.faceoffWins} ${this.toi} ${this.pptoi} ${this.pktoi}`
    }
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
        .filter((index, _) => index > 0)
        .children()
        .map((I, E) => new TeamTotal(...nav(E)
            .children()
            .map((INDEX, ELEM) => nav(ELEM)
                .text()
                .trim()
                .split(" ")[0]
                .trim())
            .get()))
        .get()
}

async function scrapeShotsOnGoal(htmlData) {
    let nav = C.load(htmlData);
    let periods = nav(`.${shotsOnGoalDiv}`).children().children().filter(i => i > 0).children().filter(i => i < 3).map((i, elem) => {
        let [shotsAway, shotsHome] = nav(elem).children().filter((index, _) => index > 0).map((I, E) => {
            return Number.parseInt(nav(E).text());
        }).get();
        return {away: shotsAway, home: shotsHome};
    }).get();
    l("Shots: Away - Home")
    for(let period in periods) {
        l(`${periods[period].away} - ${periods[period].home}`);
    }

    return periods;
}

function pTotalFilter(dAttr) {
    return !(dAttr === "gp" || dAttr === "points" || dAttr === "s" || dAttr === "preview-pim" || dAttr === "pp" || dAttr === "gw");
}

async function scrapePlayerTotals(htmlData) {
    let divHomeClass = ".home";
    let divAwayClass = ".away";
    let nav = C.load(htmlData);
    let home = nav(divHomeClass).map((_, e) =>
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

    let away = nav(divHomeClass).map((_, e) =>
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

    return [away, home];
}

module.exports = {
    scrapeShotsOnGoal,
    scrapeTeamsTotals,
    scrapePlayerTotals
}