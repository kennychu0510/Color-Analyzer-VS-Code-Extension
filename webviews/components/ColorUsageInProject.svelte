<script lang="ts">
  export let title: string = 'TITLE';
  export let colorUsed: { [color: string]: string[] } = {};
  export let projectDir: string = '';

  let isExpanded = false;
  let showColorDetail = '';

  function handleOnExpandList(state: boolean) {
    return () => {
      isExpanded = state;
    };
  }

  function onClickColor(color: string) {
    if (showColorDetail === color) {
      showColorDetail = '';
      return;
    }
    showColorDetail = color;
  }

  function handleOnClickPath(path: string, color: string) {
    return () => {
      tsvscode.postMessage({
        type: 'goToColor',
        value: {
          path,
          color,
        },
      });
    };
  }
</script>

<div class="container">
  <div class="title-container">
    <h2 class="title">{title}</h2>
    {#if isExpanded}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div on:click={handleOnExpandList(false)} class="show-button">Collapse</div>
    {:else}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div on:click={handleOnExpandList(true)} class="show-button">Expand</div>
    {/if}
  </div>
  {#if isExpanded}
    {#each Object.keys(colorUsed) as color}
      <div class="color-item">
        <div class="row">
          <div class="color" style="background-color: {color};"></div>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <p on:click={() => onClickColor(color)} class="color-label">{color}</p>
        </div>
        <p>{colorUsed[color].length}</p>
      </div>
      {#if showColorDetail === color}
        <div class="file-path-container">
          {#each colorUsed[color] as filePath}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <p on:click={handleOnClickPath(filePath, color)} class="file-path-item">{filePath.replace(projectDir, '')}</p>
          {/each}
        </div>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .row {
    display: flex;
    align-items: center;
  }
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
    justify-content: space-between;
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
  .show-button {
    font-size: small;
    cursor: pointer;
    color: var(--vscode-button-background);
    user-select: none;
  }
  .show-button:hover {
    text-decoration: underline;
  }
  .file-path-item {
    margin-left: 30px;
    color: orange;
    margin-bottom: 5px;
  }
  .file-path-item:hover {
    text-decoration: underline;
    cursor: pointer;
  }
  .file-path-container {
    margin-bottom: 20px;
    margin-top: -5px;
  }
</style>
