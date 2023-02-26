<script>
    import { Form } from "../typescript/form";

    let percentages = [0.01, 0.1, 1, 10];

    let selected = 10;

    function handleSubmit() {
        Form.submit(this.selected);
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <div class="row mt-3">
        <div class="col-3">
            <label for="percent-select" class="form-label"
                >Percent completed per second</label
            >
            <select
                class="form-select form-select-sm"
                name="percentPerSecond"
                id="percent-select"
                bind:value={selected}
            >
                {#each percentages as percentage}
                    <option value={percentage}>
                        {percentage}
                    </option>
                {/each}
            </select>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col-3">
            <button class="btn btn-sm btn-primary mt-3" type="submit"
                >Start Flow</button
            >
        </div>
    </div>
</form>

<p>selected question {selected ? selected.id : "[waiting...]"}</p>

<style>
    input {
        display: block;
        width: 500px;
        max-width: 100%;
    }
</style>
