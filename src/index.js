const gs = require('./gameScraper');
const st = require('./seasonTable');

(async function() {
    let today = new Date().toISOString().split("T")[0]
    console.log(today);
    gs.getGameNumbersAtDate("2018-10-14")
})()