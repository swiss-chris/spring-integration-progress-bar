<script lang="ts">
    import { flip } from "svelte/animate";
    import RowsHeader from "./RowsHeader.svelte";
    import { onMount, onDestroy } from 'svelte';
    import { RowsPresenter } from 'main-typescript/presentation';
    import type { RowPresentation } from 'main-typescript/presentation/';
    import Row from './Row.svelte';
    import { Subscription } from 'rxjs';

    let rowsPresenterSubscription: Subscription;
    let sortedRows: RowPresentation[] = [];

    onMount(() => {
        rowsPresenterSubscription = new RowsPresenter().subscribe((data: RowPresentation[]) => {
            sortedRows = data;
        });
    });

    onDestroy(() => {
        rowsPresenterSubscription.unsubscribe();
    });
</script>

<RowsHeader/>

{#each [...sortedRows] as {flowId, ...rest} (flowId)}
    <div animate:flip>
        <Row {...rest}/>
    </div>
{/each}
