<script lang="ts">
  import Form from "./lib/form/Form.svelte";
  import Rows from "./lib/rows/Rows.svelte";
  import Title from "./lib/Title.svelte";
  import { DarkModeSwitcher } from "./typescript/dark-mode";

  DarkModeSwitcher.initialize();
</script>

<main>
  <div class="container">
    <Title />
    <Form />
    <Rows />
  </div>
</main>

<style>
</style>
