import {Duration} from './duration';

export class Time {
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

    toString() {
        return new Intl.DateTimeFormat('de-CH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Europe/Zurich',
            hour12: false,
        }).format(new Date(this.millis));
    }
}
