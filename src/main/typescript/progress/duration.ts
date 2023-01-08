export class Duration implements Formattable<number>{
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
