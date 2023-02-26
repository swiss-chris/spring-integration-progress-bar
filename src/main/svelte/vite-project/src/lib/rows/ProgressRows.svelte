<script lang="ts">
    import { Percent } from "../../typescript/rows/progress/lib";
    import { messageStore } from "../stores";
    import Row from "./Row.svelte";
    import RowsHeader from "./RowsHeader.svelte";

    interface Flow {
        start: Date;
        flowId: string;
        percentPerSecond: number;
        percent: Percent;
    }

    let rowsMap = new Map<string, Flow>(); // TODO change object to Row

    messageStore.subscribe((data) => {
        if(!data){
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
        rowsMap.set(flowId, flowProgress);
        rowsMap = new Map(rowsMap);
    });
</script>

<RowsHeader />
<div>
    {#each [...rowsMap] as [flowId, flow]}
    <div>
        {flowId} : {flow.percent.format(percent => `${percent}%`)}
    </div>
{/each}
</div>
