<script lang="ts">
    import { flip } from "svelte/animate";
    import { Progress } from "../../typescript/rows/progress";
    import { subscribe as websocketSubscribe } from "./websocket-message-broker";
    import Row from "./Row.svelte";
    import RowsHeader from "./RowsHeader.svelte";
    import { OnOffTimer } from '../../typescript/rows/timer';
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
            // FIXME see if we can prevent this check
            if (!data) return;

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
            rows = rows.sort((rowA, rowB) => {
                const {progress: progressA} = rowA;
                const {progress: progressB} = rowB;
                const result = progressA
                    .percent()
                    .compare(progressB.percent());
                return result ?? rows.indexOf(rowA) - rows.indexOf(rowB); // preserve the original order if the result is 0
            });

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
            progress: row.progress.updateTime(now)
        }));
    }
</script>

<RowsHeader/>

{#each [...rows] as {flowId, percentPerSecond, progress} (flowId)}
    <div animate:flip>
        <Row {percentPerSecond} {progress}/>
    </div>
{/each}
