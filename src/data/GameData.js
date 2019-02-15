const {Goal} = require("./Goal");

class GameData {
    /**
     *
     * @param id
     * @param away
     * @param home
     * @param date
     * @param finalResult
     * @param shotsOnGoal
     * @param faceOffWins
     * @param powerPlay
     * @param penaltyMinutes
     * @param hits
     * @param blockedShots
     * @param giveAways
     * @param scoringSummary {Goal[]}
     */
    constructor(id, away, home, date, finalResult, shotsOnGoal, faceOffWins, powerPlay, penaltyMinutes, hits, blockedShots, giveAways, scoringSummary) {
        this.id = id;
        this.away = away;
        this.home = home;
        this.date = date;
        this.finalResult = finalResult;
        this.shotsOnGoal = shotsOnGoal;
        this.faceOffWins = faceOffWins;
        this.powerPlay = powerPlay;
        this.penaltyMinutes = penaltyMinutes;
        this.hits = hits;
        this.blockedShots = blockedShots;
        this.giveAways = giveAways;
        this.scoringSummary = scoringSummary;
    }

    get isRegularSeason() {
        return this.id.toString()[5] === "2";
    }

    get goals() {
        return this.finalResult.away + this.finalResult.home;
    }

    getGoalsByPeriod(team, period) {
        if(team !== this.away && team !== this.home) {
            throw new Error(`Teams playing in this game, Home ${this.home} - Away: ${this.away}. Provided search criteria was for team: ${team}`);
        }
        return this.scoringSummary.reduce((res, goal) => {
            if(goal.getScoringTeam() === team && goal.getScoringPeriod() === period) {
                return res + 1;
            } else {
                return res;
            }
        })
    }

    getGoalTotalByPeriod(period) {
        return this.scoringSummary.reduce((res, goal) => {
            if(goal.getScoringPeriod() === period) {
                return res + 1;
            } else {
                return res;
            }
        })
    }

    getGoalsBy(team) {
        if(team === this.away) {
            return this.finalResult.away;
        } else
            return this.finalResult.home;
    }
}

module.exports.GameData = GameData;
