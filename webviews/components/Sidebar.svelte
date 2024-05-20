<script lang="ts">
  import { onMount } from "svelte";
  import ColorUsageInFile from "./ColorUsageInFile.svelte";
  import ColorUsageInDir from "./ColorUsageInDir.svelte";
  import ColorUsageInProject from "./ColorUsageInProject.svelte";
  import Reload from "./Reload.svelte";

  enum Mode {
    CurrentFile,
    CurrentProject,
    CustomDirectory,
  }

  $: colorUsedInProject = {};
  $: colorUsedInDir = {};
  $: colorUsedInFile = new Map();
  $: projectDir = "";
  $: rootDir = "";
  $: relativeDir = "";
  $: isLoading = false;
  let mode: Mode = Mode.CurrentFile;

  function reload() {
    isLoading = true;
    tsvscode.postMessage({ type: "onFetchColorUsed", value: "" });
  }

  function testing() {
    tsvscode.postMessage({ type: "testing", value: "" });
  }

  function parseColorUsageForProject(
    data: { filePath: string; colorUsed: string[] }[]
  ) {
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

  $: onModeChange(mode);

  function onModeChange(mode: Mode) {
    tsvscode.postMessage({ type: "changeMode", value: mode });
  }

  onMount(() => {
    // Listen for messages from the extension
    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.type) {
        case "onReceiveColorsUsedInProject":
          if (message.value) {
            const data = JSON.parse(message.value);
            colorUsedInProject = parseColorUsageForProject(data.colorUsed);
            projectDir = data.projectDir;
            isLoading = false;
          }
          break;
        case "onReceiveColorsUsedInFile":
          if (message.value) {
            const data = JSON.parse(message.value);
            colorUsedInFile = new Map(data.colorUsage);
            isLoading = false;
          }
          break;
        case "onReceiveColorsUsedInDir":
          if (message.value) {
            const data = JSON.parse(message.value);
            colorUsedInDir = parseColorUsageForProject(data.colorUsed);
            rootDir = data.rootDir;
            isLoading = false;
            relativeDir = data.relativeDir;
            mode = Mode.CustomDirectory;
          }
          break;
        case "changeMode":
          if (message.value) {
            mode = message.value;
          }
          break;
        case "startLoading":
          isLoading = true;
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
  <select class="select" bind:value={mode}>
    <option value={Mode.CurrentFile}>Current File</option>
    <option value={Mode.CurrentProject}>Current Project</option>
    <option value={Mode.CustomDirectory}>Custom Directory</option>
  </select>
  {#if mode === Mode.CurrentProject}
    <ColorUsageInProject
      colorUsed={colorUsedInProject}
      {projectDir}
      doneUpdate={!isLoading}
    />
  {/if}
  {#if mode === Mode.CurrentFile}
    <ColorUsageInFile colorUsed={colorUsedInFile} doneUpdate={!isLoading} />
  {/if}
  {#if mode === Mode.CustomDirectory}
    <ColorUsageInDir
      colorUsed={colorUsedInDir}
      {rootDir}
      {relativeDir}
      doneUpdate={!isLoading}
    />
  {/if}
</div>

<style>
  .headerContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .select {
    background-color: #1f1f1f;
    color: white;
    padding: 3px 5px;
    outline: none;
    margin: 10px 0;
  }
</style>
