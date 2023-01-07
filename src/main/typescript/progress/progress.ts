import {Percent} from './percent';
import {Duration} from './duration';
import {Time} from './time';

export class Progress {
    private readonly _start: Time;
    private readonly _now: Time;
    private readonly _percent: Percent;

    constructor(start: Date, now: Date, percent: number) {
        this._start = new Time(start.getTime());
        this._now = new Time(now.getTime());
        this._percent = new Percent(percent);
    }

    isFinished() {
        return this._percent.isOneHundred();
    }

    start(): Time {
        return this._start
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

    end(): Time {
        return this._now.plus(this.remaining()!);
    }

    private elapsed(): Duration {
        return this._start.differenceTo(this._now);
    }
}
