// Генерирует SVG-иллюстрации цветов для демо-данных (public/seed).
// Запуск: node scripts/generate-images.mjs
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "seed");
fs.mkdirSync(OUT, { recursive: true });

const W = 800;
const H = 600;
const cx = W / 2;
const cy = H / 2;

function petalPath(color, opacity, count, layerOffset, dist, rx, ry) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const angle = (i * 360) / count + layerOffset;
    s += `<g transform="rotate(${angle} ${cx} ${cy})">
      <ellipse cx="${cx}" cy="${cy - dist}" rx="${rx}" ry="${ry}" fill="${color}" opacity="${opacity}"/>
    </g>`;
  }
  return s;
}

/**
 * @param {object} o
 * @param {string} o.name           имя файла без расширения
 * @param {[string,string]} o.bg    градиент фона
 * @param {string[]} o.petals       цвета слоёв лепестков (снаружи -> внутрь)
 * @param {string} o.center         цвет сердцевины
 * @param {number} o.count          число лепестков
 * @param {boolean} [o.speckle]     крап на лепестках (фэнтези-фиалки)
 * @param {string} [o.edge]         цвет каймы лепестков
 */
function flower(o) {
  const layers = o.petals.length;
  let body = "";
  for (let L = 0; L < layers; L++) {
    const t = L / Math.max(1, layers - 1); // 0 снаружи .. 1 внутри
    const dist = 150 - t * 70;
    const rx = 60 - t * 18;
    const ry = 130 - t * 55;
    const offset = (L % 2) * (180 / o.count);
    if (o.edge && L === 0) {
      body += petalPath(o.edge, 1, o.count, offset, dist, rx + 8, ry + 8);
    }
    body += petalPath(o.petals[L], 0.96, o.count, offset, dist, rx, ry);
  }

  const speckles = o.speckle
    ? Array.from({ length: 70 }, () => {
        const a = Math.random() * Math.PI * 2;
        const r = 40 + Math.random() * 150;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + Math.random() * 2.4).toFixed(1)}" fill="#5b1a6b" opacity="0.5"/>`;
      }).join("")
    : "";

  const stamens = Array.from({ length: 7 }, (_, i) => {
    const a = (i * 360) / 7;
    return `<g transform="rotate(${a} ${cx} ${cy})"><circle cx="${cx}" cy="${cy - 34}" r="7" fill="#f6c945"/></g>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="${o.bg[0]}"/>
      <stop offset="100%" stop-color="${o.bg[1]}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="${cx}" cy="${cy}" rx="300" ry="260" fill="url(#glow)"/>
  <!-- листья -->
  <g opacity="0.85">
    <ellipse cx="${cx - 150}" cy="${cy + 150}" rx="120" ry="44" fill="#2f7d44" transform="rotate(-28 ${cx - 150} ${cy + 150})"/>
    <ellipse cx="${cx + 150}" cy="${cy + 150}" rx="120" ry="44" fill="#266b3a" transform="rotate(28 ${cx + 150} ${cy + 150})"/>
  </g>
  ${body}
  ${speckles}
  <circle cx="${cx}" cy="${cy}" r="44" fill="${o.center}"/>
  ${stamens}
  <circle cx="${cx}" cy="${cy}" r="20" fill="#e8a712"/>
</svg>`;
  fs.writeFileSync(path.join(OUT, `${o.name}.svg`), svg.trim());
  console.log("✓", `${o.name}.svg`);
}

function avatar(o) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${o.bg[0]}"/><stop offset="100%" stop-color="${o.bg[1]}"/>
  </linearGradient></defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <circle cx="200" cy="150" r="78" fill="#ffffff" opacity="0.92"/>
  <path d="M70 360 q130 -150 260 0 z" fill="#ffffff" opacity="0.92"/>
  <text x="200" y="178" font-family="Segoe UI, sans-serif" font-size="86" font-weight="700"
        fill="${o.fg}" text-anchor="middle">${o.initials}</text>
</svg>`;
  fs.writeFileSync(path.join(OUT, `${o.name}.svg`), svg.trim());
  console.log("✓", `${o.name}.svg`);
}

// --- Сорта --------------------------------------------------------------
flower({ name: "alyy-zakat", bg: ["#fde2dd", "#f6b8ad"], petals: ["#e23b2e", "#c41f15"], center: "#7a1008", count: 6 });
flower({ name: "belaya-noch", bg: ["#fff8f0", "#ffe7ef"], petals: ["#fffaf3", "#ffe0ea"], center: "#e58aa8", count: 6, edge: "#f4c2d2" });
flower({ name: "rozovaya-zarya", bg: ["#ffeef2", "#fbc6d6"], petals: ["#e8447a", "#f48fb1", "#fde0ea"], center: "#b02a5b", count: 8 });
flower({ name: "rozovaya-zarya-2", bg: ["#fff0f4", "#f7b8cf"], petals: ["#d63384", "#f06ba0", "#ffd6e6"], center: "#8e1f54", count: 10 });
flower({ name: "rozovaya-zarya-3", bg: ["#fce4ec", "#f8a8c4"], petals: ["#ef5da8", "#f9a8cd"], center: "#a02363", count: 7 });
flower({ name: "ognenny-vikhr", bg: ["#fff0e6", "#ffc59e"], petals: ["#f2541b", "#ff8347"], center: "#7a1f06", count: 6, edge: "#ffd9b8" });
flower({ name: "bagryany-tanets", bg: ["#ffe6ec", "#f7a9be"], petals: ["#b81d3e", "#e0476a", "#f7a9be"], center: "#6e0f24", count: 10 });
flower({ name: "rassvet", bg: ["#fff1e0", "#ffd9a8"], petals: ["#ff7a2f", "#ffab5e", "#ffe0b8"], center: "#c1440e", count: 9 });

// --- Аватары ------------------------------------------------------------
avatar({ name: "avatar-anna", bg: ["#f6b8ad", "#c41f15"], fg: "#7a1008", initials: "АГ" });
avatar({ name: "avatar-igor", bg: ["#ff8347", "#b81d3e"], fg: "#5c0f1c", initials: "ИТ" });

console.log("\nГотово. Файлы в public/seed/");
