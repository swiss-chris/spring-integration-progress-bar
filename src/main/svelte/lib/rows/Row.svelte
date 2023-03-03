<script lang="ts">
    import type { Progress } from "./progress";
    import { Duration } from './progress/lib';

    export let percentPerSecond: number;
    export let progress: Progress;

    $: dim = !progress?.isFinished();
    $: isLate = progress?.timeSinceLastUpdate().isGreaterThan(Duration.ofSeconds(12))
    $: isVeryLate = progress?.timeSinceLastUpdate().isGreaterThan(Duration.ofSeconds(60))
    $: percentString = progress?.percent().toString();
</script>

<div class="row mt-4 flow-progress">
    <div class="col-3">
        <div class="progress" style="height: 24px;">
            <div
                class="progress-bar bg-primary"
                role="progressbar"
                style="width: {percentString}"
            >
                {percentString}
            </div>
        </div>
    </div>
    <div class="col-1 percent-per-second">{percentPerSecond}%</div>
    <div class="col-1 percent">{progress.percent().toString()}</div>
    <div class="col-1 start">{progress.start().toString()}</div>
    <div class="col-1 duration">{progress.duration()}</div>
    <div class="col-1 time-since-last-update" class:isLate class:isVeryLate>
        {progress.timeSinceLastUpdate()}
    </div>
    <div class="col-1 remaining">{progress.remaining()}</div>
    <div class="col-1 end" class:dim>
        {progress.end()?.toString()}
    </div>
</div>

<style>
    .isLate {
        color: orange;
    }

    .isVeryLate {
        color: orangered;
    }
</style>
