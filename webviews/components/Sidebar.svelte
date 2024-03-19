<script lang="ts">
  import { onMount } from 'svelte';
  import ColorUsageInFile from './ColorUsageInFile.svelte';
  import ColorUsageInProject from './ColorUsageInProject.svelte';
  import Reload from './Reload.svelte';

  $: colorUsedInProject = {};
  $: colorUsedInFile = {};

  function reload() {
    // send message to the extension asking for the selected text
    tsvscode.postMessage({ type: 'onFetchColorUsed', value: '' });
  }

  function testing() {
    tsvscode.postMessage({ type: 'testing', value: '' });
  }

  function parseColorUsage(data: { filePath: string; colorUsed: string[] }[]) {
    const colorFilePathMap: { [color: string]: string[] } = {};

    data.forEach((item: any) => {
      item.colorUsed.forEach((color: string) => {
        if (!colorFilePathMap[color]) {
          colorFilePathMap[color] = [];
        }
        colorFilePathMap[color].push(item.filePath);
      });
    });

    return colorFilePathMap;
  }

  onMount(() => {
    // Listen for messages from the extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case 'onReceiveColorsUsedInProject':
          if (message.value) {
            const data = JSON.parse(message.value);
            colorUsedInProject = parseColorUsage(data);
          }
          break;
        case 'onReceiveColorsUsedInFile':
          if (message.value) {
            const data = JSON.parse(message.value);
            console.log({data})
            colorUsedInFile = parseColorUsage(data);
          }
          break;
      }
    });

    reload();
  });
</script>

<div>
  <div class="headerContainer">
    <h1>Color Usage Summary</h1>
    <Reload {reload} />
  </div>
  <ColorUsageInProject title={'Current Project'} colorUsed={colorUsedInProject} />
  <ColorUsageInFile title={'Current File'} colorUsed={colorUsedInFile} />
  <button on:click={testing}>Testing</button>
</div>

<style>
  .headerContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
</style>
