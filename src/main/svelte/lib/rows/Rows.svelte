<script lang="ts">
    import { flip } from "svelte/animate";
    import { initializeWebsocketConnector } from "main-typescript/usecase";
    import RowsHeader from "./RowsHeader.svelte";
    import { OnOffTimer } from 'main-typescript/usecase';
    import { onMount, onDestroy } from 'svelte';
    import { RowsPresenter } from 'main-typescript/presentation';
    import { FlowProgressContainer } from 'main-typescript/usecase';
    import type { RowPresentation } from 'main-typescript/presentation/';
    import Row from './Row.svelte';

    const flowProgressContainer = new FlowProgressContainer();
    const rowsPresenter = new RowsPresenter();

    let timer: OnOffTimer;
    let subscription;
    let sortedRows: RowPresentation[] = [];

    onMount(() => {
        timer = new OnOffTimer(timerBasedUpdate);
        initializeWebsocketConnector().websocketMessages.subscribe(data => {
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
        subscription.unsubscribe();
        timer.deactivate();
    });

    function timerBasedUpdate() {
        console.log("timer tick received")
        const flowProgressList = flowProgressContainer.updateTime(new Date());
        sortedRows = rowsPresenter.toSortedRows(flowProgressList);
    }
</script>

<RowsHeader/>

{#each [...sortedRows] as {flowId, ...rest} (flowId)}
    <div animate:flip>
        <Row {...rest}/>
    </div>
{/each}
