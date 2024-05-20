const colors = [
  { name: "c1", hex: "#FF0000" },
  { name: "c2", hex: "#00FF00" },
  { name: "c3", hex: "#0000FF" },
];

function printColors() {
  colors.forEach((color) => {
    console.log(`Color: ${color.name}, Hex: ${color.hex}`);
  });
}

printColors();
