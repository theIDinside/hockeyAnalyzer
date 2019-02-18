'use strict';
const {Goal} = require("./Goal");

class ScoringSummary {
    constructor(goals) {
        this.goals = goals;
    }

    get firstPeriod() {
        return this.goals.filter((i, goal) => goal.getScoringPeriod() === 1);
    }

    get secondPeriod() {
        return this.goals.filter((i, goal) => goal.getScoringPeriod() === 2);
    }

    get thirdPeriod() {
        return this.goals.filter((i, goal) => goal.getScoringPeriod() === 3);
    }

}