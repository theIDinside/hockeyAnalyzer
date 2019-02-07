class Game {
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
}

let a = {
    gameID:         { type: String, required: true, unique: true},
    teams:          {
        type: { away: String,  home: String },
        required: true,
    },
    datePlayed:     { type: Date, required: true },
    finalResult:    { type: { away: Number, home: Number }, required: true  },
    shotsOnGoal:    {
        type: [{ away: Number, home: Number}],
            validate: {
            validator: (periods) => periods.length >= 3,
                messsage: props => `You must provide stats for 3 periods at least, you provided ${props.value.length} periods`
        }
    },
    faceOffWins:    { type: { away: Number, home: Number }, required: true },
    powerPlay:      { away: { goals: Number, total: Number }, home: { goals: Number, totals: Number } },
    penaltyMinutes: { away: Number, home: Number },
    hits:           { away: Number, home: Number },
    blockedShots:   { away: Number, home: Number },
    giveAways:      { away: Number, home: Number },
    playersAway: {
        players: [PlayerGameModelSchema], // each game, will have a subdocument included for every player who participated in the game
            goalies: [GoalieGameModelSchema]
    },
    playersHome: {
        players: [PlayerGameModelSchema],
            goalies: [GoalieGameModelSchema]
    },
    scoringSummary: [ScoringSummarySchema]
}
