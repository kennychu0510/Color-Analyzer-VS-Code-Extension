<script lang="ts">
  export let color: string = '';

  function onClick() {
    tsvscode.postMessage({ type: 'copyColor', value: color });
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="color" style="background-color: {color};" on:click={onClick}></div>

<style>
  .color {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    border-radius: 100%;
  }

  .color:hover {
    cursor: pointer;
  }
</style>
