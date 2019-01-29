const gs = require('./scrape/gameScraper');
const st = require('./scrape/seasonTable');
const {anyOf, daysFrom} = require('./utilities');
const l = (msg) => console.log(msg);
(async function() {
    let today = new Date().toISOString().split("T")[0]
    console.log(`Today's date: ${today}`);
    l(`Tomorrows date: ${daysFrom(today, 1).toISOString().split("T")[0]}`)
    gs.getGameNumbersAtDate(new Date())
})()