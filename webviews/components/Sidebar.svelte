<script lang="ts">
  import { onMount } from 'svelte';
  import ColorUsageInFile from './ColorUsageInFile.svelte';
  import ColorUsageInProject from './ColorUsageInProject.svelte';
  import Reload from './Reload.svelte';

  $: colorUsedInProject = {};
  $: status = {
    colorUsedInProject: false,
    colorUsedInFile: false,
  }
  $: colorUsedInFile = new Map();
  $: projectDir = '';

  function reload() {
    // send message to the extension asking for the selected text
    status = {
      colorUsedInProject: false,
      colorUsedInFile: false,
    }
    tsvscode.postMessage({ type: 'onFetchColorUsed', value: '' });
  }

  function testing() {
    tsvscode.postMessage({ type: 'testing', value: '' });
  }

  function parseColorUsageForProject(data: { filePath: string; colorUsed: string[] }[]) {
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
            colorUsedInProject = parseColorUsageForProject(data.colorUsed);
            projectDir = data.projectDir;
            status = {
              ...status,
              colorUsedInProject: true,
            }
          }
          break;
        case 'onReceiveColorsUsedInFile':
          if (message.value) {
            const data = JSON.parse(message.value);
            colorUsedInFile = new Map(data.colorUsage);
            status = {
              ...status,
              colorUsedInFile: true,
            }
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
  <ColorUsageInProject title={'Current Project'} colorUsed={colorUsedInProject} projectDir={projectDir} doneUpdate={status.colorUsedInProject} />
  <ColorUsageInFile title={'Current File'} colorUsed={colorUsedInFile} doneUpdate={status.colorUsedInFile}/>
</div>

<style>
  .headerContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
</style>
