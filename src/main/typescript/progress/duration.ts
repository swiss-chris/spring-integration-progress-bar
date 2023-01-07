export class Duration {
    private readonly millis: number;

    constructor(millis: number) {
        if (millis < 0) {
            throw new Error('the parameter "millis" must be >= 0');
        }
        this.millis = millis;
    }

    times(factor: number) {
        return new Duration(this.millis * factor);
    }

    toString() {
        const s = Math.floor(this.millis / 1000);
        return [
            this.format(s / 60 / 60),
            this.format(s / 60 % 60),
            this.format(s % 60)
        ].join(':');
    }

    private format(n: number) {
        return Math.floor(n).toString().padStart(2, '0')
    }
}
