<script lang="ts">
  import Form from "./form/Form.svelte";
  import Rows from "./rows/Rows.svelte";
  import Title from "./Title.svelte";
  import { DarkModeSwitcher } from "spring-integration-progress-bar-main-typescript/util/dark-mode";

  DarkModeSwitcher.initialize();
</script>

<main>
  <div class="container">
    <Title />
    <Form />
    <Rows />
  </div>
</main>
