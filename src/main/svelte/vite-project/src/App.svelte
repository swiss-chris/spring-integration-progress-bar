<script lang="ts">
  import { DarkModeSwitcher } from './typescript/dark-mode';
  import { WebsocketConnector } from "./typescript/websocket-connector";
  import { MessageHandler } from "./typescript/rows";
  import { Form } from "./typescript/form";
  import { getBackendUrl } from "./typescript/util/host";

  ////// -------- FORM -------- //////

  window.onload = () => {
    const form = document.querySelector("form");
    form!.onsubmit = (e: Event) => {
      e.preventDefault();
      Form.submit();
    };
  };

  ////// -------- DARK MODE -------- //////

  DarkModeSwitcher.initialize();

  ////// -------- WEB SOCKET -------- //////

  export const websocketConnector = new WebsocketConnector(
    `${getBackendUrl()}/messages`,
    MessageHandler.handleMessage
  ).connect(); // on page refresh, we want to receive already running flows
</script>

<main>
  <div id="root" class="container">
    <div class="row mt-4">
      <div class="col-12">
        <h3>Spring Integration Progress Bar</h3>
      </div>
    </div>
    <form id="startflow">
      <div class="row mt-3">
        <div class="col-3">
          <label for="percent-select" class="form-label"
            >Percent completed per second</label
          >
          <select
            class="form-select form-select-sm"
            name="percentPerSecond"
            id="percent-select"
          >
            <option value="0.01">0.01%</option>
            <option value="0.1">0.1%</option>
            <option value="1">1%</option>
            <option selected value="10">10%</option>
          </select>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-3">
          <button class="btn btn-sm btn-primary mt-3">Start Flow</button>
        </div>
      </div>
    </form>
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
  @media (prefers-color-scheme: dark) {
    .dim {
      color: #444;
    }
  }
  @media (prefers-color-scheme: light) {
    .dim {
      color: lightgray;
    }
  }
</style>
