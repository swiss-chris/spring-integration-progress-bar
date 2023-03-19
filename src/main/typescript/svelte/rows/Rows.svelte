<script lang="ts">
    import { flip } from "svelte/animate";
    import { subscribe as websocketSubscribe } from "./websocket-message-broker";
    import RowsHeader from "./RowsHeader.svelte";
    import { OnOffTimer } from './timer';
    import { onMount, onDestroy } from 'svelte';
    import { RowsPresenter } from '../../presentation/rows-presenter';
    import { FlowProgressContainer } from '../../usecase/flow/flow-progress-container';
    import type { RowPresentation } from '../../presentation/row-presentation';
    import Row from './Row.svelte';

    const flowProgressContainer = new FlowProgressContainer();
    const rowsPresenter = new RowsPresenter();

    let timer: OnOffTimer;
    let websocketUnsubscribe;
    let sortedRows: RowPresentation[] = [];

    onMount(() => {
        timer = new OnOffTimer(timerBasedUpdate);
        websocketUnsubscribe = websocketSubscribe((data) => {
            if (!data) return; // FIXME see if we can prevent this check

            const {start, flowId, percentPerSecond, percent} = JSON.parse(data);

            if (!flowProgressContainer.contains(flowId)) {
                // TODO try to unit test all timer on/off logic in isolation
                timer.keepActive();
            }

            const flows = flowProgressContainer.updatePercent(flowId, new Date(parseInt(start)), percent, new Date(), percentPerSecond);
            sortedRows = rowsPresenter.toSortedRows(flows);

            if (flowProgressContainer.allFinished()) {
                timer.deactivate();
            }
        })
    });

    onDestroy(() => {
        websocketUnsubscribe();
        timer.deactivate();
    });

    function timerBasedUpdate() {
        console.log("timer tick received")
        const flowProgressList = flowProgressContainer.updateTime(new Date());
        sortedRows = rowsPresenter.toSortedRows(flowProgressList);
    }
</script>

<RowsHeader/>

{#each [...sortedRows] as row (row.flowId)}
    <div animate:flip>
        <Row {...row}/>
    </div>
{/each}
