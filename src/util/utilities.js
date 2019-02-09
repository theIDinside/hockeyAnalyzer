const Constants = require('./constants');
const l = msg => console.log(msg);
const getGameURL = (date) => {
    if(date !== String)
        date = date.toISOString().split("T")[0];
    return `https://www.nhl.com/scores/${date}`;
};
const Int = (istr) => Number.parseInt(istr);
const Float = (fstr) => Number.parseFloat(fstr);

const dateString = (date) => {
    let res = date.toLocaleDateString();
    let restmp = res.split("-");
    let y = Number.parseInt(restmp[0]);
    let mNum = Number.parseInt(restmp[1]);
    let dNum = Number.parseInt(restmp[2]);
    return `${y}-${(mNum < 10) ? `0${mNum}` : mNum}-${(dNum < 10) ? `0${dNum}` : dNum}`
};
const dateStringify = (date) => dateString(date);

const removePrefixOf = (str, len) => {
    try {
        if(str.length < len) {
            throw Error("Prefix length is longer than actual string");
        }
        return str.split("").splice(str.length-4, 4).join("");
    } catch(err) {
        return str;
    }
};

const type = (obj) => {
    let [def, name, ..._] = obj.constructor.toString();
    if(def === "class") {
        return name;
    } else if(def === "function") {
        return name;
    }
};

function dumpErrorStackTrace(err) {
    let e = new Error("Fuck");
    if(err) {
        console.log(`\nError Message: ${err.message}`);
        console.log(`Stack: ${err.stack}`)
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
    removePrefixOf,
    dateString
};

