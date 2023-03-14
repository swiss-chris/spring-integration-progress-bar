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

    plus(duration: Duration): Time {
        return new Time(this.millis + duration['millis']); // we would need a C++-style 'friend' class
    }

    differenceTo(time: Time): Duration {
        return new Duration(Math.abs(time.millis - this.millis));
    }

    date(): Date {
        return new Date(this.millis);
    }

    toString(callback: (date: Date) => string = localTimeFormatter): string {
        return callback(new Date(this.millis));
    }

    equals(other: Time) {
        return this.millis == other.millis;
    }
}

export const localTimeFormatter = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // local timezone
        hour12: false
    }).format(date);
}
