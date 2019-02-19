'use strict';
// Never changing constants. Teams are teams are teams.
const shortTeamNames = "ANA BOS ARI BUF CAR CHI CGY CBJ COL DAL EDM NJD NYI NYR MIN PHI DET LAK OTT MTL PIT WSH STL SJS TBL VAN TOR WPG NSH VGK FLA";
const teamKeys = shortTeamNames.split(" ");
const seasonStart = '2018-10-03';

let teams = [];
teams["ANA"] = teams["DUCKS"] = "Anaheim Ducks";
teams["BOS"] = teams["BRUINS"] = "Boston Bruins";
teams["ARI"] = teams["COYOTES"] = "Arizona Coyotes";
teams["BUF"] = teams["SABRES"] = "Buffalo Sabres";
teams["CAR"] = teams["HURRICANES"]  = "Carolina Hurricanes";
teams["CHI"] = teams["BLACKHAWKS"] = "Chicago Blackhawks";
teams["CGY"] = teams["FLAMES"] = "Calgary Flames";
teams["CBJ"] = teams["BLUE JACKETS"] = "Columbus Blue Jackets";
teams["COL"] = teams["AVALANCHE"] = "Colorado Avalanche";
teams["DAL"] = teams["STARS"] = "Dallas Stars";
teams["EDM"] = teams["OILERS"] = "Edmonton Oilers";
teams["NJD"] = teams["DEVILS"] = teams["N.J"] = "New Jersey Devils"; // for those places where N.J is used instead of NJD
teams["NYI"] = teams["ISLANDERS"] = "New York Islanders";
teams["NYR"] = teams["RANGERS"] = "New York Rangers";
teams["MIN"] = teams["WILD"] = "Minnesota Wild";
teams["PHI"] = teams["FLYERS"] = "Philadelphia Flyers";
teams["DET"] = teams["RED WINGS"] = "Detroit Red Wings";
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
teams["VGK"] = teams["GOLDEN KNIGHTS"] = "Vegas Golden Knights";
teams["FLA"] = teams["PANTHERS"] = "Florida Panthers";
teams["NSH"] = teams["PREDATORS"] = "Nashville Predators";

const getFullTeamName = (abbr) => teams[abbr.toUpperCase()];

module.exports = {
    teams: teams,
    teamKeys: teamKeys,
    seasonStart: seasonStart,
    getFullTeamName: getFullTeamName
};