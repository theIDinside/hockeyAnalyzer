'use strict';
const {Game} = require("../models/GameModel");
const {GameData} = require('../../data/GameData')
/// ------ GAME AVERAGES & ANALYSIS ------

function PenaltyKilling(team, games) {
    const span = Math.floor(games.length / 2);
    return [...Array(span).keys()].map((v, index) => {
        let total_pks = 0;
        let goals = 0;
      let pks = games.filter((g, i) => i <= (span+index) && i > index).map(g => g.toGameData().getPenaltyKill(team));

      for(let pk of pks) {
          console.log(`Total: ${pk.total}. Goals: ${pk.goals}`);
          total_pks += pk.total;
          goals += pk.goals;
      }
      return {
          total: total_pks,
          goals: goals,
          penalties_taken_avg: total_pks / span,
          pct: (1 - (goals / total_pks)) * 100.0
      };
    });
}

function PowerPlay(team, games) {
    const span = Math.floor(games.length / 2);
    return [...Array(span).keys()].map((v, index) => {
        let total_pps = 0;
        let goals = 0;
        let pps = games.filter((g, i) => i <= (span+index) && i > index).map(g => g.toGameData().getPowerPlays(team));
        for(let pp of pps) {
            total_pps += pp.total;
            goals += pp.goals;
        }
        return {
            total: total_pps,
            goals: goals,
            power_plays_amount_avg: total_pps / span,
            pct: ((goals / total_pps) * 100.0)
        };
    })
}


/**
 * Returns goals for average over the last games, lastGames.
 * @param team {String}
 * @param games {Game[]}
 * @return {{average: Number, games: Number}}
 */
function GFGameAverage(team, games) {
    // oh the lovely universe of functional programming.
    const span = Math.floor(games.length / 2);

    let avg = [];
    let games_goals = [];
    games.forEach(g => games_goals.push(g.toGameData().getGoalsBy(team)));
    for(let i = 0; i < span; i++) {
        let goals_for_average_over_span_games = 0;
        for(let j = (games.length - 1 - i); j > (games.length - 1 - i - span) && j > 0; j--) {
            let gameData = games[j].toGameData();
            goals_for_average_over_span_games += gameData.getGoalsBy(team);
        }
        let average = goals_for_average_over_span_games / span;
        avg.push(average);
    }
    avg.reverse();
//    console.log(`Games and the score made by ${team} each games: ${[...games_goals]}`);
//    console.log(`Average data in GFGameAverage for team ${team}: ${[...avg]}`);
    let trendAtChartData = [...Array(span).keys()]
        .map((v, index) =>
            (games
                .filter((g, i) => i < (span+index) && i >= index)
                .map(g => g.toGameData().getGoalsBy(team))
                .reduce((res, goals) => res + goals, 0.0) / span).toFixed(4));
    return {
        games: span,
        average: trendAtChartData[trendAtChartData.length-1],
        trendChartData: [...trendAtChartData]
    };
}

/**
 * Returns goals against average over the last games, lastGames.
 * @param team {String}
 * @param games {Game[]}
 * @return {{average: Number, games: Number, trendChartData: Number[]}}
 */
function GAGameAverage(team, games) {
    // oh the lovely universe of functional programming.
    const span = Math.floor((games.length / 2));
    let trendAtChartData = [...Array(span).keys()]
        .map((v, index) =>
            (games
                .filter((g, i) => i <= (span+index) && i > index)
                .map(g => g.toGameData())
                .map(gd => gd.getGoalsBy(gd.getOtherTeamName(team)))
                .reduce((res, goals) => res + goals, 0) / span).toFixed(4));
    return {
        games: span,
        average: trendAtChartData[trendAtChartData.length-1],
        trendChartData: [...trendAtChartData]
    };
}

/**
 * Returns total goal average over the last games. Only the last half of the game span, will be calculated on. The first half,
 * is only to determine, the average going into the last half of the game span. So to determine what the average is, at game 1, one
 * must first analyze the prior games. But the returned average in parameter average, is the average over the last {span} games.
 * @param team {String}
 * @param games {Game[]}
 * @return {{average: Number, games: Number, trendChartData: Number[]}}
 */
function GGameAverage(team, games) {
    const span = Math.floor((games.length / 2));
    let trendAtChartData = [...Array(span).keys()]
        .map((v, index) =>
            (games
                .filter((g, i) => i <= (span+index) && i > index)
                .map(g => g.toGameData().totalScore)
                .reduce((res, goals) => res + goals, 0) / span).toFixed(4));

    return {
        games: span,
        average: trendAtChartData[trendAtChartData.length-1],
        trendChartData: [...trendAtChartData]
    };
}

/**
 * Pre-condition: Games passed as a parameter to this function, must be sorted as "Won games". Passing lost games to this function
 * is non-sensical and is considered UB as far as result of analysis.
 * @param team {String}
 * @param games {Game[]}
 * @return {{ENGoals: { lead: Number, scored: Boolean}|{scored: Boolean}, games: Number, pct: Number}}
 */
function EmptyNetScores(team, games) {
    const span = games.length / 2;


    let ENGoals = games.filter((g, i) => i >= span).map(g => {
        let gd = g.toGameData();
        for(let g of gd.scoringSummary) {
            if(g.isEmptyNet() && g.getScoringTeamFullName() === team) {
                let goalNumber = g.goalNumber;
                // we also need to know, if the lead was by 1 or 2, when they netted in the empty net
                let priorScore = gd.scoringSummary.filter(goal => goal.goalNumber < goalNumber).reduce((res, goal) => {
                    if(goal.getScoringTeamFullName() === team) {
                        return { analyzedTeam: res.analyzedTeam +1, otherTeam: res.otherTeam }
                    } else {
                        return { analyzedTeam: res.analyzedTeam, otherTeam: res.otherTeam + 1 }
                    }
                }, {analyzedTeam: 0, otherTeam: 0});

                return {
                    lead: priorScore.analyzedTeam - priorScore.otherTeam,
                    scored: true
                };
            }
        }
        return {
            scored: false
        }
    });
    return {
        games: span,
        ENGoals: ENGoals,
        pct: (ENGoals.filter(v => v.scored).length / span) * 100.0
    }
}

/**
 * Pre-condition: Games passed in as parameter games must be games won by team, otherwise this function performs UB as far as result of the analysis.
 * 
 * @param {string} team 
 * @param { Game[] } games 
 * @return {  { result: { all_wins: number, games: number, ENGoals: number, pct: number } } }
 */
function EmptyNetScoring(team, games) {
    let games_won_regular = games.filter(game => {
        let gd = game.toGameData();
        for(let goal of gd.scoringSummary) {
           if(goal.getScoringPeriod() === 4 || goal.getScoringPeriod() === 5) {
               return false;
           }
        }
       return true;
    });
    let games_analyzed = games_won_regular.length;

    let empty_net_goal_games = games_won_regular.map(game => game.toGameData()).filter(gd => {
        for(let goal of gd.scoringSummary) {
            if(goal.isEmptyNet() && goal.getScoringTeamFullName() === team) {
                return true;
            }
        }
        return false; 
    });

    let result = {
        all_wins: games.length,
        games: games_won_regular.length,
        ENGoals: empty_net_goal_games.length,
        pct: (empty_net_goal_games.length / games_analyzed) * 100.0
    };

    console.log(`Empty net scoring stats: Goals: ${result.ENGoals}. Games won: ${result.games}, Percentage: ${result.pct}`);

    return result;
}


/**
 * Pre-condition: The games passed to this function, must be games were the team lost. Otherwise this produces UB, as far
 * as the result of the analysis.
 * @param {string} team
 * @param {GameModel[]} games
 * @returns {{ all_losses: number, games: number, ENLetUps: number, pct: number }}
 * @constructor
 */
function EmptyNetLetUps(team, games) {
    let all_losses = games.length;
    let games_lost_regular = games.filter(game => {
        let gameData = game.toGameData();
        for(let goal of gameData.scoringSummary) {
            if(goal.getScoringPeriod() === 4 || goal.getScoringPeriod() === 5) {
                return false;
            }
        }
        return true;
    });
    let games_analyzed = games_lost_regular.length;
    let empty_net_letup_games = games_lost_regular.map(game => game.toGameData()).filter(gd => {
        for(let g of gd.scoringSummary) {
            if(g.isEmptyNet() && g.getScoringTeamFullName() !== team) {
                return true;
            }
        }
        return false;
    });

    return {
        all_losses: all_losses,
        games: games_lost_regular.length,
        ENLetUps: empty_net_letup_games.length,
        pct: (empty_net_letup_games.length / games_analyzed) * 100.0
    }
}

function makeFilter(team, teams, live_result) {
    return {
        team: team,
        score: (teams.home === team) ? live_result.score.home : live_result.score.away,
        opponent: (teams.home === team) ? live_result.score.away : live_result.score.home,
        gameTime: live_result.gameTime,
        deficit: () => (this.score - this.opponent) < 0,
        difference: () => this.score - this.opponent,
    };
}

const FULL_SEASON = 81;
/** TODO: PROTOTYPING / SKETCHING ON A LIVE RESULT ANALYSIS FUNCTION. TEST CASE, live_result = "4-2 13:47 P2" */
async function LiveResult(live_result, teams, span=FULL_SEASON) { // live result parameter could look like this: "4-2 13:47 P2" (String)
    let home_games = API.getLastXGamesPlayedBy(span, home);
    let away_games = API.getLastXGamesPlayedBy(span, away);

    let {score, gameTime} = live_result;
    let {home, away} = teams;


    // TODO: Then one could use this object, to apply a filter/search on all games played, and see what outcomes came
    // in games, where similar or equal results was at the same moment in time, in that/those game/games.
    return Promise.all([home_games, away_games]).then(all_games => {
        let [hGames, aGames] = all_games;
        let hGamesData = hGames.map(g => g.toGameData());
        let aGamesData = aGames.map(g => g.toGameData());
        let homeFilter = makeFilter(home, teams, live_result);
        let awayFilter = makeFilter(away, teams, live_result);

        let homeResult = {};
        let awayResult = {};

        if(homeFilter.deficit()) {
            // TODO: look for all the games, where this team has had a deficit, and analyze outcomes
        } else {
            // TODO: look for all the games, where this team has had a lead, and analyze outcomes
        }

        if(awayFilter.deficit()) {
            // TODO: look for all the games, where this team has had a deficit, and analyze outcomes
        } else {
            // TODO: look for all the games, where this team has had a lead, and analyze outcomes
        }

    });
}

class Time {
    /**
     *
     * @param min {number}
     * @param sec {number}
     * @param period {number}
     */
    constructor(min, sec, period) {
        this.min = min;
        this.sec = sec;
        this.period = period;
    }

    get asObject() {
        return {
            min: this.min,
            sec: this.sec,
            period: this.period
        };
    }

    equals(t) {
        return this >= t && this <= t;
    }

    toString() {
        return `${this.min}:${this.sec} P${this.period}`
    }

    /**
     * For use with comparisons of two time points. and since mins and sec can be 0, we make *sure* it's never 0 by
     * adding 1. This basically gives us the ability to "fake" overloading operators in Javascript. Because
     *
     *  Example:
     *      let t = new Time(13, 42, 2);  // 13:42 P2
     *      let ta = new Time(13, 42, 2); // 13:42 P2
     *      let t2 = new Time(17, 13, 3); // 17:13 P3
     *      t < t2 -> true
     *      t2 < t -> false
     * @returns {number}
     */
    valueOf() {
        switch(this.period) {
            case 1:
                return (this.min + 1) * (this.sec + 1);
            case 2:
                return 20 * 60 + (this.min + 1) * (this.sec + 1); // 19*59 is the largest value if within any time of P1, therefore we add that
            case 3:
                return (20*60*2) + (this.min + 1) * (this.sec + 1);
            case 4: // Overtime
                return (20 * 60 * 3) + (this.min + 1) * (this.sec + 1);
            default:
                throw new Error(`Erroneous period value: ${this.period}. It should only be between 1 and 4`);
        }
    }
}

/**
 * TODO: This is only a sketch / idea function so far. Anything placed here, is for further analysis dev
 * @param team
 * @param games
 * @returns {Promise<void>}
 * @constructor
 */
async function AnalyzePatterns(team, games) {
    let pattern_filter = { // TODO: This is just an example filter object
            greatest_pickup: {
                value: 2,
                time: new Time(13, 42, 2)
            },
            greatest_loss: {
                value: 2,
                time: new Time(13, 42, 2)
            }
    };
}

/**
 * Fenwick is almost identical to the stat type Corsi, with the exception that blocked shots are not taken into account.
 * Also be aware that this Fenwick used here, isn't really the real Fenwick either. It does *not* take account for missed shots.
 * They say somehow missed shots are used in this calculation, but I think that seriously misleads the over arching analysis.
 * Shot efficiency is important. If a team keeps missing shots, they can be throwing it from the neutral zone.
 * @param cf
 * @param ca
 * @constructor
 */
function Fenwick(cf, ca) {
    this.for = cf;
    this.against = ca;
    this.calculate = () => this.for - this.against;
}

function Corsi(cf, ca) {
    this.for = cf;
    this.against = ca;
    this.calculate = () => this.for - this.against;
}

function PDO(save, shot_eff) {
    this.save_percentage = save;
    this.shot_efficiency = shot_eff;
    this.calculate = () => this.save_percentage + this.shot_efficiency;
}

const lastXGameStats = (team, games) =>
    games.map(g => g.toGameData())
            .map(gd => {
                let Team = (gd.home === team) ? 'home' : 'away';
                let Opponent = (Team === "home") ? "away" : "home";
                return {
                    at: Team,
                    vs: (Team === "home") ? gd.away : gd.home,
                    date: gd.date,
                    shots: gd.shotsOnGoal,
                    score: { team: gd.finalResult[Team], opponent: gd.finalResult[Opponent] },
                    scorePct: { team: gd.shotsOnGoal[Team] / gd.finalResult[Team], opponent: gd.shotsOnGoal[Opponent] / gd.finalResult[Opponent] },
                    pdo: new PDO(1-(gd.finalResult[Opponent]/gd.shotsOnGoal[Opponent]), gd.finalResult[Team] / gd.shotsOnGoal[Team] ),
                    corsi: new Corsi(gd.shotsOnGoal[Team], gd.shotsOnGoal[Opponent]),
                    periods: gd.periods,
                    won: (team === gd.winner)
                }
            });

module.exports = { GFGameAverage, GAGameAverage, GGameAverage, EmptyNetScoring, EmptyNetLetUps, lastXGameStats, PowerPlay, PenaltyKilling, LiveResult };