const Penalties = ["Elbowing", "Tripping", "Fighting (maj)", "Cross checking", "PS-Hooking on breakaway", "Hooking", "Interference", "Kneeing", "Unsportsmanlike conduct"]
const PenaltyMIN = [2, 2, 5, 2, 0, 2, 2, 2, 2]
function Penalty(team, number, period, time, player, minutes, penaltyType, isMinor=true) {
    this.team = team;
    this.number = number;
    this.period = period;
    this.time = time;
    this.player = player;
    this.minutes = minutes;
    this.penaltyType = penaltyType;
    this.minor = isMinor;
    this.isMinor = () => {
        return this.minor;
    }
}