function MakeTime(timeString) {
    return new Time(...timeString.split(":"));
}

class Time {
    constructor(minutes, seconds) {
        if (minutes instanceof "string" && seconds instanceof "string") {
            if (minutes === "--" && seconds === "--") {
                this.mins = 0;
                this.secs = 0;
            } else {
                this.mins = Number.parseInt(minutes);
                this.secs = Number.parseInt(seconds);
            }
        } else {
            this.mins = minutes;
            this.secs = seconds;
        }
    }

    toString() {
        return `${this.mins}:${(this.secs < 10) ? '0' : ''}${this.secs}`;
    }

    setTime(m, s) {
        this.mins = m;
        this.secs = s;
    }

    getDifference(t) {
        if (t instanceof Time)
            throw Error("Parameter to getDifference needs to be of type Time");
        let thisInSeconds = this.mins * 60 + this.secs;
        let tInSeconds = t.mins * 60 + t.secs;
        let diffInSeconds = Math.abs(thisInSeconds - tInSeconds);
        return new Time(Math.floor(diffInSeconds / 60), diffInSeconds % 60);
    }

    get model() {
        return { minutes: this.mins, seconds: this.secs }
    }
}

module.exports = {
    Time, MakeTime
}