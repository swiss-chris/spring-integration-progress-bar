<script lang="ts">
    import type { Progress } from "../../typescript/rows/progress";
    import type { Duration, Percent, Time } from "../../typescript/rows/progress/lib";
    
    export let progress: Progress;

    $: percentString = progress.percent().toString();
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
    <div class="col-1 percent-per-second">TODO...</div>
    <div class="col-1 percent">{percentString}</div>
    <div class="col-1 start">{progress.start().toString()}</div>
    <div class="col-1 duration">{progress.duration()}</div>
    <div class="col-1 time-since-last-update">
        {progress.timeSinceLastUpdate()}
    </div>
    <div class="col-1 remaining">{progress.remaining()}</div>
    <div class="col-1 end">{progress.end().toString()}</div>
</div>
