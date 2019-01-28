const C = require('cheerio')
const rp = require('request-promise');
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

async function getTeamStandingsData() {
    let teams = []
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
        const pos = iter[0]
        const name = iter[1]
        const season = iter[2]
        const GP = iter[3]
        const WINS = iter[4]
        const LOSS = iter[5]
        const TIED = iter[6]
        const OTLOSS = iter[7]
        const POINTS = iter[8]
        const R_OT_WINS = iter[9]
        const POINTS_PCT = iter[10]
        const GF = iter[11]
        const GA = iter[12]
        const SOWINS = iter[13]
        const GF_PER_GAME = iter[14]
        const GA_PER_GAME = iter[15]
        const PP = iter[16]
        const PK = iter[17]
        const SHOTS_PER_GAME = iter[18]
        const SA_PER_GAME = iter[19]
        const FACEOFF_WINS = iter[20]
        const teamStanding = {
            name: name,
            position: pos,
            gamesplayed: GP,
            wins: WINS,
            losses: LOSS,
            tied: TIED,
            ot_losses: OTLOSS,
            points: POINTS,
            regular_ot_wins: R_OT_WINS,
            point_percentage: POINTS_PCT,
            goals_for: GF,
            goals_against: GA,
            shootout_wins: SOWINS,
            goals_avg: GF_PER_GAME,
            goals_against_avg: GA_PER_GAME,
            powerplay: PP,
            penaltykill: PK,
            shotstaken_avg: SHOTS_PER_GAME,
            shotsagainst_avg: SA_PER_GAME,
            faceoff_wins: FACEOFF_WINS
        }
        
        teams.push(teamStanding);
    })
    await instance.exit();
    return teams;
}

(async function() {
    let results = await getTeamStandingsData();
    let teamArray = []
    let comp = compareTeams(results[0], results[30]);
    console.log("Printing comparison. Positive numbers means home team has higher value (except for position in league). Negative numbers, means away team has higher value.");
    for(let r in comp) {
        let d = (r !== "teams") ? `${r} difference: ${comp[`${r}`]}` : `${r}: ${comp[`${r}`]}`
        console.log(d)
    }
})()