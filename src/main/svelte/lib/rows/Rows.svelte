<script lang="ts">
    import { flip } from "svelte/animate";
    import {
        websocketMessages,
        OnOffTimer,
        FlowProgressContainer,
        initializeWebsocketConnector
    } from "main-typescript/usecase";
    import RowsHeader from "./RowsHeader.svelte";
    import { onMount, onDestroy } from 'svelte';
    import { RowsPresenter } from 'main-typescript/presentation';
    import type { RowPresentation } from 'main-typescript/presentation/';
    import Row from './Row.svelte';
    import { Subscription } from 'rxjs';

    const flowProgressContainer = new FlowProgressContainer();
    const rowsPresenter = new RowsPresenter();

    let timer: OnOffTimer;
    let subscription: Subscription;
    let sortedRows: RowPresentation[] = [];

    onMount(() => {
        initializeWebsocketConnector().reconnect();
        timer = new OnOffTimer(timerBasedUpdate);
        subscription = websocketMessages.subscribe(data => websocketMessageReceived(data));
    });

    onDestroy(() => {
        timer.deactivate();
        subscription.unsubscribe();
    });

    // TODO try to extract all business logic from this file
    function timerBasedUpdate() {
        console.log("timer tick received")
        const flowProgressList = flowProgressContainer.updateTime(new Date());
        sortedRows = rowsPresenter.toSortedRows(flowProgressList);
    }

    function websocketMessageReceived(data) {
        const {flowId, start, percent, percentPerSecond} = JSON.parse(data);
        const flows = flowProgressContainer.updatePercent(flowId, new Date(parseInt(start)), percent, new Date(), percentPerSecond);
        sortedRows = rowsPresenter.toSortedRows(flows);
        resetTimer();
    }

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
