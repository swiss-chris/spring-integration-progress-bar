<script lang="ts">
    import { flip } from "svelte/animate";
    import { Progress } from "../../core/progress";
    import { subscribe as websocketSubscribe } from "./websocket-message-broker";
    import Row from "./Row.svelte";
    import RowsHeader from "./RowsHeader.svelte";
    import { OnOffTimer } from './timer';
    import { onMount, onDestroy } from 'svelte';

    interface Row {
        flowId: string;
        percentPerSecond: number;
        progress: Progress;
    }

    let rows: Row[] = [];
    let timer: OnOffTimer;
    let websocketUnsubscribe;

    onMount(() => {
        timer = new OnOffTimer(timerBasedUpdate);
        websocketUnsubscribe = websocketSubscribe((data) => {
            if (!data) return; // FIXME see if we can prevent this check

            const {start, flowId, percentPerSecond, percent} = JSON.parse(data);
            rows = addOrUpdateRow(rows, {
                flowId,
                percentPerSecond,
                progress: Progress.create(
                    new Date(parseInt(start)),
                    new Date(),
                    percent
                )
            });
            rows = rows.sort((rowA, rowB) => rowA.progress.percent()
                .compare(rowB.progress.percent()));

            if (rows.every(row => row.progress.isFinished())) {
                timer.deactivate();
            }
        })
    });

    onDestroy(() => {
        websocketUnsubscribe();
        timer.deactivate();
    });

    function addOrUpdateRow(rows: Row[], row: Row): Row[] {
        const existingRowIndex = rows.findIndex((r) => r.flowId === row.flowId);
        if (existingRowIndex !== -1) {
            rows[existingRowIndex] = row;
        } else {
            rows.push(row);
            timer.keepActive();
        }
        return rows;
    }

    function timerBasedUpdate() {
        console.log("timer tick received")
        const now = new Date();
        rows = rows.map(row => ({
            ...row,
            progress: row.progress.isFinished() ? row.progress : row.progress.updateTime(now)
        }));
    }
</script>

<RowsHeader/>

{#each [...rows] as {flowId, percentPerSecond, progress} (flowId)}
    <div animate:flip>
        <Row {percentPerSecond} {progress}/>
    </div>
{/each}
