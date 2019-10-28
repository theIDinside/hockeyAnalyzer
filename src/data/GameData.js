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

    getOtherTeamName(team) { return (team === this.away) ? this.home : this.away; }

    get totalScore() {
        return this.finalResult.away + this.finalResult.home;
    }

    get goals() {
        return this.finalResult.away + this.finalResult.home;
    }

    getTeamGameStats(team) {
        return {
            team: (team === this.home) ? this.home : this.away,
            goals: (team === this.home) ? this.finalResult.home : this.finalResult.away,
            shotsOnGoal: (team === this.home) ? this.shotsOnGoal.home : this.shotsOnGoal.away,
            faceOffWins: (team === this.home) ? this.faceOffWins.home : this.faceOffWins.away,
            powerPlay: (team === this.home) ? this.powerPlay.home : this.powerPlay.away,
            penaltyMinutes: (team === this.home) ? this.penaltyMinutes.home : this.penaltyMinutes.away,
            hits: (team === this.home) ? this.hits.home : this.hits.away,
            blockedShots: (team === this.home) ? this.blockedShots.home : this.blockedShots.away,
            giveAways: (team === this.home) ? this.giveAways.home : this.giveAways.away,
        }

    }

    getGoalsByPeriod(team, period) {
        if(team !== this.away && team !== this.home) {
            throw new Error(`Teams playing in this game, Home ${this.home} - Away: ${this.away}. Provided search criteria was for team: ${team}`);
        }
        if(period > 5) {
            throw new Error(`You can only provide 1, 2, 3 or 4 (OT) as periods. If you provide 5, you are asking for data of entire game. You provided ${period}`);
        }
        return this.scoringSummary.reduce((res, goal) => {
            if(goal.getScoringTeam() === team && goal.getScoringPeriod() === period) {
                return res + 1;
            } else {
                return res;
            }
        }, 0)
    }

    getGoalTotalByPeriod(period) {
        return this.scoringSummary.reduce((res, goal) => {
            if(goal.getScoringPeriod() === period) {
                return res + 1;
            } else {
                return res;
            }
        }, 0)
    }

    getGoalsBy(team) {
        if(team === this.away) {
            return this.finalResult.away;
        } else
            return this.finalResult.home;
    }

    get summary() {
        return this.scoringSummary;
    }

    get winner() {
        return (this.finalResult.home > this.finalResult.away) ? this.home : this.away;
    }

    get loser() {
        return (this.finalResult.home < this.finalResult.away) ? this.home : this.away;
    }

    get periods() {
        let p1 = this.scoringSummary.filter((g, i) => g.getScoringPeriod() === 1).reduce((res, goal) => {
            if(goal.getScoringTeam() === this.home) {
                return {home: res.home + 1, away: res.away }
            } else {
                return {home: res.home, away: res.away + 1 }
            }
        }, {home: 0, away: 0});
        let p2 = this.scoringSummary.filter((g, i) => g.getScoringPeriod() === 2).reduce((res, goal) => {
            if(goal.getScoringTeam() === this.home) {
                return {home: res.home + 1, away: res.away }
            } else {
                return {home: res.home, away: res.away + 1 }
            }
        }, {home: 0, away: 0});;
        let p3 = this.scoringSummary.filter((g, i) => g.getScoringPeriod() === 3).reduce((res, goal) => {
            if(goal.getScoringTeam() === this.home) {
                return {home: res.home + 1, away: res.away }
            } else {
                return {home: res.home, away: res.away + 1 }
            }
        }, {home: 0, away: 0});;
        return [p1, p2, p3];
    }
}

module.exports.GameData = GameData;
