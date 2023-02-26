<script lang="ts">
    import { flip } from "svelte/animate";
    import { Progress } from "../../typescript/rows/progress";
    import { Percent } from "../../typescript/rows/progress/lib";
    import { messageBroker } from "../stores";
    import Row from "./Row.svelte";
    import RowsHeader from "./RowsHeader.svelte";

    interface Row {
        flowId: string;
        percentPerSecond: number;
        progress: Progress;
    }

    let rows: Row[] = [];

    messageBroker.subscribe((data) => {
        if (!data) {
            // FIXME cleanup
            console.log("empty data received!");
            return;
        }

        const { start, flowId, percentPerSecond, percent } = JSON.parse(data);
        const flowProgress = {
            start,
            flowId,
            percentPerSecond,
            percent: new Percent(percent),
        };
        rows = addOrUpdateRow(rows, {
            flowId,
            percentPerSecond,
            progress: Progress.create(
                new Date(parseInt(start)),
                new Date(),
                percent
            ),
        });
        rows = sort(rows);
    });

    function addOrUpdateRow(rows: Row[], row: Row): Row[] {
        const existingRowIndex = rows.findIndex((r) => r.flowId === row.flowId);
        if (existingRowIndex !== -1) {
            rows[existingRowIndex] = row;
        } else {
            rows.push(row);
        }
        return rows;
    }

    const sort = (rows: Row[]): Row[] =>
        rows.sort((rowA, rowB) => {
            const {progress: progressA} = rowA;
            const {progress: progressB} = rowB;
            const result = progressA
                .percent()
                .compare(progressB.percent());
            return result ?? rows.indexOf(rowA) - rows.indexOf(rowB); // preserve the original order if the result is 0
        });
</script>

<RowsHeader />

{#each [...rows] as {flowId, percentPerSecond, progress} (flowId)}
    <div animate:flip>
        <Row {percentPerSecond} {progress} />
    </div>
{/each}
