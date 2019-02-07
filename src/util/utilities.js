const Constants = require('./constants')
const dateStringify = (date) => date.toISOString().split("T")[0];
const l = msg => console.log(msg);
const getGameURL = (date) => {
    if(date !== String)
        date = date.toISOString().split("T")[0];
    return `https://www.nhl.com/scores/${date}`;
};
const Int = (istr) => Number.parseInt(istr);
const Float = (fstr) => Number.parseFloat(fstr);

const removePrefixOf = (str, len) => {
    try {
        if(str.length < len) {
            throw Error("Prefix length is longer than actual string");
        }
        return str.split("").splice(str.length-4, 4).join("");
    } catch(err) {
        return str;
    }
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
    getGameURL,
    Int,
    Float,
    removePrefixOf
};

const type = (obj) => {
    let [def, name, ..._] = obj.constructor.toString();
    if(def === "class") {
        return name;
    } else if(def === "function") {
        return name;
    }
}