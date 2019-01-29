const shortTeamNames = "ANA BOS ARI BUF CAR CHI CGY CBJ COL DAL EDM NJD NYI NYR MIN PHI DET LAK OTT MTL PIT WSH STL SJS TBL VAN TOR WPG NSH VGK FLA"
const teamKeys = shortTeamNames.split(" ")
let teams = [];
teams["ANA"] = "Anaheim Ducks"
teams["BOS"] = "Boston Bruins" 
teams["ARI"] = "Arizona Coyotes"
teams["BUF"] = "Buffalo Sabres" 
teams["CAR"] = "Carolina Hurricanes"
teams["CHI"] = "Chicago Blackhawks"
teams["CGY"] = "Calgary Flames"
teams["CBJ"] = "Columbus Blue Jackets"
teams["COL"] = "Colorado Avalanche"
teams["DAL"] = "Dallas Stars"
teams["EDM"] = "Edmonton Oilers"
teams["NJD"] = "New Jersey Devils" 
teams["NYI"] = "New York Islanders"
teams["NYR"] = "New York Rangers"
teams["MIN"] = "Minnesota Wild"
teams["PHI"] = "Philadelphia Flyers"
teams["DET"] = "Detroit Red Wings"
teams["LAK"] = "Los Angeles Kings"
teams["OTT"] = "Ottawa Senators"
teams["MTL"] = "Montreal Canadiens"
teams["PIT"] = "Pittsburgh Penguins"
teams["WSH"] = "Washington Capitals"
teams["STL"] = "St. Louis Blues"
teams["SJS"] = "San Jose Sharks"
teams["TBL"] = "Tampa Bay Lightning"
teams["VAN"] = "Vancouver Canucks"
teams["TOR"] = "Toronto Maple Leafs"
teams["WPG"] = "Winnipeg Jets"
teams["VGK"] = "Vegas Golden Knights"
teams["FLA"] = "Florida Panthers"

module.exports = {
    teams: teams,
    teamKeys: teamKeys,
}