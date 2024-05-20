export function sortColorUsedInFileByName(map, asc) {
  if (asc) {
    return new Map(
      [...map.entries()].toSorted((a, b) => a[0].localeCompare(b[0]))
    );
  } else {
    return new Map(
      [...map.entries()].toSorted((a, b) => b[0].localeCompare(a[0]))
    );
  }
}

export function sortColorUsedObjByName(map, asc) {
  if (asc) {
    return Object.keys(map)
      .toSorted((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = map[key];
        return acc;
      }, {});
  } else {
    return Object.keys(map)
      .toSorted((a, b) => b.localeCompare(a))
      .reduce((acc, key) => {
        acc[key] = map[key];
        return acc;
      }, {});
  }
}

export function sortColorUsedInFileByUsage(map, asc) {
  if (asc) {
    return new Map([...map.entries()].toSorted((a, b) => a[1] - b[1]));
  } else {
    return new Map([...map.entries()].toSorted((a, b) => b[1] - a[1]));
  }
}

export function sortColorUsedObjByUsage(map, asc) {
  if (asc) {
    return Object.keys(map)
      .toSorted((a, b) => map[a].length - map[b].length)
      .reduce((acc, key) => {
        acc[key] = map[key];
        return acc;
      }, {});
  } else {
    return Object.keys(map)
      .toSorted((a, b) => map[b].length - map[a].length)
      .reduce((acc, key) => {
        acc[key] = map[key];
        return acc;
      }, {});
  }
}

export function filterColorUsageByValueInFile(map, value) {
  return new Map(
    [...map.entries()].filter(([color]) =>
      color.toLowerCase().includes(value.toLowerCase())
    )
  );
}

export function filterObjByValue(obj, value) {
  return Object.keys(obj).reduce((acc, color) => {
    if (color.toLowerCase().includes(value.toLowerCase())) {
      acc[color] = colorUsedInProject[color];
    }
    return acc;
  }, {});
}
