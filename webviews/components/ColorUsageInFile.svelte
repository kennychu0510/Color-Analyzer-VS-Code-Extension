<script lang="ts">
  import ColorIcon from './ColorIcon.svelte';

  export let colorUsed: Map<string, number> = new Map();
  export let doneUpdate = false;

  function onColorClick(color: string) {
    tsvscode.postMessage({ type: 'searchForColor', value: color });
  }
</script>

<div class="container">
  {#if doneUpdate}
    {#each Array.from(colorUsed.keys()) as color}
      <div class="color-item">
        <div class="row">
          <ColorIcon {color} />
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <p on:click={() => onColorClick(color)} class="color-label">
            {color}
          </p>
        </div>
        <p>{colorUsed.get(color)}</p>
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
  .color-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    justify-content: space-between;
  }
  .row {
    display: flex;
    align-items: center;
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
