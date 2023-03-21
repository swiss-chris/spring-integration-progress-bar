import { Percent, Duration, Time } from '../../core';

export class Progress {
    private constructor(private _start: Time, private _now: Time, private _percent: Percent, private _lastUpdate: Time) {}

    static create(start: Date, now: Date, percent: number, lastUpdate?: Date) {
        return new Progress(new Time(start.getTime()), new Time(now.getTime()), new Percent(percent), new Time(lastUpdate?.getTime() ?? now.getTime()))
    }

    updateTime(now: Date) {
        return new Progress(this._start, new Time(now.getTime()), this._percent, this._lastUpdate)
    }

    updatePercent(now: Date, percent: number) {
        return new Progress(this._start, new Time(now.getTime()), new Percent(percent), new Time(now.getTime()))
    }

    get isFinished() {
        return this._percent.isOneHundred();
    }

    get start(): Time {
        return this._start;
    }

    get percent(): Percent {
        return this._percent;
    }

    get duration(): Duration {
        return this.isFinished ? this.start.differenceTo(this._lastUpdate) : this.elapsed();
    }

    get timeSinceLastUpdate(): Duration {
        return this._lastUpdate.differenceTo(this._now);
    }

    get remaining(): Duration | undefined {
        return this.isFinished ? new Duration(0) : this.end?.differenceTo(this._now);
    }

    get end(): Time | undefined {
        return this.remainingSinceLastUpdate()?.addTo(this._lastUpdate);
    }

    equals(other: Progress): boolean {
        return this._start.equals(other._start)
            && this._now.equals(other._now)
            && this._lastUpdate.equals(other._lastUpdate)
            && this._percent.equals(other._percent);
    }

    private remainingSinceLastUpdate(): Duration | undefined {
        return this._percent.isZero()
            ? undefined
            : this.elapsedToLastUpdate().times(this._percent.remaining().divideBy(this._percent));
    }
    private elapsed(): Duration {
        return this._start.differenceTo(this._now);
    }

    private elapsedToLastUpdate(): Duration {
        return this._start.differenceTo(this._lastUpdate);
    }
}
