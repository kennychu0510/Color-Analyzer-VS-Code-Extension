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
  $: filteredColorUsedInProject = {};
  $: colorUsedInDir = {};
  $: filteredColorUsedInDir = {};
  $: colorUsedInFile = new Map();
  $: filteredColorUsedInFile = new Map();
  $: projectDir = "";
  $: rootDir = "";
  $: relativeDir = "";
  $: isLoading = false;
  $: searchValue = "";
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
  $: filterBySearchValue(searchValue);

  function onModeChange(mode: Mode) {
    isLoading = true;
    tsvscode.postMessage({ type: "changeMode", value: mode });
  }

  function filterBySearchValue(value: string): void {
    console.log(value);
    if (!value) {
      filteredColorUsedInFile = new Map(colorUsedInFile);
      filteredColorUsedInDir = { ...colorUsedInDir };
      filteredColorUsedInProject = { ...colorUsedInProject };
      return;
    }
    if (mode === Mode.CurrentFile) {
      filteredColorUsedInFile = new Map(
        [...colorUsedInFile].filter(([color]) => color.includes(value))
      );
    } else if (mode === Mode.CurrentProject) {
      filteredColorUsedInProject = Object.keys(colorUsedInProject).reduce(
        (acc, color) => {
          if (color.includes(value)) {
            // @ts-ignore
            acc[color] = colorUsedInProject[color];
          }
          return acc;
        },
        {}
      );
    } else {
      filteredColorUsedInDir = Object.keys(colorUsedInDir).reduce(
        (acc, color) => {
          if (color.includes(value)) {
            // @ts-ignore
            acc[color] = colorUsedInDir[color];
          }
          return acc;
        },
        {}
      );
    }
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
            filteredColorUsedInProject = parseColorUsageForProject(
              data.colorUsed
            );
            projectDir = data.projectDir;
            isLoading = false;
          }
          break;
        case "onReceiveColorsUsedInFile":
          if (message.value) {
            const data = JSON.parse(message.value);
            colorUsedInFile = new Map(data.colorUsage);
            filteredColorUsedInFile = new Map(data.colorUsage);
            isLoading = false;
          }
          break;
        case "onReceiveColorsUsedInDir":
          if (message.value) {
            const data = JSON.parse(message.value);
            colorUsedInDir = parseColorUsageForProject(data.colorUsed);
            filteredColorUsedInDir = parseColorUsageForProject(data.colorUsed);
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
  <div class="row">
    <input
      type="text"
      class="search"
      placeholder="Search"
      bind:value={searchValue}
    />
  </div>
  {#if mode === Mode.CurrentProject}
    <ColorUsageInProject
      colorUsed={filteredColorUsedInProject}
      {projectDir}
      doneUpdate={!isLoading}
    />
  {/if}
  {#if mode === Mode.CurrentFile}
    <ColorUsageInFile
      colorUsed={filteredColorUsedInFile}
      doneUpdate={!isLoading}
    />
  {/if}
  {#if mode === Mode.CustomDirectory}
    <ColorUsageInDir
      colorUsed={filteredColorUsedInDir}
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
  .row {
    margin-bottom: 10px;
  }
</style>
