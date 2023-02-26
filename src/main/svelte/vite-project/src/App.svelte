<script lang="ts">
  import Form from "./lib/form/Form.svelte";
  import ProgressRows from "./lib/form/rows/ProgressRows.svelte";
  import { DarkModeSwitcher } from "./typescript/dark-mode";

  DarkModeSwitcher.initialize();
</script>

<main>
  <div id="root" class="container">
    <div class="row mt-4">
      <div class="col-12">
        <h3>Spring Integration Progress Bar</h3>
      </div>
    </div>

    <Form />

    <ProgressRows />
  </div>
</main>

<style>
</style>
