// mongoose model getter done
const {Time, MakeTime} = require("../util/Time");
class PlayerStat {
    constructor(jersey, pName, goals, assists, points, diff, pim, sog, hits, blocks, giveaways, takeaways, faceoff, toi, pptoi, pktoi) {
        this.jersey = Number.parseInt(jersey);
        this.playerName = pName;
        this.goals = Number.parseInt(goals);
        this.assist = Number.parseInt(assists);
        this.points = Number.parseInt(points);
        this.diff = Number.parseInt(diff);
        this.pim = Number.parseInt(pim);
        this.sog = Number.parseInt(sog);
        this.hits = Number.parseInt(hits);
        this.blocks = Number.parseInt(blocks);
        this.giveaways = Number.parseInt(giveaways);
        this.takeaways = Number.parseInt(takeaways);

        if (faceoff === "")
            this.fow = 0.0;
        else
            this.fow = Number.parseFloat(faceoff);
        // l(`TOI: ${toi} | PPTOI: ${pptoi} | PKTOI: ${pktoi}`)
        this.toi = new Time(...toi.split(":"));
        this.pptoi = new Time(...pptoi.split(":"));
        this.pktoi = new Time(...pktoi.split(":"));
    }

    /**
     * Returns a JS Object that represents the structure defined for the MongoDB Schema Model with the name PlayerGameModelSchema
     * @returns {{penaltyMinutes: number | *, faceOffWins: (number|*), takeAways: number | *, blocked: number | *, points: number | *, hits: number | *, ppTimeOnIce: *, assists: number | *, timeOnIce: *, jersey: number | *, name: *, difference: number | *, shotsOnGoal: number | *, pkTimeOnIce: *, giveaways: number | *, goals: number | *}}
     */
    get model() {
        return {
            jersey: this.jersey,
            name: this.playerName,
            goals: this.goals,
            assists: this.assist,
            points: this.points,
            difference: this.diff,
            penaltyMinutes: this.pim,
            shotsOnGoal: this.sog,
            hits: this.hits,
            blockedShots: this.blocks,
            giveAways: this.giveaways,
            takeAways: this.takeaways,
            faceOffWins: this.fow,
            timeOnIce: this.toi.model,
            ppTimeOnIce: this.pptoi.model,
            pkTimeOnIce: this.pktoi.model,
        }
    }

    get name() {
        return this.playerName;
    }

    get faceoffWins() {
        return this.fow;
    }

    get shotsOnGoal() {
        return this.sog;
    }

    get asString() {
        return `${this.jersey} ${this.name} ${this.goals} ${this.assist} ${this.points} ${this.diff} ${this.pim} ${this.sog} ${this.hits} ${this.blocks} ${this.giveaways} ${this.takeaways} ${this.faceoffWins} ${this.toi} ${this.pptoi} ${this.pktoi}`
    }

    toString() {
        return `${this.jersey} ${this.name} ${this.goals} ${this.assist} ${this.points} ${this.diff} ${this.pim} ${this.sog} ${this.hits} ${this.blocks} ${this.giveaways} ${this.takeaways} ${this.faceoffWins} ${this.toi} ${this.pptoi} ${this.pktoi}`
    }
}

module.exports.PlayerStat = PlayerStat;