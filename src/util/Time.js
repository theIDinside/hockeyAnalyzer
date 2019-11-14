function MakeTime(timeString) {
    return new Time(...timeString.split(":"));
}

/**
 * Time class. For easily saving scraped time data, which usually has the appearance of mm:ss (i.e 12:42 is 12 minutes 42 seconds)
 */
class Time {
    constructor(minutes, seconds) {
        if (Number.isNaN(Number.parseInt(minutes)) && Number.isNaN(Number.parseInt(seconds))) {
            if (minutes === "--" && seconds === "--") {
                this.mins = 0;
                this.secs = 0;
            } else {
                this.mins = Number.parseInt(minutes);
                this.secs = Number.parseInt(seconds);
            }
        } else {
            this.mins = Number.parseInt(minutes);
            this.secs = Number.parseInt(seconds);
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

    /**
     * For use with comparisons of two time points. and since mins and sec can be 0, we make *sure* it's never 0 by
     * adding 1. This basically gives us the ability to "fake" overloading operators in Javascript. Because
     *
     *  Example:
     *      let t = new Time(13, 42, 2);  // 13:42 P2
     *      let ta = new Time(13, 42, 2); // 13:42 P2
     *      let t2 = new Time(17, 13, 3); // 17:13 P3
     *      t < t2 -> true
     *      t2 < t -> false
     * @returns {number}
     */
    valueOf() {
        switch(this.period) {
            case 1:
                return (this.min + 1) * (this.sec + 1);
            case 2:
                return 20 * 60 + (this.min + 1) * (this.sec + 1); // 19*59 is the largest value if within any time of P1, therefore we add that
            case 3:
                return (20*60*2) + (this.min + 1) * (this.sec + 1);
            case 4: // Overtime
                return (20 * 60 * 3) + (this.min + 1) * (this.sec + 1);
            default:
                throw new Error(`Erroneous period value: ${this.period}. It should only be between 1 and 4`);
        }
    }
}

module.exports = {
    Time, MakeTime
};