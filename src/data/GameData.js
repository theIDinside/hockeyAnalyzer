const {Goal} = require("./Goal");

function ThrowError(gameData, team, message="") {
    if(message === "") {
        throw new Error(`You tried receiving stats by either home: ${gameData.home} or away: ${gameData.away}. But the parameter you provided was ${team}`);
    } else {
        throw new Error(message);
    }

}

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

    getShotsBy(team) {
        return this.shotsOnGoal.reduce((res, period) => {
            if(team === this.away) {
                return res + period.away;
            } else if(team === this.home) {
                return res + period.home;
            } else {
                ThrowError(this, team);
            }
        }, 0);
    }

    getShotsByPeriods(team) {
        return this.shotsOnGoal.map(period => {
            if(team === this.away) {
                return period.away;
            } else if(team === this.home) {
                return period.home;
            } else {
                ThrowError(this, team);
            }
        })
    }

    getShotsByPeriod(team, period) {
        if(period < 1 || period > 3)
            ThrowError(this, team, `When retrieving shots by period, valid period numbers are 1 through 3. You provided :${period}`);
        if(team === this.away) {
            return this.shotsOnGoal[period-1].away;
        } else if(team === this.home) {
            return this.shotsOnGoal[period-1].home;
        } else
            ThrowError(this, team);
    }

    getOtherTeamName(team) { return (team === this.away) ? this.home : this.away; }

    getPowerPlays(team) {
        if(team === this.away) {
            let {goals, total} = this.powerPlay.away;
            return {
                goals: goals,
                total: total
            };
        } else if(team === this.home) {
            let {goals, totals} = this.powerPlay.home;
            return {
                goals: goals,
                total: totals
            };
        } else {
            throw new Error(`Team provided as parameter does not play in this game: ${team}. Teams playing: ${this.away}-${this.home}`);
        }
    }
    getPenaltyKill(team) {
        if(team === this.home) {
            let {goals, total} = this.powerPlay.away;
            if(total === undefined) {
                console.log(`Value is undefined in game: ${this.away}-${this.home} with gameID: ${this.id}`);
            }
            return {
                goals: goals,
                total: total
            };
        } else if(team === this.away) {
            let {goals, totals} = this.powerPlay.home;
            if(totals === undefined) {
                console.log(`Value is undefined in game: ${this.away}-${this.home} with gameID: ${this.id}`);
            }
            console.log(`Goals: ${goals}. Total in game: ${totals}`);
            return {
                goals: goals,
                total: totals
            };
        } else {
            throw new Error(`Team provided as parameter does not play in this game: ${team}. Teams playing: ${this.away}-${this.home}`);
        }
    }

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
        let result = this.scoringSummary.reduce((res, goal) => {
            if(goal.getScoringTeamFullName() === team && goal.getScoringPeriod() === period) {
                return res + 1;
            } else {
                return res;
            }
        }, 0);
        return result;
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
        if(team === this.away)
            return this.finalResult.away;
        else if(team === this.home)
            return this.finalResult.home;
        else
            ThrowError(this, team);
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
            if(goal.getScoringTeamFullName() === this.home) {
                return {home: res.home + 1, away: res.away }
            } else {
                return {home: res.home, away: res.away + 1 }
            }
        }, {home: 0, away: 0});
        let p2 = this.scoringSummary.filter((g, i) => g.getScoringPeriod() === 2).reduce((res, goal) => {
            if(goal.getScoringTeamFullName() === this.home) {
                return {home: res.home + 1, away: res.away }
            } else {
                return {home: res.home, away: res.away + 1 }
            }
        }, {home: 0, away: 0});;
        let p3 = this.scoringSummary.filter((g, i) => g.getScoringPeriod() === 3).reduce((res, goal) => {
            if(goal.getScoringTeamFullName() === this.home) {
                return {home: res.home + 1, away: res.away }
            } else {
                return {home: res.home, away: res.away + 1 }
            }
        }, {home: 0, away: 0});
        return [p1, p2, p3];
    }

}

module.exports.GameData = GameData;
