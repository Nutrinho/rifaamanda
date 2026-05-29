import fs from "node:fs";
import { PNG } from "pngjs";

const files = [
  "public/images/rifa-solidaria-logo.png",
  "public/images/amanda-lavinia.png",
  "public/images/cesta-eletronicos.png",
  "public/images/valor-cirurgia.png",
  "public/images/valor-rifa.png"
];

function isBackgroundCandidate(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max - min;
  return max > 218 && min > 178 && saturation < 78;
}

function softenAlpha(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max - min;
  if (max > 245 && min > 220 && saturation < 42) return 0;
  if (max > 235 && min > 205 && saturation < 58) return 40;
  if (max > 224 && min > 190 && saturation < 72) return 95;
  return 255;
}

function removeConnectedBackground(file) {
  const png = PNG.sync.read(fs.readFileSync(file));
  const { width, height, data } = png;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function enqueue(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const key = y * width + x;
    if (visited[key]) return;
    const offset = key * 4;
    if (!isBackgroundCandidate(data[offset], data[offset + 1], data[offset + 2])) return;
    visited[key] = 1;
    queue.push([x, y]);
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  for (let index = 0; index < queue.length; index += 1) {
    const [x, y] = queue[index];
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  for (let key = 0; key < visited.length; key += 1) {
    if (!visited[key]) continue;
    const offset = key * 4;
    data[offset + 3] = softenAlpha(data[offset], data[offset + 1], data[offset + 2]);
  }

  fs.writeFileSync(file, PNG.sync.write(png, { colorType: 6 }));
  console.log(`updated ${file}`);
}

for (const file of files) {
  removeConnectedBackground(file);
}
