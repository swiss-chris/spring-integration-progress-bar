package ch.dickinson.springintegration.progressbar.lib.progress;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class PercentTest {
    @Test
    void construction() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> new Percent(-0.01f));
        Assertions.assertDoesNotThrow(() -> new Percent(-0));
        Assertions.assertDoesNotThrow(() -> new Percent(100));
        Assertions.assertThrows(IllegalArgumentException.class, () -> new Percent(100.01f));
    }

    @Test
    void equals() {
        Assertions.assertEquals(new Percent(0), new Percent(0));
        Assertions.assertEquals(new Percent(20.1f), new Percent(20.1f));
    }
}
