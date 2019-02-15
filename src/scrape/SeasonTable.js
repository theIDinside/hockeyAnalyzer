const C = require('cheerio')
const NHLTeamStatsURL = "http://www.nhl.com/stats/scoringTeam?reportType=season&seasonFrom=20182019&seasonTo=20182019&gameType=2&filter=gamesPlayed,gte,1&sort=points,wins";
const puppeteer = require('puppeteer');

function getDiffStats(team) {
    let diffs = {
        shots: Number.parseFloat(team.shotstaken_avg) - Number.parseFloat(team.shotsagainst_avg),
        goals: Number.parseFloat(team.goals_for) - Number.parseFloat(team.goals_against),
        goalavg: Number.parseFloat(team.goals_avg) - Number.parseFloat(team.goals_against_avg),
        gameresults: Number.parseInt(team.wins) - Number.parseInt(team.losses),
        savepct: Number.parseFloat(team.shotsagainst_avg) / Number.parseFloat(team.goals_against_avg)
    };
    return diffs;
}

function compareTeams(teamA, teamB) {
    let comparison = {

    }
    let i = 0;
    for(let key in teamA) {
        if(i != 0)
            comparison[key] = Number.parseFloat(teamA[key]) - Number.parseFloat(teamB[key])
        else 
            comparison["teams"] = `${teamA.name} - ${teamB.name}`
        ++i;
    }
    return comparison;
}

class Team {
    constructor(position, name, gp, wins, loss, ties, otloss, pts, rotwins, ptspct, gf, ga, sowins, gfgame, gagame, pp, pk, sfgame, sagame, fowins) {
        this.raw = `${position} ${name} ${gp} ${wins} ${loss} ${ties} ${otloss} ${pts} ${rotwins} ${ptspct} ${gf} ${ga} ${sowins} ${gfgame} ${gagame} ${pp} ${pk} ${sfgame} ${sagame} ${fowins}`;
        this.position = position;
        this.name = name;
        this.gamesPlayed = gp;
        this.wins = wins;
        this.losses = loss;
        this.ties = ties;
        this.otlosses = otloss;
        this.points = pts;
        this.rotwins = rotwins;
        this.pointsPercent = ptspct;
        this.goalsFor = gf;
        this.goalsAgainst = ga;
        this.shootoutWins = sowins;
        this.goalsForPerGame = gfgame;
        this.goalsAgainstPerGame = gagame;
        this.powerplay = pp;
        this.penaltyKill = pk;
        this.shotsForPerGame = sfgame;
        this.shotsAgainstPerGame = sagame;
        this.faceoffWins = fowins;
    }

    getName() {
        return this.name;
    }

    getPosition() {
        return Number.parseInt(this.position);
    }

    getPoints() {
        return Number.parseInt(this.points);
    }

    compareTo(otherTeam) {
        let diffs = {
            teams: { teamA: this, teamB: otherTeam },
            shotsFor: Number.parseFloat(this.shotsForPerGame) - Number.parseFloat(otherTeam.shotsForPerGame),
            shotsAgainst: Number.parseFloat(this.shotsAgainstPerGame) - Number.parseFloat(otherTeam.shotsAgainstPerGame),
            goals: Number.parseFloat(this.goalsForPerGame) - Number.parseFloat(otherTeam.goalsForPerGame),
            goalsAgainst: Number.parseFloat(this.goalsAgainstPerGame) - Number.parseFloat(otherTeam.goalsAgainstPerGame),
            wins: Number.parseFloat(this.wins) - Number.parseFloat(otherTeam.wins),
            loss: Number.parseFloat(this.losses) - Number.parseFloat(otherTeam.losses),
            savePct: (1 - Number.parseFloat(this.goalsAgainstPerGame) / Number.parseFloat(this.shotsAgainstPerGame)) -
                (1 - Number.parseFloat(otherTeam.goalsAgainstPerGame) / Number.parseFloat(otherTeam.shotsAgainstPerGame))
        };
        return diffs;
    }

    getRawData() {
        return this.raw;
    }
}

async function getTeamStandingsData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log("Requesting data from www.nhl.com/stats... Please wait")
    const status = await page.goto(NHLTeamStatsURL, {waitUntil: "networkidle2"});
    const content = await page.content();
    browser.close();
    console.log("Data retrieved... organizing data")
    let data = C.load(content)
    let seasonStandings = data('div.rt-tbody').children().map((index, elem) => {
        // here, each elem, represents the div row group. To get individual cells, we need to call children() once again, on elem
        // console.log(data(elem).text())
        let iter = data(elem).children().children().map((i, e) => {
            return data(e).text()
        }).get()

        iter.splice(2, 1);
        return new Team(...iter);
    }).get();
    return seasonStandings;
}

module.exports = {
    getTeamStandingsData: getTeamStandingsData,
    compareTeams: compareTeams,
    getDiffStats: getDiffStats,
    Team: Team
}