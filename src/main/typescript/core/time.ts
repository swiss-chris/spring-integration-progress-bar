import { Duration } from './duration';
import type { Formattable } from './formattable.interface';

export class Time implements Formattable<Date> {
    private readonly millis: number;

    constructor(millis: number) {
        this.millis = millis;
    }

    static now(): Time {
        return new Time(Date.now());
    }

    public static localTimeFormatter = (date: Date): string => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // local timezone
            hour12: false
        }).format(date);
    }

    plus(duration: Duration): Time {
        return new Time(this.millis + duration['millis']); // we would need a C++-style 'friend' class
    }

    differenceTo(time: Time): Duration {
        return new Duration(Math.abs(time.millis - this.millis));
    }

    date(): Date {
        return new Date(this.millis);
    }

    format(callback: (date: Date) => string): string {
        return callback(new Date(this.millis));
    }

    // TODO unit test
    toString(){
        return this.format(Time.localTimeFormatter);
    }

    equals(other: Time) {
        return this.millis == other.millis;
    }
}
