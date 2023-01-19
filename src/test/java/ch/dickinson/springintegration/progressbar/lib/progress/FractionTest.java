package ch.dickinson.springintegration.progressbar.lib.progress;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class FractionTest {

    @Test
    void constructor() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> new Fraction(1, 0));
    }

    @Test
    void asPercent() {
        Assertions.assertEquals(new Fraction(1, 4).asPercent(), new Percent(25));
    }
}
