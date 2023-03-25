<script lang="ts">
    import Form from "./form/Form.svelte";
    import Rows from "./rows/Rows.svelte";
    import Title from "./Title.svelte";
    import { DarkModeSwitcher } from "main-typescript/presentation";

    DarkModeSwitcher.initialize();
</script>

<main>
    <Title/>
    <Form/>
    <Rows/>
</main>
