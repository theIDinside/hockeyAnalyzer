const Constants = require('./constants')
const dateStringify = (date) => date.toISOString().split("T")[0];
const l = msg => console.log(msg);
const getGameURL = (date) => {
    if(date !== String)
        date = date.toISOString().split("T")[0];
    return `https://www.nhl.com/scores/${date}`;
}


module.exports = {
    anyOf: (someValue, someValueArray) => {
        for(let i of someValueArray) {
            if(someValue === i)
            return true;
        }
        return false;
    },
    daysFrom: (date, days) => {
        let newDate = new Date(date);
        newDate.setUTCDate(newDate.getUTCDate() + days);
        return newDate;
    },
    getFullTeamName: (key) => {
        return Constants.teams[key.trim()];
    },
    dateStringify: dateStringify,
    l: l,
    log: l,
    getGameURL
}

