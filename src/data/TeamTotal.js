const {Float, Int} = require("../util/utilities");
const {teams} = require("../util/constants");
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


module.exports.TeamTotal = TeamTotal;