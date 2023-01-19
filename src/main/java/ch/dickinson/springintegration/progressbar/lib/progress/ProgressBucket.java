package ch.dickinson.springintegration.progressbar.lib.progress;

import java.util.ArrayList;
import java.util.List;

public class ProgressBucket {
    private final List<ProgressBucket> parts = new ArrayList<>();
    private Boolean isFinished = false;
    private final String id;

    public ProgressBucket() {
        this(List.of());
    }

    public ProgressBucket(String id) {
        this(id, List.of());
    }

    public ProgressBucket(List<ProgressBucket> parts) {
        this(null, parts);
    }

    public ProgressBucket(String id, List<ProgressBucket> parts) {
        this.id = id;
        this.parts.addAll(parts);
    }

    void setIsFinished() {
        this.isFinished = true;
    }

    Percent getPercentComplete() {
        return new Fraction(this.getNbPartsFinished(), this.getNbParts()).asPercent();
    }

    private Integer getNbParts() {
        return (this.parts.isEmpty())
                ? 1 :
                getNbSubParts();
    }

    // TODO create 2 subclasses, one with parts and one without parts, to simplify the logic and prevent bugs
    private Integer getNbPartsFinished() {
        return this.isFinished
                ? this.parts.isEmpty() ? 1 : getNbSubParts()
                : this.parts.isEmpty() ? 0 : getNbSubPartsFinished();
    }

    private int getNbSubParts() {
        return this.parts.stream()
                .mapToInt(ProgressBucket::getNbParts)
                .sum();
    }

    private int getNbSubPartsFinished() {
        return this.parts.stream()
                .mapToInt(ProgressBucket::getNbPartsFinished)
                .sum();
    }
}
