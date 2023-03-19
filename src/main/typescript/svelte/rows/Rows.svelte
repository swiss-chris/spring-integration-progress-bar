<script lang="ts">
    import { flip } from "svelte/animate";
    import { Progress } from "../../usecase/progress";
    import { subscribe as websocketSubscribe } from "./websocket-message-broker";
    import SvelteRow from "./Row.svelte";
    import RowsHeader from "./RowsHeader.svelte";
    import { OnOffTimer } from './timer';
    import { onMount, onDestroy } from 'svelte';
    import { RowsPresenter } from '../../presentation/rows-presenter';
    import { FlowProgressContainer } from '../../usecase/flow/flow-progress-container';
    import type { Row } from '../../presentation/row';
    import NewRow from './NewRow.svelte';

    interface IRow {
        flowId: string;
        percentPerSecond: number;
        progress: Progress;
    }

    const rowsPresenter = new RowsPresenter();
    const flowProgressContainer = new FlowProgressContainer();

    let rows: SvelteRow[] = [];
    let timer: OnOffTimer;
    let websocketUnsubscribe;

    let sortedRows: Row[] = [];

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
            rows = rows.sort((rowA, rowB) => rowA.progress.percent
                .compare(rowB.progress.percent));

            if (rows.every(row => row.progress.isFinished)) {
                timer.deactivate();
            }

            // clean architecture
            const flows = flowProgressContainer.updatePercent(flowId, new Date(parseInt(start)), percent, new Date(), percentPerSecond);
            sortedRows = rowsPresenter.toSortedRows(flows);
        })
    });

    onDestroy(() => {
        websocketUnsubscribe();
        timer.deactivate();
    });

    function addOrUpdateRow(rows: SvelteRow[], row: IRow): SvelteRow[] {
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
            progress: row.progress.isFinished ? row.progress : row.progress.updateTime(now)
        }));

        // clean architecture
        const flowProgressList = flowProgressContainer.updateTime(new Date());
        sortedRows = rowsPresenter.toSortedRows(flowProgressList);
    }
</script>

<RowsHeader/>

{#each [...sortedRows] as row (row.flowId)}
    <div animate:flip>
        <NewRow {...row}/>
    </div>
{/each}
