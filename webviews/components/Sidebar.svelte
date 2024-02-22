<script lang="ts">
  import { onMount } from 'svelte';
  import Reload from './Reload.svelte';

  $: colorUsed = [];

  function reload() {
    // send message to the extension asking for the selected text
    tsvscode.postMessage({ type: 'onFetchColorUsed', value: '' });
  }

  function testing() {
    tsvscode.postMessage({ type: 'testing', value: '' });
  }

  onMount(() => {
    // Listen for messages from the extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case 'onReceiveColorsUsed':
          if (message.value) {
            colorUsed = JSON.parse(message.value);
          }
          break;
      }
    });

    reload();
  });
</script>

<div>
  <div class="headerContainer">
    <h1>Color Used</h1>
    <Reload {reload} />
  </div>
  {#each colorUsed as color}
    <div class="color-item">
      <div style="width: 20px; height: 20px; background-color: {color}; margin-right: 10px;"></div>
      <p>{color}</p>
    </div>
  
  {/each}
</div>

<style>
  .headerContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .color-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
</style>
