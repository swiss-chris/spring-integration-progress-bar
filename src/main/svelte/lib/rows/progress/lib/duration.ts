import type { Time } from './time';

export class Duration implements Formattable<number>{
    private static readonly ONE_SECOND = 1000;
    private readonly millis: number;

    constructor(millis: number) {
        if (millis < 0) {
            throw new Error('the parameter "millis" must be >= 0');
        }
        this.millis = millis;
    }

    static ofSeconds(seconds: number): Duration {
        return new Duration(seconds * this.ONE_SECOND);
    }

    isLessThan(other: Duration): boolean {
        return this.millis < other.millis;
    }

    isGreaterThan(other: Duration): boolean {
        return this.millis > other.millis;
    }

    times(factor: number) {
        return new Duration(this.millis * factor);
    }

    addTo(time: Time) {
        return time.plus(this);
    }

    toString() {
        const format = (n: number) => Math.floor(n).toString().padStart(2, '0');

        const seconds = Math.floor(this.millis / 1000);
        return [
            format(seconds / 60 / 60),
            format(seconds / 60 % 60),
            format(seconds % 60)
        ].join(':');
    }

    format(formatter: (millis: number) => string) {
        return formatter(this.millis);
    }
}
