const C = require('cheerio')
const rp = require('request-promise');
const phantom = require('phantom');
const l = msg => console.log(msg);

const seasonStart = '2018-10-03'
const today = new Date().toLocaleDateString()
const gameCenterButtonClass = `li.g5-component--nhl-scores__buttons-item`

/// This function, retrieves from the site, the games for the coming 6 days (including the provided date in the argument. This is I guess somehow, what the site prefetches or something.)
async function getGameNumbersAtDate(date) {
    let gamesDateURL = `https://www.nhl.com/scores/${date}`;
    let gameCardClass = "g5-component--nhl-scores__game-wrapper"
    const pInstance = await phantom.create();
    const page = await pInstance.createPage();
    await page.on('onResourceRequested', function(requestData) {});
    l(`Requesting data from: ${gamesDateURL}... Please wait`);
    const status = await page.open(gamesDateURL)
    const content = await page.property('content')
    let navData = C.load(content);
    let gameList = navData(`div.${gameCardClass}`).each((index, element) => {
        let gameNumber = navData(element).children().first().attr('id');
        console.log(gameNumber);
    })

    await pInstance.exit()
    return "someDataGoesHere";
}

function getGamePageURL(gameNumber) {
    return `https://www.nhl.com/gamecenter/201802${gameNumber}`
}

function getGameTeamStats(home, away, date, gameID) {
    let fmtDate = date.split("-")
    let y = fmtDate[0] 
    let m = fmtDate[1] 
    let d = fmtDate[2] 
    // OBS OBS OBS NB NB NB! In NHL, different from SHL or how european standard define home and away, is different. So SHL, it would look like: Home vs Away. In NHL it's Away vs Home
    return `https://www.nhl.com/gamecenter/${away}-vs-${home}/${y}/${m}/${d}/${gameID}#game=${gameID},game_state=final,game_tab=stats`
}

module.exports.getGameNumbersAtDate = getGameNumbersAtDate;
module.exports.gameDateUrl = gameDateUrl;
module.exports.seasonStart = seasonStart;