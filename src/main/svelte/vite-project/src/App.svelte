<script lang="ts">
  import Form from "./lib/Form.svelte";
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

    <div class="row mt-4">
      <div class="col-3">
        <div class="label">Progress</div>
      </div>
      <div class="col-1">
        <div class="label">Percent per Second</div>
      </div>
      <div class="col-1">
        <div class="label">Percent</div>
      </div>
      <div class="col-1">
        <div class="label">Start</div>
      </div>
      <div class="col-1">
        <div class="label">Duration</div>
      </div>
      <div class="col-1">
        <div class="label">Time since Last Update</div>
      </div>
      <div class="col-1">
        <div class="label">Remaining</div>
      </div>
      <div class="col-1">
        <div class="label">End</div>
      </div>
    </div>
  </div>
</main>

<style>
</style>
