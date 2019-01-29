const C = require('cheerio')
const phantom = require('phantom');
const NHLTeamStatsURL = "http://www.nhl.com/stats/team?reportType=season&seasonFrom=20182019&seasonTo=20182019&gameType=2&filter=gamesPlayed,gte,1&sort=points,wins";

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

function Team(position, name, gp, wins, loss, ties, otloss, pts, rotwins, ptspct, gf, ga, sowins, gfgame, gagame, pp, pk, sfgame, sagame, fowins) {
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

async function getTeamStandingsData() {
    let seasonStandings = []
    const instance = await phantom.create();
    const page = await instance.createPage();
    console.log("Requesting data from www.nhl.com/stats... Please wait")
    await page.on('onResourceRequested', function(requestData) {});
    const status = await page.open(NHLTeamStatsURL);
    const content = await page.property('content');
    let data = C.load(content)
    console.log("Data retrieved... organizing data")
    let dataTable = data('div.rt-tbody').children().each((index, elem) => {
        // here, each elem, represents the div row group. To get individual cells, we need to call children() once again, on elem
        // console.log(data(elem).text())
        let iter = data(elem).children().children().map((i, e) => {
            return data(e).text()
        }).get()

        iter.splice(2, 1);
        let team = new Team(...iter);        
        seasonStandings.push(team);
    })
    await instance.exit();
    return teams;
}

module.exports = {
    getTeamStandingsData: getTeamStandingsData,
    compareTeams: compareTeams,
    getDiffStats: getDiffStats
}