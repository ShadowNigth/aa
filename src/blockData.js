import * as THREE from 'three';

export const BLOCKS = {
  grass: { name: 'Césped', top: ['#9dc273', '#a9ca7d', '#89ae66'], side: ['#8a6848', '#98744d', '#789655'], hardness: 0.55, category: 'naturaleza' },
  dirt: { name: 'Tierra', top: ['#9a7951', '#a07d52', '#896744'], side: ['#9a7951', '#a07d52', '#896744'], hardness: 0.45, category: 'naturaleza' },
  stone: { name: 'Piedra', top: ['#a0a496', '#92988c', '#8a9085'], side: ['#a0a496', '#92988c', '#8a9085'], hardness: 1.4, category: 'mineral' },
  wood: { name: 'Tronco de roble', top: ['#c69b63', '#d3ac72', '#ac8151'], side: ['#8f6943', '#a37a4d', '#7d5c3c'], hardness: 0.8, category: 'naturaleza' },
  leaves: { name: 'Hojas', top: ['#83a866', '#91b574', '#6f965d'], side: ['#83a866', '#91b574', '#6f965d'], hardness: 0.25, category: 'naturaleza' },
  sand: { name: 'Arena', top: ['#dfcd91', '#ead99f', '#cfba7c'], side: ['#dfcd91', '#ead99f', '#cfba7c'], hardness: 0.3, category: 'naturaleza' },
  flower: { name: 'Flor silvestre', top: ['#e8ad78', '#f0c47a', '#db8f78'], side: ['#6b915b', '#73995e', '#88a96b'], hardness: 0.1, category: 'naturaleza' },
  water: { name: 'Agua', top: ['#84b9ad', '#6ea89f', '#99c9bc'], side: ['#699e96', '#78ada3', '#5e9189'], hardness: 0.1, category: 'líquido', transparent: true },
  snow: { name: 'Nieve', top: ['#f2f3e9', '#fffef6', '#dce9e7'], side: ['#f2f3e9', '#fffef6', '#dce9e7'], hardness: 0.2, category: 'naturaleza' },
  moss: { name: 'Musgo', top: ['#8c9b61', '#9eaa68', '#778b55'], side: ['#79694c', '#8c7951', '#73804d'], hardness: 0.5, category: 'naturaleza' },
  clay: { name: 'Arcilla', top: ['#bf8775', '#ca9280', '#ae7668'], side: ['#bf8775', '#ca9280', '#ae7668'], hardness: 0.7, category: 'naturaleza' },
  gravel: { name: 'Grava', top: ['#aaa99b', '#97998d', '#b5b1a2'], side: ['#aaa99b', '#97998d', '#b5b1a2'], hardness: 0.6, category: 'mineral' },
  coal_ore: { name: 'Mena de carbón', top: ['#96988b', '#292e2d', '#565b55'], side: ['#96988b', '#292e2d', '#565b55'], hardness: 1.8, category: 'mineral' },
  copper_ore: { name: 'Mena de cobre', top: ['#a8a99a', '#b47755', '#6a9b7f'], side: ['#a8a99a', '#b47755', '#6a9b7f'], hardness: 1.8, category: 'mineral' },
  iron_ore: { name: 'Mena de hierro', top: ['#a8a99a', '#d1a17c', '#6c7778'], side: ['#a8a99a', '#d1a17c', '#6c7778'], hardness: 2, category: 'mineral' },
  planks: { name: 'Tablones', top: ['#c49b65', '#d1aa75', '#b18855'], side: ['#b88e5c', '#c69a66', '#a78051'], hardness: 0.7, category: 'construcción' },
  brick: { name: 'Ladrillos', top: ['#b76d59', '#c58167', '#995948'], side: ['#b76d59', '#c58167', '#995948'], hardness: 1.5, category: 'construcción' },
  glass: { name: 'Cristal', top: ['#b1d9cf', '#e4f0de', '#83b4ad'], side: ['#b1d9cf', '#e4f0de', '#83b4ad'], hardness: 0.2, category: 'construcción', transparent: true },
  basalt: { name: 'Basalto', top: ['#696e6b', '#777976', '#565c5c'], side: ['#696e6b', '#777976', '#565c5c'], hardness: 2.4, category: 'mineral' },
  amber: { name: 'Ámbar', top: ['#e5ad55', '#f2c86d', '#bd713e'], side: ['#e5ad55', '#f2c86d', '#bd713e'], hardness: 1.2, category: 'mineral' },
  mushroom: { name: 'Hongo', top: ['#bb755f', '#d28b71', '#e7c7a1'], side: ['#eee3c7', '#f6eed9', '#e3d3ad'], hardness: 0.1, category: 'naturaleza' },
  cobblestone: { name: 'Adoquín', top: ['#999d91', '#858a80', '#a8aa9d'], side: ['#999d91', '#858a80', '#a8aa9d'], hardness: 1.5, category: 'mineral' },
  granite: { name: 'Granito', top: ['#b29182', '#c0a091', '#8e7972'], side: ['#b29182', '#c0a091', '#8e7972'], hardness: 1.5, category: 'mineral' },
  sandstone: { name: 'Arenisca', top: ['#d3bd85', '#e0cc94', '#c6ad74'], side: ['#d3bd85', '#e0cc94', '#c6ad74'], hardness: 0.7, category: 'mineral' },
  ice: { name: 'Hielo', top: ['#c5e2e1', '#e0f1e9', '#a7cbd0'], side: ['#c5e2e1', '#e0f1e9', '#a7cbd0'], hardness: 0.2, category: 'naturaleza', transparent: true },
  birch_wood: { name: 'Madera de abedul', top: ['#d7c89b', '#eee2b8', '#bcae86'], side: ['#ded5b5', '#eee8d1', '#c4b893'], hardness: 0.8, category: 'naturaleza' },
  pine_wood: { name: 'Madera de pino', top: ['#b28b5e', '#c49c6d', '#997449'], side: ['#73593e', '#8b6b47', '#634d37'], hardness: 0.8, category: 'naturaleza' },
  cactus: { name: 'Cactus', top: ['#75a66d', '#8ab878', '#5e915c'], side: ['#63935d', '#82aa69', '#527d52'], hardness: 0.3, category: 'naturaleza' },
  wool: { name: 'Lana', top: ['#e7e5d7', '#f6f2e5', '#d4d2c5'], side: ['#e7e5d7', '#f6f2e5', '#d4d2c5'], hardness: 0.2, category: 'naturaleza' },
  redstone_ore: { name: 'Mena roja', top: ['#96988b', '#d65043', '#565b55'], side: ['#96988b', '#d65043', '#565b55'], hardness: 2, category: 'mineral' },
  gold_ore: { name: 'Mena de oro', top: ['#a8a99a', '#e2bd55', '#b47c43'], side: ['#a8a99a', '#e2bd55', '#b47c43'], hardness: 2, category: 'mineral' },
  lapis_ore: { name: 'Mena azul', top: ['#96988b', '#527dbd', '#313f76'], side: ['#96988b', '#527dbd', '#313f76'], hardness: 2, category: 'mineral' },
  emerald_ore: { name: 'Mena verde', top: ['#96988b', '#69ad79', '#318163'], side: ['#96988b', '#69ad79', '#318163'], hardness: 2.2, category: 'mineral' },
  diamond_ore: { name: 'Mena celeste', top: ['#96988b', '#70c6c0', '#448c9c'], side: ['#96988b', '#70c6c0', '#448c9c'], hardness: 2.4, category: 'mineral' },
  crystal: { name: 'Cristal de luz', top: ['#d9c4e8', '#f0e2f4', '#a9d8d2'], side: ['#d9c4e8', '#f0e2f4', '#a9d8d2'], hardness: 1.2, category: 'mineral' },
  chest: { name: 'Cofre', top: ['#c69b63', '#d4ad73', '#ac8151'], side: ['#9d7245', '#b88b55', '#7d5c3c'], hardness: 1, category: 'utilidad' },
  furnace: { name: 'Horno', top: ['#9b9c91', '#7d8279', '#b3b1a3'], side: ['#92958a', '#747a73', '#a9a899'], hardness: 2, category: 'utilidad' },
  ladder: { name: 'Escalera', top: ['#b98b56', '#d0a66c', '#9a7046'], side: ['#b98b56', '#d0a66c', '#9a7046'], hardness: 0.4, category: 'construcción' },
  obsidian: { name: 'Obsidiana', top: ['#514d66', '#655c7b', '#39384f'], side: ['#514d66', '#655c7b', '#39384f'], hardness: 3, category: 'mineral' },
  snow_leaves: { name: 'Abeto nevado', top: ['#e9eee4', '#f8f6eb', '#6c9373'], side: ['#52785e', '#66896b', '#e8eee0'], hardness: 0.3, category: 'naturaleza' },
  crafting_table: { name: 'Mesa de trabajo', top: ['#d3ad70', '#a77b49', '#deb77d'], side: ['#9c7248', '#b58b58', '#805f3e'], hardness: 1, category: 'utilidad' },
  torch: { name: 'Antorcha', top: ['#ffc66c', '#fff0a7', '#d98e48'], side: ['#a6774e', '#c18d59', '#f1b45e'], hardness: 0.1, category: 'utilidad' },
  sticks: { name: 'Varas', top: ['#b88e5c', '#c69a66', '#a78051'], side: ['#b88e5c', '#c69a66', '#a78051'], hardness: 0, category: 'material' },
};

export const HOTBAR_TYPES = ['grass', 'dirt', 'stone', 'wood', 'leaves', 'sand', 'water', 'flower'];
export const RECIPES = [
  { id: 'planks', name: '4 tablones', icon: '▤', ingredients: { wood: 1 }, output: { planks: 4 } },
  { id: 'sticks', name: '4 varas', icon: '╱', ingredients: { planks: 2 }, output: { sticks: 4 } },
  { id: 'brick', name: '4 ladrillos', icon: '▦', ingredients: { clay: 2 }, output: { brick: 4 } },
  { id: 'glass', name: 'Cristal', icon: '◇', ingredients: { sand: 3 }, output: { glass: 1 } },
  { id: 'crafting_table', name: 'Mesa de trabajo', icon: '▧', ingredients: { planks: 4 }, output: { crafting_table: 1 } },
  { id: 'torch', name: '4 antorchas', icon: '✦', ingredients: { sticks: 1, coal_ore: 1 }, output: { torch: 4 } },
  { id: 'basalt', name: 'Basalto', icon: '▩', ingredients: { stone: 3, coal_ore: 1 }, output: { basalt: 2 } },
  { id: 'amber', name: 'Bloque de ámbar', icon: '◆', ingredients: { copper_ore: 2, iron_ore: 1 }, output: { amber: 1 } },
  { id: 'cobblestone', name: '4 adoquines', icon: '▦', ingredients: { stone: 2 }, output: { cobblestone: 4 } },
  { id: 'sandstone', name: '4 areniscas', icon: '▤', ingredients: { sand: 2 }, output: { sandstone: 4 } },
  { id: 'furnace', name: 'Horno', icon: '▣', ingredients: { cobblestone: 8 }, output: { furnace: 1 } },
  { id: 'chest', name: 'Cofre', icon: '▧', ingredients: { planks: 8 }, output: { chest: 1 } },
  { id: 'ladder', name: '3 escaleras', icon: '╫', ingredients: { sticks: 7 }, output: { ladder: 3 } },
  { id: 'obsidian', name: 'Obsidiana', icon: '◈', ingredients: { basalt: 4, water: 2 }, output: { obsidian: 1 } },
  { id: 'ice', name: 'Hielo', icon: '◇', ingredients: { water: 3, crystal: 1 }, output: { ice: 2 } },
  { id: 'crystal', name: 'Cristal de luz', icon: '✧', ingredients: { diamond_ore: 1, emerald_ore: 2 }, output: { crystal: 1 } },
  { id: 'redstone', name: 'Polvo rojo', icon: '●', ingredients: { redstone_ore: 2 }, output: { redstone_ore: 1 } },
];

function pixelTexture(type, face, seed = 0) {
  const definition = BLOCKS[type];
  const canvas = document.createElement('canvas');
  canvas.width = 16; canvas.height = 16;
  const context = canvas.getContext('2d');
  const palette = face === 'top' ? definition.top : definition.side;
  let state = (seed + type.length * 7919 + (face === 'top' ? 31 : 73)) >>> 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  context.fillStyle = palette[0]; context.fillRect(0, 0, 16, 16);
  for (let i = 0; i < 55; i++) {
    context.fillStyle = palette[Math.floor(random() * palette.length)];
    context.globalAlpha = 0.38 + random() * 0.48;
    const x = Math.floor(random() * 16), y = Math.floor(random() * 16);
    const size = random() > 0.88 ? 2 : 1;
    context.fillRect(x, y, size, size);
  }
  context.globalAlpha = 1;
  if (type === 'grass' && face === 'side') {
    context.fillStyle = '#92b96b'; context.fillRect(0, 0, 16, 3);
    for (let x = 1; x < 16; x += 3) { context.fillStyle = '#b2cd7e'; context.fillRect(x, 2, 1, 2); }
  }
  if (type === 'wood' && face === 'top') {
    context.strokeStyle = '#8e6941'; context.lineWidth = 1;
    context.strokeRect(3, 3, 10, 10); context.strokeRect(6, 6, 4, 4);
  }
  if (type === 'planks' && face === 'side') {
    context.fillStyle = 'rgba(81,54,30,.36)';
    [4, 8, 12].forEach(y => context.fillRect(0, y, 16, 1));
  }
  if (type === 'glass') {
    context.clearRect(0, 0, 16, 16); context.strokeStyle = 'rgba(244,255,245,.88)'; context.lineWidth = 1;
    context.strokeRect(1, 1, 14, 14); context.fillStyle = 'rgba(250,255,244,.62)'; context.fillRect(3, 3, 2, 6);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBlockMaterials() {
  return Object.fromEntries(Object.entries(BLOCKS).map(([type, definition], index) => {
    const opacity = type === 'water' ? 0.78 : type === 'glass' ? 0.42 : 1;
    const side = new THREE.MeshStandardMaterial({ map: pixelTexture(type, 'side', index), roughness: 1, transparent: !!definition.transparent, opacity, alphaTest: definition.transparent ? 0.08 : 0, flatShading: true });
    const top = new THREE.MeshStandardMaterial({ map: pixelTexture(type, 'top', index + 100), roughness: 1, transparent: !!definition.transparent, opacity, alphaTest: definition.transparent ? 0.08 : 0, flatShading: true });
    return [type, [side, side, top, side, side, side]];
  }));
}
