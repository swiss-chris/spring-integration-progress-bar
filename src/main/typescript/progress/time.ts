import {Duration} from './duration';

export class Time implements Formattable<Date> {
    private readonly millis: number;

    constructor(millis: number) {
        this.millis = millis;
    }

    static now() {
        return new Time(Date.now());
    }

    plus(duration: Duration) {
        return new Time(this.millis + duration['millis']); // we would need a C++-style 'friend' class
    }

    differenceTo(time: Time) {
        return new Duration(Math.abs(time.millis - this.millis));
    }

    date() {
        return new Date(this.millis);
    }

    format(callback: (date: Date) => string) {
        return callback(new Date(this.millis));
    }
}
