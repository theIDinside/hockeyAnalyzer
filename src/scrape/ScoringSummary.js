const C = require('cheerio')
const {l} = require('../utilities')
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

function ScoringSummary(htmlData) {
    let elQuery = C.load(htmlData);
    this.summary = elQuery('tbody').children().filter((i, e) => i === 3).map((index, row) =>
        elQuery(row).children().children().children().children().filter((index, elem) => index > 0).map((rowNumber, rowScoreData) => {
            // iterate through the td's
            let score = elQuery(rowScoreData).children().map((idx, td) => {
                if ((idx === 6 && elQuery(td).text() === "unassisted")) {
                    // if there are no primary and secondary assists
                    return "None";
                } else if ((idx === 7) && elQuery(td).prev().text() === "unassisted") {
                    return "None";
                } else if ((idx === 7) && elQuery(td).prev().attr("colspan") === 2) {
                    l(((idx === 7) && elQuery(td).prev().attr("colspan") === "2"));
                    return elQuery(td).text().trim().split(",").map(e => e.trim()).map(e => Number.parseInt(e));
                } else if (idx > 7) {
                    let pOnIce = elQuery(td).text().trim().split(",").map(e => e.trim()).map(e => Number.parseInt(e));
                    return {players: pOnIce};
                } else {
                    return elQuery(td).text();
                }
            }).get();
            // now we can use spread syntax as arguments. Beautiful.
            let g = new Goal(...score);
            return g;
        }).get().filter(goal => goal.isGood())).get();

    this.printScoringSummary = () => {
        l(`Goal # \t Period Time \t Strength \t Team \t Scorer \t 1st Ass. \t 2nd Ass. \t On ice away \t On ice home`);
        for(let g of this.summary) {
            l(g.prettyString());
        }
    }
}

module.exports = {
    Goal, ScoringSummary
}