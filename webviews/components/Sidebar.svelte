<script lang="ts">
  import { onMount } from "svelte";
  import ColorUsageInFile from "./ColorUsageInFile.svelte";
  import ColorUsageInDir from "./ColorUsageInDir.svelte";
  import ColorUsageInProject from "./ColorUsageInProject.svelte";
  import Reload from "./Reload.svelte";
  import {
    filterColorUsageByValueInFile,
    filterObjByValue,
    sortColorUsedInFileByName,
    sortColorUsedInFileByUsage,
    sortColorUsedObjByName,
    sortColorUsedObjByUsage,
  } from "./helper";

  enum Mode {
    CurrentFile,
    CurrentProject,
    CustomDirectory,
  }

  enum SortMethod {
    NameAsc,
    NameDsc,
    UsageAsc,
    UsageDsc,
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
  let sortMethod: SortMethod = SortMethod.NameAsc;
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
  $: sortByMethod(sortMethod, mode);

  function onModeChange(mode: Mode) {
    isLoading = true;
    tsvscode.postMessage({ type: "changeMode", value: mode });
  }

  function filterBySearchValue(value: string, mode: Mode): void {
    if (!value) {
      filteredColorUsedInFile = new Map(colorUsedInFile);
      filteredColorUsedInDir = { ...colorUsedInDir };
      filteredColorUsedInProject = { ...colorUsedInProject };
      return;
    }
    if (mode === Mode.CurrentFile) {
      filteredColorUsedInFile = filterColorUsageByValueInFile(
        colorUsedInFile,
        value
      );
    } else if (mode === Mode.CurrentProject) {
      filteredColorUsedInProject = filterObjByValue(colorUsedInProject, value);
    } else {
      filteredColorUsedInDir = filterObjByValue(colorUsedInDir, value);
    }
  }

  function sortByMethod(method: SortMethod, mode: Mode) {
    if (method === SortMethod.NameAsc) {
      if (mode === Mode.CurrentFile) {
        filteredColorUsedInFile = sortColorUsedInFileByName(
          filteredColorUsedInFile,
          true
        );
      } else if (mode === Mode.CurrentProject) {
        filteredColorUsedInProject = sortColorUsedObjByName(
          filteredColorUsedInProject,
          true
        );
      } else {
        filteredColorUsedInDir = sortColorUsedObjByName(
          filteredColorUsedInDir,
          true
        );
      }
    } else if (method === SortMethod.NameDsc) {
      if (mode === Mode.CurrentFile) {
        filteredColorUsedInFile = sortColorUsedInFileByName(
          filteredColorUsedInFile,
          false
        );
      } else if (mode === Mode.CurrentProject) {
        filteredColorUsedInProject = sortColorUsedObjByName(
          filteredColorUsedInProject,
          false
        );
      } else {
        filteredColorUsedInDir = sortColorUsedObjByName(
          filteredColorUsedInDir,
          false
        );
      }
    } else if (method === SortMethod.UsageAsc) {
      if (mode === Mode.CurrentFile) {
        filteredColorUsedInFile = sortColorUsedInFileByUsage(
          filteredColorUsedInFile,
          true
        );
      } else if (mode === Mode.CustomDirectory) {
        filteredColorUsedInDir = sortColorUsedObjByUsage(
          filteredColorUsedInDir,
          true
        );
      } else {
        filteredColorUsedInProject = sortColorUsedObjByUsage(
          filteredColorUsedInProject,
          true
        );
      }
    } else if (method === SortMethod.UsageDsc) {
      if (mode === Mode.CurrentFile) {
        filteredColorUsedInFile = sortColorUsedInFileByUsage(
          filteredColorUsedInFile,
          false
        );
      } else if (mode === Mode.CustomDirectory) {
        filteredColorUsedInDir = sortColorUsedObjByUsage(
          filteredColorUsedInDir,
          false
        );
      } else {
        filteredColorUsedInProject = sortColorUsedObjByUsage(
          filteredColorUsedInProject,
          false
        );
      }
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
    <div style="font-weight: bold;">Usage Summary</div>
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
      Directory
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
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="sort-button"
      style={sortMethod === SortMethod.NameAsc ||
      sortMethod === SortMethod.NameDsc
        ? "font-weight: bold;"
        : ""}
      on:click={() => {
        if (sortMethod === SortMethod.NameAsc) {
          sortMethod = SortMethod.NameDsc;
        } else {
          sortMethod = SortMethod.NameAsc;
        }
      }}
    >
      Color
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="sort-button"
      style={sortMethod === SortMethod.UsageAsc ||
      sortMethod === SortMethod.UsageDsc
        ? "font-weight: bold;"
        : ""}
      on:click={() => {
        if (sortMethod === SortMethod.UsageAsc) {
          sortMethod = SortMethod.UsageDsc;
        } else {
          sortMethod = SortMethod.UsageAsc;
        }
      }}
    >
      Usage
    </div>
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
    user-select: none;
  }
  .mode-item {
    flex: 1;
    text-align: center;
    margin-top: 10px;
    padding-bottom: 3px;
    border-bottom: 2px solid transparent;
    user-select: none;
    cursor: pointer;
    transition: all 0.5s;
  }
</style>
