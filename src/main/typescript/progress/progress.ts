import {Percent} from './percent';
import {Duration} from './duration';
import {Time} from './time';

export class Progress {
    private constructor(private _start: Time, private _now: Time, private _percent: Percent, private _lastUpdate: Time) {}

    static create(start: Date, now: Date, percent: number) {
        return new Progress(new Time(start.getTime()), new Time(now.getTime()), new Percent(percent), new Time(now.getTime()))
    }

    updateTime(now: Date) {
        return new Progress(this._start, new Time(now.getTime()), this._percent, this._lastUpdate)
    }

    updatePercent(now: Date, percent: number) {
        return new Progress(this._start, new Time(now.getTime()), new Percent(percent), new Time(now.getTime()))
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

    lastUpdate(): Time {
        return this._lastUpdate;
    }

    private elapsed(): Duration {
        return this._start.differenceTo(this._now);
    }
}
