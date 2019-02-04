const gs = require('./scrape/gameScraper');
const st = require('./scrape/seasonTable');
const GameStats = require('./scrape/GameStats');
const {anyOf, daysFrom} = require('./utilities');
const l = (msg) => console.log(msg);
const setup = require('./setup')
const {seasonStart} = require('./constants')
const puppeteer = require('puppeteer');

async function testScrapeDucksVsJets() {
    let teamStats = `https://www.nhl.com/gamecenter/ana-vs-wpg/2019/02/02/2018020797#game=2018020797,game_state=final,game_tab=stats`
    let gameSummary = `http://www.nhl.com/scores/htmlreports/20182019/GS020797.HTM`
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(teamStats, {waitUntil: "networkidle2"});
    const _ = page.evaluate(() => {});
    const htmlData = await page.content();
    l(`Requesting data from: ${teamStats}... Please wait`);
    browser.close();

    GameStats.scrapeTeamsTotals(htmlData).then(res => {
        for(let team of res) {
            l(team.toString);
        }
    })
    l("Scraping player totals");
    GameStats.scrapePlayerTotals(htmlData).then(res => {
        l("Scraped player totals...");
    })
}

async function testScrapeShotsANAvsWPG() {
    let teamStats = `https://www.nhl.com/gamecenter/ana-vs-wpg/2019/02/02/2018020797#game=2018020797,game_state=final,game_tab=stats`
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(teamStats, {waitUntil: "networkidle2"});
    const _ = page.evaluate(() => {});
    const htmlData = await page.content();
    l(`Requesting data from: ${teamStats}... Please wait`);
    browser.close();
    await GameStats.scrapeShotsOnGoal(htmlData);
}

async function testGetTeamStandings() {
    l("Running test for getting team standing data...");
    st.getTeamStandingsData().then(standings => {
        l("NHL Table")
        for(let t of standings) {
            l(t.getRawData());
        }
    }).catch(err => {
        l(err)
    });
}

async function testGetIDsFor20Days() {
    l("Running test for getting game ids spanning 20 days...");
    let b = new Date(seasonStart);
    let e = daysFrom(b, 20);

    setup.getGameIDRange(b, e).then(results => {
        l(`Printing ${results.length} game ids between ${b.toISOString().split("T")[0]} and ${e.toISOString().split("T")[0]}`)
        l(results.map((e, i) => (i % 10 === 0) ? e.toString() + '\n' : e.toString()).join(", "));
    }).catch(err => {
        l(err);
    })
}

async function testScrapeSummaryReport() {
    l("Running test for scraping a game summary report...");
    let exampleSummaryURL = "http://www.nhl.com/scores/htmlreports/20182019/GS020687.HTM"; // New Jersey Devils vs Philadelphia Flyers
    l(`Summary URL: ${exampleSummaryURL}`);
    gs.scrapeGameSummaryReport(exampleSummaryURL).then(summary => {
        l("Summary fetched and processed! Printing: ");
        summary.printScoringSummary();
    }).catch(err => {
        l(err);
    });
}

(async function() {
    let today = new Date().toISOString().split("T")[0]
    l(`Today's date: ${today}. Tomorrow: ${daysFrom(today, 1).toISOString().split("T")[0]}`);
    // await testScrapeSummaryReport();
    // await testGetTeamStandings();
    // await testGetIDsFor20Days();
    // await testScrapeShotsANAvsWPG();
    await testScrapeDucksVsJets();
})();