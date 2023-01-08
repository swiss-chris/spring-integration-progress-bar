export class Percent implements Formattable<number> {
    static ZERO_PERCENT = new Percent(0);
    static ONE_HUNDRED_PERCENT = new Percent(100);

    private readonly percent

    constructor(percent: number) {
        if (percent < 0 || percent > 100) {
            throw new Error('the parameter "percent" must be between 0 and 100');
        }
        this.percent = percent;
    }

    equals(other: Percent) {
        return this.percent === other.percent;
    }

    isZero() {
        return this.equals(Percent.ZERO_PERCENT);
    }

    isOneHundred() {
        return this.equals(Percent.ONE_HUNDRED_PERCENT);
    }

    remaining() {
        return Percent.ONE_HUNDRED_PERCENT.minus(this);
    }

    minus(other: Percent) {
        return new Percent(this.percent - other.percent);
    }

    divideBy(percent: Percent) {
        return this.percent / percent.percent;
    }

    format(callback: (percent: number) => string) {
        return callback(this.percent);
    }
}
