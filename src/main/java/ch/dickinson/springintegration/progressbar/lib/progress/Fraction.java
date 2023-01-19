package ch.dickinson.springintegration.progressbar.lib.progress;

public class Fraction {

    private final Integer numerator;
    private final Integer denominator;

    public Fraction(Integer numerator, Integer denominator) {
        if (denominator == 0) {
            throw new IllegalArgumentException("denominator may not be 0.");
        }
        this.numerator = numerator;
        this.denominator = denominator;
    }

    public Percent asPercent() {
        float fraction = (float) numerator / denominator;
        return new Percent(100 * fraction);
    }
}
