const {Time} = require("../util/Time");
const C = require('cheerio');
const {l, Int, Float} = require('../util/utilities');
const {teams} = require('../util/constants');
const shotsOnGoalDiv = "shotsongoal-container";
const teamTotals = `wrap-teamstats-container`;

/**
 * Holds a short summary of a scoringTeam's total scoringTeam stats for a game.
 */
class TeamTotal {
    /**
     * Constructs a scoringTeam total object, holding a full game's stats.
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
        this.teamname = team.trim();
        this.sog = shotsOnGoal;
        this.fo = faceOffWin;
        this.pp = pp;
        this.pim = pim;
        this.hits = hits;
        this.blocked = blockedShots;
        this.giveaways = giveAways;
    }

    get name() {
        console.log(`This team name, short or full: |${this.teamname}|`);
        return teams[this.teamname.toUpperCase()];
    }

    toString() {
        return `${this.teamname} - ${this.sog} - ${this.fo} - ${this.pp} - ${this.pim} - ${this.hits} - ${this.blocked} - ${this.giveaways}`
    }

    /**
     * Returns number of successfull powerplays (PPs where a goal was made)
     * @returns {number}
     */
    get ppGoals() {
        let ppgStr = this.pp.split("/")[0];
        return Number.parseInt(ppgStr);
    }

    /**
     * Returns total number of power play attempts.
     * @returns {number}
     */
    get ppAttempts() {
        let ppgStr = this.pp.split("/")[1];
        return Number.parseInt(ppgStr);
    }

    /**
     * Returns shots on goal
     * @returns {*}
     */
    get shotsOnGoal() {
        return Int(this.sog);
    }

    /**
     * Returns penalty minutes
     * @returns {*}
     */
    get penaltyMinutes() {
        return Int(this.pim);
    }

    get hitsMade() {
        return Int(this.hits);
    }

    get shotsBlocked() {
        return Int(this.blocked);
    }

    get giveAways() {
        return Int(this.giveaways);
    }

    /**
     * Returns faceoff win percentage, in format 0.00
     */
    get faceoffWins() {
        return Float(this.fo.split("%")[0]);
    }
}
// mongoose model getter done
class GoalieStat {
    constructor(jersey, name, shotsEven, shotsPP, shotsPK, shotsTotal, savePct, pim, toi) {
        this.jerseyNumber = jersey;
        this.playerName = name;
        let [es, em] = shotsEven.split("–");
        this.evensaves = es;
        this.evenTotalShots = em;
        let [pps, ppm] = shotsPP.split("–");
        this.ppSaves = pps;
        this.ppTotalShots = ppm;
        let [pks, pkg] = shotsPK.split("–");
        this.pkSaves = pks;
        this.pkTotalShots = pkg;
        let [ts, tg] = shotsTotal.split("–");
        this.savesTotal = ts;
        this.shotsTotal = tg;
        this.savePct = savePct;
        this.pim = pim;
        this.toi = new Time(...toi.split(":"));
    }

    get name() {
        return this.playerName;
    }

    /**
     * Returns a JS Object that represents the structure defined for the MongoDB Schema Model with the name GoalieGameModelSchema
     * @returns {{penaltyMinutes: *, savePercentage: *, timeOnIce: *, jersey: *, penaltyKill: {saves: *, shots: *}, powerPlay: {saves: *, shots: *}, name: *, evenStrength: {saves: *, shots: *}}}
     */
    get model() {
        return {
            jersey: this.jersey,
            name: this.name,
            evenStrength: { saves: this.evenSaves, shots: this.evenShots },
            powerPlay: { saves: this.powerPlaySaves, shots: this.powerPlayShots },
            penaltyKill: { saves: this.penaltyKillSaves, shots: this.penaltyKillShots },
            savePercentage: this.savePercentage,
            penaltyMinutes: this.penaltyMinutes,
            timeOnIce: this.toi.model,
        }
    }

    get jersey() {
        return Number.parseInt(this.jerseyNumber);
    }

    get totalSaves() {
        return Number.parseInt(this.savesTotal);
    }

    get totalGoals() {
        return Number.parseInt(this.shotsTotal);
    }

    get evenSaves() {
        return Number.parseInt(this.evensaves);
    }
    get evenShots() {
        return Number.parseInt(this.evenTotalShots);
    }

    get powerPlaySaves() {
        return Number.parseInt(this.ppSaves);
    }
    get powerPlayShots() {
        return Number.parseInt(this.ppTotalShots);
    }
    get penaltyKillSaves() {
        return Number.parseInt(this.pkSaves);
    }
    get penaltyKillShots() {
        return Number.parseInt(this.pkTotalShots);
    }
    get savePercentage() {
        return Number.parseFloat(this.savePct);
    }
    get penaltyMinutes() {
        return Number.parseInt(this.pim);
    }
    get timeOnIce() {
        return this.toi;
    }

    toString() {
        return `${this.jerseyNumber} ${this.playerName} ${this.evenSaves}-${this.evenShots} ${this.powerPlaySaves}-${this.powerPlayShots} ${this.penaltyKillSaves}-${this.penaltyKillShots} ${this.totalSaves}-${this.totalGoals} ${this.savePercentage} ${this.penaltyMinutes} ${this.toi}`
    }
}
// mongoose model getter done
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

    /**
     * Returns a JS Object that represents the structure defined for the MongoDB Schema Model with the name PlayerGameModelSchema
     * @returns {{penaltyMinutes: number | *, faceOffWins: (number|*), takeAways: number | *, blocked: number | *, points: number | *, hits: number | *, ppTimeOnIce: *, assists: number | *, timeOnIce: *, jersey: number | *, name: *, difference: number | *, shotsOnGoal: number | *, pkTimeOnIce: *, giveaways: number | *, goals: number | *}}
     */
    get model() {
        return {
            jersey:         this.jersey,
            name:           this.playerName,
            goals:          this.goals,
            assists:        this.assist,
            points:         this.points,
            difference:     this.diff,
            penaltyMinutes: this.pim,
            shotsOnGoal:    this.sog,
            hits:           this.hits,
            blockedShots:   this.blocks,
            giveAways:      this.giveaways,
            takeAways:      this.takeaways,
            faceOffWins:    this.fow,
            timeOnIce:      this.toi.model,
            ppTimeOnIce:    this.pptoi.model,
            pkTimeOnIce:    this.pktoi.model,
        }
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

    toString() {
        return `${this.jersey} ${this.name} ${this.goals} ${this.assist} ${this.points} ${this.diff} ${this.pim} ${this.sog} ${this.hits} ${this.blocks} ${this.giveaways} ${this.takeaways} ${this.faceoffWins} ${this.toi} ${this.pptoi} ${this.pktoi}`
    }
}


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
    TeamTotal,
    PlayerStat,
    GoalieStat,
    getGameDate
};