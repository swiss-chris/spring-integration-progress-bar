import {Percent} from './percent';
import {Duration} from './duration';
import {Time} from './time';

export class Progress {
    // TODO swap signatures between constructor and create()
    private constructor(private _start: Time, private _now: Time, private _percent: Percent) {}

    static create(start: Date, now: Date, percent: number) {
        return new Progress(new Time(start.getTime()), new Time(now.getTime()), new Percent(percent))
    }

    updateTime(now: Date) {
        return new Progress(this._start, new Time(now.getTime()), this._percent)
    }

    updatePercent(now: Date, percent: number) {
        return new Progress(this._start, new Time(now.getTime()), new Percent(percent))
    }

    isFinished() {
        return this._percent.isOneHundred();
    }

    start(): Time {
        return this._start;
    }

    percent(): Percent {
        return this._percent;
    }

    duration(): Duration {
        return this.elapsed();
    }

    remaining(): Duration | undefined {
        return this._percent.isZero()
            ? undefined
            : this.elapsed().times(this._percent.remaining().divideBy(this._percent));
    }

    end(): Time | undefined {
        const remaining = this.remaining();
        return remaining ? this._now.plus(remaining) : undefined;
    }

    private elapsed(): Duration {
        return this._start.differenceTo(this._now);
    }
}
