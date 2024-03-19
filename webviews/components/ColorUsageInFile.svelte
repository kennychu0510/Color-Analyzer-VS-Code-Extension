<script lang="ts">
  export let title: string = 'TITLE';
  export let colorUsed: { [color: string]: string[] } = {};
  export let doneUpdate = false;

  function onColorClick(color: string) {
    tsvscode.postMessage({ type: 'searchForColor', value: color });
  }
</script>

<div class="container">
  <h2 class="title">{title}</h2>
  {#if doneUpdate}
    {#each Object.keys(colorUsed) as color}
      <div class="color-item">
        <div class="color" style="background-color: {color};"></div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <p on:click={() => onColorClick(color)} class="color-label">{color}</p>
      </div>
    {/each}
  {:else}
    <p class="loading">Loading...</p>
  {/if}
</div>

<style>
  .container {
    margin-bottom: 10px;
  }
  .title {
    margin-bottom: 5px;
  }
  .color-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  .color {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    border-radius: 100%;
  }
  .color-label:hover {
    text-decoration: underline;
    cursor: pointer;
    font-weight: bold;
  }
  .loading {
    font-style: italic;
  }
</style>
