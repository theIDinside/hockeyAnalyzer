const Trends = require('./Trend');
const {Game, ScoringSummary, GamePlayer, getLastXGamesPlayedBy} = require("./models/GameModel");
const {Team} = require("./Team");

class Bet {
    /**
     *
     * @param teamA {Team}
     * @param teamB {Team}
     * @param odds {Number}
     */
    constructor(teamA, teamB, odds) {
        this.teamA = teamA;
        this.teamB = teamB;
        this.odds = odds;
    }


}

class PeriodWin extends Bet {
    constructor(teamA, teamB, odds, periodNo) {
        super(teamA, teamB, odds);

    }
}