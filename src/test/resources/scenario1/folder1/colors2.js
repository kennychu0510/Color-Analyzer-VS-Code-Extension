const fs = require("fs");

// Import the 'fs' module

// Array of hex colors
const hexColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF"];

// Generate a random file name
const fileName = `random_colors_${Date.now()}.txt`;

// Generate random hex colors
const randomColors = [];
for (let i = 0; i < 10; i++) {
  const randomIndex = Math.floor(Math.random() * hexColors.length);
  randomColors.push(hexColors[randomIndex]);
}

// Convert the colors to a string
const colorsString = randomColors.join("\n");

// Write the colors to the file
fs.writeFile(fileName, colorsString, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`File '${fileName}' created with random hex colors.`);
});
