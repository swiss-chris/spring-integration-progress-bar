<script lang="ts">
    import { Progress } from "../../typescript/rows/progress";
    import { Percent } from "../../typescript/rows/progress/lib";
    import { messageBroker } from "../stores";
    import Row from "./Row.svelte";
    import RowsHeader from "./RowsHeader.svelte";

    interface Row {
        percentPerSecond: number,
        progress: Progress
    }

    let rowsMap = new Map<string, Row>();

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
        rowsMap.set(
            flowId,
            {
                percentPerSecond,
                progress: Progress.create(new Date(parseInt(start)), new Date(), percent)
            }
        );
        rowsMap = new Map(rowsMap);
    });
</script>

<RowsHeader />

{#each [...rowsMap] as [flowId, {percentPerSecond, progress}] (flowId)}
    <Row {percentPerSecond} {progress} />
{/each}
