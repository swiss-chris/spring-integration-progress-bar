import type { Formattable } from './formattable.interface';

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

    compare(other: Percent): number {
        const diff = this.percent - other.percent;
        return diff > 0 ? 1
            : diff < 0 ? -1
                : 0;
    }

    toString(callback: (percent: number) => string = percent => `${percent}%`) {
        return callback(this.percent);
    }
}
