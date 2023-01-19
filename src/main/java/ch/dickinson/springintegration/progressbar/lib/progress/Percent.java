package ch.dickinson.springintegration.progressbar.lib.progress;

import java.util.Objects;

public class Percent {
    private final Float percent;

    public Percent(Integer percent) {
        this((float) percent);
    }

    public Percent(Float percent) {
        if (percent < 0 || percent > 100) {
            throw new IllegalArgumentException("Percent must be in the range [0..100]");
        }
        this.percent = percent;
    }

    @Override
    public String toString() {
        return this.percent.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        final Percent percent1 = (Percent) o;
        return percent.equals(percent1.percent);
    }

    @Override
    public int hashCode() {
        return Objects.hash(percent);
    }
}
