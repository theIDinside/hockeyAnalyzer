'use strict';
// Never changing constants. Teams are teams are teams.
const shortTeamNames = "ANA BOS ARI BUF CAR CHI CGY CBJ COL DAL EDM NJD NYI NYR MIN PHI DET LAK OTT MTL PIT WSH STL SJS TBL VAN TOR WPG NSH VGK FLA";
const teamKeys = shortTeamNames.split(" ");
const seasonStart = '2018-10-03';
const EASTERN_TIME_DELTA = -4;

const getSeasonStart = (season) => {
    if(season === "18/19")
        return seasonStart;
    else if(season === "19/20") {
        return '2019-10-02';
    } else {
        return seasonStart; // This is the 18/19 season, to test already tried data. This way we can pass "asdasdasdasd" as the param, and it will reliably return something.
    }
}

let teams = [];
teams["ANA"] = teams["DUCKS"] = "Anaheim Ducks";
teams["BOS"] = teams["BRUINS"] = "Boston Bruins";
teams["ARI"] = teams["COYOTES"] = "Arizona Coyotes";
teams["BUF"] = teams["SABRES"] = "Buffalo Sabres";
teams["CAR"] = teams["HURRICANES"]  = "Carolina Hurricanes";
teams["CHI"] = teams["BLACKHAWKS"] = "Chicago Blackhawks";
teams["CGY"] = teams["FLAMES"] = "Calgary Flames";
teams["CBJ"] = teams["BLUE JACKETS"] = teams["JACKETS"] = "Columbus Blue Jackets";
teams["COL"] = teams["AVALANCHE"] = "Colorado Avalanche";
teams["DAL"] = teams["STARS"] = "Dallas Stars";
teams["EDM"] = teams["OILERS"] = "Edmonton Oilers";
teams["NJD"] = teams["DEVILS"] = teams["N.J"] = "New Jersey Devils"; // for those places where N.J is used instead of NJD
teams["NYI"] = teams["ISLANDERS"] = "New York Islanders";
teams["NYR"] = teams["RANGERS"] = "New York Rangers";
teams["MIN"] = teams["WILD"] = "Minnesota Wild";
teams["PHI"] = teams["FLYERS"] = "Philadelphia Flyers";
teams["DET"] = teams["RED WINGS"] = teams["WINGS"] = "Detroit Red Wings";
teams["LAK"] = teams["L.A"] = teams["KINGS"] = "Los Angeles Kings";
teams["OTT"] = teams["SENATORS"] = "Ottawa Senators";
teams["MTL"] = teams["CANADIENS"] = "Montreal Canadiens";
teams["PIT"] = teams["PENGUINS"] = "Pittsburgh Penguins";
teams["WSH"] = teams["CAPITALS"] = "Washington Capitals";
teams["STL"] = teams["BLUES"] = "St. Louis Blues";
teams["SJS"] = teams["S.J"] = teams["SHARKS"] = "San Jose Sharks";
teams["TBL"] = teams["T.B"] = teams["LIGHTNING"] = "Tampa Bay Lightning";
teams["VAN"] = teams["CANUCKS"] = "Vancouver Canucks";
teams["TOR"] = teams["LEAFS"] = teams["MAPLE LEAFS"] = "Toronto Maple Leafs";
teams["WPG"] = teams["JETS"] = "Winnipeg Jets";
teams["VGK"] = teams["GOLDEN KNIGHTS"] = teams["KNIGHTS"] = "Vegas Golden Knights";
teams["FLA"] = teams["PANTHERS"] = "Florida Panthers";
teams["NSH"] = teams["PREDATORS"] = "Nashville Predators";

const getFullTeamName = (abbr) => teams[abbr.toUpperCase()];
function abbreviateName(team) {
    switch(team) {
        case "Anaheim Ducks":
            return "ANA";
        case "Boston Bruins":
            return "BOS";
        case "Arizona Coyotes":
            return "ARI";
        case "Buffalo Sabres":
            return "BUF";
        case "Carolina Hurricanes":
            return "CAR";
        case "Chicago Blackhawks":
            return "CHI";
        case "Calgary Flames":
            return "CGY";
        case "Columbus Blue Jackets":
            return "CBJ";
        case "Colorado Avalanche":
            return "COL";
        case "Dallas Stars":
            return "DAL";
        case "Edmonton Oilers":
            return "EDM";
        case "New Jersey Devils": // for those places where N.J is used instead of NJD
            return "NJD";
        case "New York Islanders":
            return "NYI";
        case "New York Rangers":
            return "NYR";
        case "Minnesota Wild":
            return "MIN";
        case "Philadelphia Flyers":
            return "PHI";
        case "Detroit Red Wings":
            return "DET";
        case "Los Angeles Kings":
            return "LAK";
        case "Ottawa Senators":
            return "OTT";
        case "Montreal Canadiens":
            return "MTL";
        case "Pittsburgh Penguins":
            return "PIT";
        case "Washington Capitals":
            return "WSH";
        case "St. Louis Blues":
            return "STL";
        case "San Jose Sharks":
            return "SJS";
        case "Tampa Bay Lightning":
            return "TBL";
        case "Vancouver Canucks":
            return "VAN";
        case "Toronto Maple Leafs":
            return "TOR";
        case "Winnipeg Jets":
            return "WGP";
        case "Vegas Golden Knights":
            return "VGK";
        case "Florida Panthers":
            return "FLA";
        case "Nashville Predators":
            return "NSH";
    }
}
module.exports = {
    teams: teams,
    teamKeys: teamKeys,
    seasonStart: seasonStart,
    getFullTeamName: getFullTeamName,
    getSeasonStart: getSeasonStart
};