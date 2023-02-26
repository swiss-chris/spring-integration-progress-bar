<script lang="ts">
  import Form from "./lib/form/Form.svelte";
  import ProgressRows from "./lib/rows/ProgressRows.svelte";
  import Title from "./lib/Title.svelte";
  import { DarkModeSwitcher } from "./typescript/dark-mode";

  DarkModeSwitcher.initialize();
</script>

<main>
  <div class="container">
    <Title />
    <Form />
    <ProgressRows />
  </div>
</main>

<style>
</style>
