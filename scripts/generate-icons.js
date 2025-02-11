const fs = require("fs");
const { createCanvas } = require("canvas");

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, size, size);

  // Draw "HB" text
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HB", size / 2, size / 2);

  // Save to file
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(`icons/icon${size}.png`, buffer);
}

// Generate icons for different sizes
[16, 48, 128].forEach((size) => generateIcon(size));
