const GameData = require("../data/GameData");
class Team {
    constructor(teamName) {
        this.teamName = teamName;
    }

    get name() {
        return this.teamName;
    }

    /**
     *
     * @param games {GameData[]}
     * @param period
     * @constructor
     */
    GFAverage = (games, period=1) => (games.reduce((res, game) => res + game.getGoalsByPeriod(this.name, period)) / games.length);

    GAAverage(games, period=1) {

    }

    /**
     * Returns total goals (for/against) average by period, over the last games.
     * @param games {GameData[]}
     * @param period
     * @return {Number}
     */
    GAverage = (games, period=1) => games.reduce((res, game) => res + game.getGoalTotalByPeriod(period)) / games.length;
}