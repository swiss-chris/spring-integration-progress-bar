<script lang="ts">
    export let flowId: string;
    export let percent: string;
    export let percentPerSecond: string;
    export let start: string;
    export let duration: string;
    export let timeSinceLastUpdate: string;
    export let timeSinceLastUpdateColor: string;
    export let remaining: string;
    export let end: string;
    export let endDim: boolean = true;

    $: dim = endDim;
</script>

<div class="row mt-4 flow-progress">
    <div class="col-3">
        <div class="progress" style="height: 24px;">
            <div class="progress-bar bg-primary" role="progressbar" style="width: {percent}">
                {percent}
            </div>
        </div>
    </div>
    <div class="col-1 percent-per-second">{percentPerSecond}</div>
    <div class="col-1 percent">{percent}</div>
    <div class="col-1 start">{start}</div>
    <div class="col-1 duration">{duration}</div>
    <div class="col-1 time-since-last-update" style="color: {timeSinceLastUpdateColor}">{timeSinceLastUpdate}</div>
    <div class="col-1 remaining">{remaining}</div>
    <div class="col-1 end" class:dim>{end}</div>
</div>
