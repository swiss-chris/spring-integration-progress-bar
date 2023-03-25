<script lang="ts">
    import { flip } from "svelte/animate";
    import { OnOffTimer, FlowProgressContainer, initializeWebsocketConnector } from "main-typescript/usecase";
    import RowsHeader from "./RowsHeader.svelte";
    import { onMount, onDestroy } from 'svelte';
    import { RowsPresenter } from 'main-typescript/presentation';
    import type { RowPresentation } from 'main-typescript/presentation/';
    import Row from './Row.svelte';
    import { Subscription } from 'rxjs';

    const flowProgressContainer = new FlowProgressContainer();
    const rowsPresenter = new RowsPresenter();

    let timer: OnOffTimer;
    let websocketMessagesSubscription: Subscription;
    let sortedRows: RowPresentation[] = [];

    onMount(() => {
        initializeWebsocketConnector().reconnect();
        // timer = new OnOffTimer(timerTickReceived);
        // websocketMessagesSubscription = websocketMessages.subscribe(websocketMessageReceived);
        rowsPresenter.subscribe((data: RowPresentation[]) => {
            sortedRows = data;
        })
    });

    onDestroy(() => {
        timer.deactivate();
        websocketMessagesSubscription.unsubscribe();
    });

    // TODO try to extract all business logic from this file
    // function timerTickReceived() {
    //     console.log("timer tick received")
    //     const flowProgressList = flowProgressContainer.updateTime(new Date());
    //     sortedRows = rowsPresenter._toSortedRows(flowProgressList);
    // }

    // function websocketMessageReceived(data) {
    //     const {flowId, start, percent, percentPerSecond} = JSON.parse(data);
    //     const flows = flowProgressContainer._updatePercent(flowId, new Date(parseInt(start)), percent, new Date(), percentPerSecond);
    //     sortedRows = rowsPresenter._toSortedRows(flows);
    //     resetTimer();
    // }

    function resetTimer() {
        if (flowProgressContainer.allFinished()) {
            timer.deactivate();
        } else {
            timer.keepActive();
        }
    }
</script>

<RowsHeader/>

{#each [...sortedRows] as {flowId, ...rest} (flowId)}
    <div animate:flip>
        <Row {...rest}/>
    </div>
{/each}
