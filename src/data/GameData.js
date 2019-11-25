const {Goal} = require("./Goal");

function ThrowError(gameData, team, message="") {
    if(message === "") {
        throw new Error(`You tried receiving stats by either home: ${gameData.home} or away: ${gameData.away}. But the parameter you provided was ${team}`);
    } else {
        throw new Error(message);
    }

}


/** TODO: Fix the home.totals property. This should really be home.total, but for now it will stay totals, as it is saved as such in the DB */

/** TYPEDEFS
 * @typedef PowerPlay
 * @property {{ goals: {number}, total: {number} }} away The amount of power play goals made, and total PPs
 * @property {{ goals: {number}, totals: {number} }} home The amount of power play goals made, and total PPs
 */

class GameData {
    /**
     *
     * @param {number} id
     * @param {string} away
     * @param {string} home
     * @param {Data} date
     * @param {Object} finalResult
     * @param {Object[]} shotsOnGoal
     * @param {Object} faceOffWins
     * @param { PowerPlay } powerPlay
     * @param {} penaltyMinutes
     * @param {} hits
     * @param {} blockedShots
     * @param {} giveAways
     * @param {} scoringSummary {Goal[]}
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

    getOpponentTeamName(team) { return (team === this.away) ? this.home : this.away; }

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

    /**
     * @typedef Scoring
     * @property { number } home - Home score
     * @property { number } away - Away score
     * @property { GameTime } time - Goal scored at time
     * @property { Goal } goal - The goal object type, defined in data/Goal.js.
     *
     * Returns the score in order. The returned object also has the function hadDifference, which can be utilized,
     * in a filter operation, to check for example "Did team Home, have a lead of 3-1? Or did team Home have a deficit of 1-3?"
     * This way, analysis for outcomes at a certain point in the game, can be done with ease.
     * @return {{teams: {away: string, home: string}, scoreOrder: Scoring[], removeStandingsPrior: (function(string, number): Scoring[]), hadDifference: (function(*, *): boolean)}}
     */
    get scoreOrder() {

        let standing = { home: 0, away: 0};

        let scoreOrder = [];
        for(let goal of this.scoringSummary) {
            if(goal.getScoringTeam() === this.home) {
                standing.home += 1;
            } else {
                standing.away += 1;
            }
            let score = { home: standing.home, away: standing.away, time: goal.gameTime, goal: goal };
            scoreOrder.push(score);
        }

        let res = {
            teams: {home: this.home, away: this.away},
            scoreOrder: scoreOrder,
            hadDifference: (team, goal_diff) => this.scoreOrder.filter(standing => {
                if(team === this.home) {
                    return standing.home - standing.away === goal_diff;
                } else {
                    return standing.away - standing.home === goal_diff;
                }
            }).length > 0,
            removeStandingsPrior: (team, goal_diff) => { // removes standings in game, that was before goal_diff for team
              let deleteCount = 0;
              for(let score of this.scoreOrder) {
                  if(team === this.home) {
                      if(score.home - score.away === goal_diff) {
                          break;
                      } else {
                          deleteCount++;
                      }
                  } else {
                      if(score.away - score.home === goal_diff) {
                          break;
                      } else {
                          deleteCount++;
                      }
                  }
              }
              let res = this.scoreOrder.map(s => s);
              res.splice(0, deleteCount);
              return res;
            },
        };

        return res; // will return something like [0:0, 0:1, 1:1, 2:1, 3:1, 4:1, 4:2]
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

    getAnalysisData(team) {
        if(team === this.home || team === this.away) {
            return {
                SF: this.getShotsBy(team),
                SA: this.getShotsBy(this.getOpponentTeamName(team)),
                GF: this.getGoalsBy(team),
                GA: this.getGoalsBy(this.getOpponentTeamName(team)),
                Save: 1-(gd.getGoalsBy(this.getOpponentTeamName(team)) / gd.getShotsBy(this.getOpponentTeamName(team))),
                PDO: this.getPDO(team),
                Corsi: 100.0 * (this.getShotsBy(team) / (this.getShotsBy(team) + this.getShotsBy(this.getOpponentTeamName(team))))
            };
        } else {
            throw new Error(`Teams playing in this game, Home ${this.home} - Away: ${this.away}. Provided search criteria was for team: ${team}`);
        }
    }

    getPDO(team) {
        if(team === this.home) {
            return (1-(this.getGoalsBy(this.away)/this.getShotsBy(this.away)) + (this.getGoalsBy(this.home))/this.getShotsBy(this.home)) * 100.0;
        } else if(team === this.away) {
            return (1-(this.getGoalsBy(this.home)/this.getShotsBy(this.home)) + (this.getGoalsBy(this.away))/this.getShotsBy(this.away)) * 100.0;
        } else {
            throw new Error(`Teams playing in this game, Home ${this.home} - Away: ${this.away}. Provided search criteria was for team: ${team}`);
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

    get decidedInRegulation() {
        for(let goal of this.scoringSummary) {
            if(goal.scoringPeriod < 4) {
                return false;
            }
        }
        return true;
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
