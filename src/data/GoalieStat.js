// mongoose model getter done
const {Time, MakeTime} = require("../util/Time");

class GoalieStat {
    constructor(jersey, name, shotsEven, shotsPP, shotsPK, shotsTotal, savePct, pim, toi) {
        this.jerseyNumber = jersey;
        this.playerName = name;
        let [es, em] = shotsEven.split("–");
        this.evensaves = es;
        this.evenTotalShots = em;
        let [pps, ppm] = shotsPP.split("–");
        this.ppSaves = pps;
        this.ppTotalShots = ppm;
        let [pks, pkg] = shotsPK.split("–");
        this.pkSaves = pks;
        this.pkTotalShots = pkg;
        let [ts, tg] = shotsTotal.split("–");
        this.savesTotal = ts;
        this.shotsTotal = tg;
        this.savePct = savePct;
        this.pim = pim;
        this.toi = new Time(...toi.split(":"));
    }

    get name() {
        return this.playerName;
    }

    /**
     * Returns a JS Object that represents the structure defined for the MongoDB Schema Model with the name GoalieGameModelSchema
     * @returns {{penaltyMinutes: *, savePercentage: *, timeOnIce: *, jersey: *, penaltyKill: {saves: *, shots: *}, powerPlay: {saves: *, shots: *}, name: *, evenStrength: {saves: *, shots: *}}}
     */
    get model() {
        return {
            jersey: this.jersey,
            name: this.name,
            evenStrength: {saves: this.evenSaves, shots: this.evenShots},
            powerPlay: {saves: this.powerPlaySaves, shots: this.powerPlayShots},
            penaltyKill: {saves: this.penaltyKillSaves, shots: this.penaltyKillShots},
            savePercentage: this.savePercentage,
            penaltyMinutes: this.penaltyMinutes,
            timeOnIce: this.toi.model,
        }
    }

    get jersey() {
        return Number.parseInt(this.jerseyNumber);
    }

    get totalSaves() {
        return Number.parseInt(this.savesTotal);
    }

    get totalGoals() {
        return Number.parseInt(this.shotsTotal);
    }

    get evenSaves() {
        return Number.parseInt(this.evensaves);
    }

    get evenShots() {
        return Number.parseInt(this.evenTotalShots);
    }

    get powerPlaySaves() {
        return Number.parseInt(this.ppSaves);
    }

    get powerPlayShots() {
        return Number.parseInt(this.ppTotalShots);
    }

    get penaltyKillSaves() {
        return Number.parseInt(this.pkSaves);
    }

    get penaltyKillShots() {
        return Number.parseInt(this.pkTotalShots);
    }

    get savePercentage() {
        return Number.parseFloat(this.savePct);
    }

    get penaltyMinutes() {
        return Number.parseInt(this.pim);
    }

    get timeOnIce() {
        return this.toi;
    }

    toString() {
        return `${this.jerseyNumber} ${this.playerName} ${this.evenSaves}-${this.evenShots} ${this.powerPlaySaves}-${this.powerPlayShots} ${this.penaltyKillSaves}-${this.penaltyKillShots} ${this.totalSaves}-${this.totalGoals} ${this.savePercentage} ${this.penaltyMinutes} ${this.toi}`
    }
}

module.exports.GoalieStat= GoalieStat;