const {teams} = require("../util/constants");
const {Time, MakeTime} = require("../util/Time");

class Goal {
    constructor(goalNumber, period, time, strength, scoringTeam, goalScorer, assist1, assist2) {
        this.goalNumber = goalNumber;
        this.period = period;
        this.strength = strength;
        if(period === "SO")
            this.strength = "SO";
        if(period === "SO") {
            this.time = MakeTime("65:00");
        } else {
            this.time = MakeTime(time);
        }
        this.scoringTeam = scoringTeam;
        this.goalScorer = goalScorer;
        this.assists = [assist1, assist2];
    }

    translateStrength() {
        switch (this.strength) {
            case "EV":
                return "Even";
            case "EV-EN":
                return "Even Empty Net";
            case "PP":
                return "Power Play";
            case "EV-PS":
                return "Even Penalty Shot";
            case "PS":
                return "Penalty Shot";
            case "SH":
                return "Short Handed";
            case "SH-PS":
                return "Short Handed Penalty Shot";
            case "SH-EN":
                return "Short Handed Empty Net";
            case "PP-EN":
                return "Power Play Empty Net";
            case "PP-PS":
                return "Power Play Penalty Shot";
            case "SO":
                return "Shootout";
        }
    }

    get model() {
        let a = ["None", "None"];
        for (let i in this.assists) {
            a[i] = this.assists[i].split("(")[0];
        }
        return {
            goal: this.number,
            period: this.getScoringPeriod(),
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
        else if(this.period === "SO")
            return 5;
        else
            return Number.parseInt(this.period)
    }

    get scoringPeriod() {
        if (this.period === "OT")
            return 4;
        else if(this.period === "SO")
            return 5;
        else
            return Number.parseInt(this.period)
    }

    isRegularTimeGoal() {
        return this.getScoringPeriod() < 4;
    }

    isGood() {
        return this.goalNumber !== "-";
    }

    isEmptyNet() {
        return this.strength.includes("Empty Net");
    }

    getJerseyAndName() {
        return `#${this.goalScorer.split("(")[0]}`;
    }

    prettyString() {
        return `${this.goalNumber} \t ${this.period} \t ${this.time} \t ${this.strength} \t ${this.scoringTeam} \t ${this.goalScorer} \t ${this.assists[0]} \t ${this.assists[1]}`;
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
        return this.scoringTeam;
    }

    getScoringTeamFullName() {
        return teams[this.scoringTeam];
    }
}

module.exports.Goal = Goal;