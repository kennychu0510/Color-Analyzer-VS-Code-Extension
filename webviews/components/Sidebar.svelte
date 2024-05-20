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

  enum SortMethod {
    Name,
    Usage,
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
  $: sortMethod = "";
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
  $: filterBySearchValue(searchValue, mode);

  function onModeChange(mode: Mode) {
    isLoading = true;
    tsvscode.postMessage({ type: "changeMode", value: mode });
  }

  function filterBySearchValue(value: string, mode: Mode): void {
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

  function sortByMethod(method: SortMethod) {}

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
  <div class="row">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="mode-item"
      style={mode === Mode.CurrentFile ? "border-bottom-color: white;" : ""}
      on:click={() => (mode = Mode.CurrentFile)}
    >
      File
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="mode-item"
      style={mode === Mode.CurrentProject ? "border-bottom-color: white;" : ""}
      on:click={() => (mode = Mode.CurrentProject)}
    >
      Project
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="mode-item"
      style={mode === Mode.CustomDirectory ? "border-bottom-color: white;" : ""}
      on:click={() => (mode = Mode.CustomDirectory)}
    >
      Custom
    </div>
  </div>
  {#if mode === Mode.CustomDirectory && relativeDir}
    <div class="row">
      <div class="dir-path">{relativeDir}</div>
    </div>
  {/if}
  <div class="row">
    <input
      type="text"
      class="search"
      placeholder="Search"
      bind:value={searchValue}
    />
  </div>
  <div class="row sort-row">
    <div class="sort-button">Color</div>
    <div class="sort-button">Usage</div>
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
    display: flex;
  }
  .dir-path {
    color: orange;
  }
  .sort-row {
    justify-content: space-between;
  }
  .sort-button {
    cursor: pointer;
  }
  .mode-item {
    flex: 1;
    text-align: center;
    margin-top: 10px;
    padding-bottom: 3px;
    border-bottom: 2px solid transparent;
  }
</style>
