const C = require('cheerio');
const {Goal} =  require("../data/Goal");
const {l} = require('../util/utilities');
const {MakeTime} = require('../util/Time');
const {seasonStart, teams, getFullTeamName} = require('../util/constants');


class ScoringSummary {
    constructor(htmlData) {
        let elQuery = C.load(htmlData);
        this.away = elQuery('table#Visitor').children().children().filter((i, _) => i > 1).children().map((idx, e) => {
            let txt = elQuery(e).text();
            txt = txt.split("Game")[0];
            let tmp = txt.split(" ");
            txt = tmp[tmp.length-1];
            console.log(`Text data for visitor: ${txt}`);
            return getFullTeamName(txt);
        })[0];
        this.home = elQuery('table#Home').children().children().filter((i, _) => i > 1).children().map((idx, e) => {
            let txt = elQuery(e).text();
            txt = txt.split("Game")[0];
            let tmp = txt.split(" ");
            txt = tmp[tmp.length-1];
            console.log(`Text data for home: ${txt}`);
            return getFullTeamName(txt);
        })[0];
        this.summary = elQuery('tbody').children().filter((i, e) => i === 3).map((index, row) =>
            elQuery(row).children().children().children().children().filter((index, elem) => index > 0).map((rowNumber, rowScoreData) =>
                // iterate through the td's
                new Goal(...elQuery(rowScoreData).children().filter((i, e) => i < 8).map((idx, td) => {
                    if (idx === 6 && (elQuery(td).text() === "unassisted" || elQuery(td).text() === "Unsuccessful Penalty Shot" || elQuery(td).text() === "Successful Penalty Shot")) {
                        // if there are no primary and secondary assists
                        return "None";
                    } else if ((idx === 7) && (elQuery(td).prev().text() === "unassisted" || elQuery(td).text().trim().length === 0 || elQuery(td).prev().text() === "Unsuccessful Penalty Shot" || elQuery(td).prev().text() === "Successful Penalty Shot")) {
                        return "None";
                    } else {
                        return elQuery(td).text();
                    }
                }).get())).get().filter(goal => goal.isGood())).get();
    }

    get report() {
        return this.summary;
    }

    get finalResult() {
        return this.summary.reduce((result, goal) => {
            if(teams[goal.getScoringTeam()] === this.away) {
                return { away: result.away+1, home: result.home }
            } else if(teams[goal.getScoringTeam()] === this.home) {
                return { away: result.away, home: result.home + 1}
            } else {
                console.log(`The scoring team reported is ${goal.getScoringTeam()}, while teams playing are: Home: ${this.home}. Away: ${this.away}`);
            }
        }, { away: 0, home: 0 });
    }

    print() {
        l(`${this.away} vs ${this.home}`);
        l(`Goal # \t Period Time \t Strength \t Team \t Scorer \t 1st Ass. \t 2nd Ass. \t On ice away \t On ice home`);
        for(let g of this.summary) {
            l(g.prettyString());
        }
    }

    get model() {
        return this.summary.map(e => e.model())
    }
}

module.exports = {
    ScoringSummary
};