package ch.dickinson.springintegration.progressbar.lib.progress;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

class ProgressBucketTest {

    public static ProgressBucket PART_1;
    public static ProgressBucket PART_2;
    public static ProgressBucket PART_3_1;
    public static ProgressBucket PART_3_2;
    public static ProgressBucket PART_3;
    ProgressBucket example;

    @BeforeEach
    void setUp() {
        PART_3_1 = new ProgressBucket();
        PART_3_2 = new ProgressBucket();
        PART_1 = new ProgressBucket("part-1");
        PART_2 = new ProgressBucket("part-2");
        PART_3 = new ProgressBucket("part-3", List.of(
                PART_3_1,
                PART_3_2
        ));
        example = new ProgressBucket(List.of(
                PART_1,
                PART_2,
                PART_3
        ));
    }

    @Test
    void noProgress() {
        Assertions.assertThat(example.getPercentComplete()).isEqualTo(new Percent(0));
    }

    @Test
    void someProgress() {
        PART_1.setIsFinished();
        Assertions.assertThat(example.getPercentComplete()).isEqualTo(new Percent(25));
    }

    @Test
    void halfProgress() {
        PART_1.setIsFinished();
        PART_3_1.setIsFinished();
        Assertions.assertThat(example.getPercentComplete()).isEqualTo(new Percent(50));
    }

    @Test
    void muchProgress_1() {
        PART_1.setIsFinished();
        PART_3_1.setIsFinished();
        PART_3_2.setIsFinished();
        Assertions.assertThat(example.getPercentComplete()).isEqualTo(new Percent(75));
    }

    @Test
    void muchProgress_2() {
        PART_1.setIsFinished();
        PART_2.setIsFinished();
        PART_3_1.setIsFinished();
        Assertions.assertThat(example.getPercentComplete()).isEqualTo(new Percent(75));
    }

    @Test
    void finished_1() {
        PART_1.setIsFinished();
        PART_2.setIsFinished();
        PART_3_1.setIsFinished();
        PART_3_2.setIsFinished();
        Assertions.assertThat(example.getPercentComplete()).isEqualTo(new Percent(100));
    }

    @Test
    void finished_2() {
        PART_1.setIsFinished();
        PART_2.setIsFinished();
        PART_3.setIsFinished();
        Assertions.assertThat(example.getPercentComplete()).isEqualTo(new Percent(100));
    }

    @Test
    void finished_3() {
        example.setIsFinished();
        Assertions.assertThat(example.getPercentComplete()).isEqualTo(new Percent(100));
    }
}
