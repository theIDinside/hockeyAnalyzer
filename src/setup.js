/**
    Setup file. This will scrape the entire NHL season up until today's date, and store all the data inside provided
    MongoDB. Run this once. Running this multiple times, should result in basically clearing the DB and refreshing the DB.
*/
const {seasonStart} = require('./constants')
const Scraper = require('./scrape/gameScraper')
const {getGameURL} = require('./utilities')

function* IDRange(start, end) {
    let i = start;
    while(i < end)
        yield i++;
}
function setupDates() {
    let startDate = new Date(seasonStart);
    let currentDate = new Date();
    return [startDate, currentDate];
}
async function getGameIDRange(start, end) {
    // begin scraping all games between first and last (exclusive).-
    // For example, if we want all games up until today, we dont want to scrape today, since it has most likely not been played yet
    let beginID = Scraper.getGameIDsAtDate(start);
    let endID = Scraper.getGameIDsAtDate(end);

    return Promise.all([beginID, endID]).then(values => {
        let res1 = values[0];
        let res2 = values[1];
        let rangeBegin = 2018020001; // regular season's first game.
        let rangeEnd = Number.parseInt(res2[0]);
        for(let idx of res1) {
            let t = idx.toString();
            if(t[5] !== "2") {
                // the game id does not look like: 201802xxxx, but for example 201801xxxx, this means its not reg season
            } else {
                rangeBegin = Number.parseInt(idx);
                break;
            }
        }
        console.log(`Begin: ${rangeBegin} - End: ${rangeEnd}`)
        let arr = Array.from(IDRange(rangeBegin, rangeEnd));
        for(let id in arr) {
            // 2018020121
            let tmp_str = arr[id].toString();
            if(tmp_str[5] !== '2')
            {
                console.log(`Game with ID ${arr[id]} is not part of the regular season`);
                arr.splice(id, 1);
            }
        }
        return arr;
    })
}

async function setupMongoDB() {
    // create respective databases
    // create collections in databases
}









module.exports = {
    getGameIDRange,
    setupDates,
    IDRange
}