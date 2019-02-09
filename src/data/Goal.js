const {teams} = require("../util/constants");
const {Time, MakeTime} = require("../util/Time");

class Goal {
    constructor(goalNumber, period, time, strength, scoringTeam, goalScorer, assist1, assist2, onIceAway, onIceHome) {
        this.goalNumber = goalNumber;
        this.period = period;
        this.time = MakeTime(time);
        this.strength = strength;
        this.scoringTeam = scoringTeam;
        this.goalScorer = goalScorer;
        this.assists = [assist1, assist2];
        this.playersOnIceHome = [...onIceHome.players];
        this.playersOnIceAway = [...onIceAway.players];
        this.rawStringData = `${goalNumber} ${period} ${time} ${this.strength} ${scoringTeam} ${goalScorer} ${assist1} ${assist2} ${this.playersOnIceAway} ${this.playersOnIceHome}`
    }

    translateStrength() {
        switch (this.strength) {
            case "EV":
                return "Even";
            case "EV-EN":
                return "Even Empty Net";
            case "PP":
                return "Power Play";
            case "PS":
                return "Penalty Shot";
            case "SH":
                return "Short Handed";
            case "SH-EN":
                return "Short Handed Empty Net";
            case "PP-EN":
                return "Power Play Empty Net";
        }
    }

    get model() {
        let a = ["None", "None"];
        for (let i in this.assists) {
            a[i] = this.assists[i].split("(")[0];
        }

        return {
            goal: this.number,
            period: (this.period === "OT") ? 4 : Number.parseInt(this.period),
            time: this.time.model,
            strength: this.translateStrength(),
            scoringTeam: this.getScoringTeam(),
            goalScorer: this.getJerseyAndName(),
            assists: a,
        }
    }

    getScoringPeriod() {
        if (this.period === "OT")
            return 4;
        else
            return Number.parseInt(this.period)
    }

    isGood() {
        if (this.period === "SO") // if it's a shootout goal in shootout OT, then we wont be trying to analyze the data. Therefore the goal will be no good for our purposes
            return false;
        return this.goalNumber !== "-";
    }

    printRawData() {
        l(this.rawStringData);
    }

    isEmptyNet() {
        let tmp = this.strength.split("-");
        for (let a of tmp) {
            if (a === "EN")
                return true;
        }
        return false;
    }

    getJerseyAndName() {
        return `#${this.goalScorer.split("(")[0]}`;
    }

    prettyString() {
        return `${this.goalNumber} \t ${this.period} \t ${this.time} \t ${this.strength} \t ${this.scoringTeam} \t ${this.goalScorer} \t ${this.assists[0]} \t ${this.assists[1]} \t ${this.playersOnIceAway} \t ${this.playersOnIceHome}`;
    }

    get number() {
        return Number.parseInt(this.goalNumber)
    }

    getPlayerJerseyStr() {
        return this.goalScorer.split(" ")[0];
    }

    getPlayerJersey() {
        return Number.parseInt(this.getPlayerJerseyStr());
    }

    getScoringTeam() {
        return teams[this.scoringTeam.toUpperCase()];
    }
}

module.exports.Goal = Goal;