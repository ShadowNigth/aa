import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BLOCKS, HOTBAR_TYPES, RECIPES, createBlockMaterials } from './blockData.js';
import { VoxelPlayer } from './physics.js';
import { createCreature, updateCreatures } from './creatures.js';
import './style.css';

const host = document.querySelector('#world');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#d6e9dc');
scene.fog = new THREE.Fog('#d6e9dc', 31, 77);
const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 130);
camera.position.set(21, 17, 24);
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.domElement.setAttribute('aria-label', 'Mundo 3D interactivo de bloques');
host.prepend(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.minDistance = 18;
controls.maxDistance = 38;
controls.minPolarAngle = 0.45;
controls.maxPolarAngle = 1.42;
controls.enablePan = false;
controls.rotateSpeed = 0.55;
controls.zoomSpeed = 0.65;

const ambientLight = new THREE.HemisphereLight('#f4ffe9', '#82946d', 2.0);
scene.add(ambientLight);
const sunlight = new THREE.DirectionalLight('#fff4d6', 3.1);
sunlight.position.set(-12, 24, 13);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(2048, 2048);
sunlight.shadow.camera.left = -24;
sunlight.shadow.camera.right = 24;
sunlight.shadow.camera.top = 24;
sunlight.shadow.camera.bottom = -24;
sunlight.shadow.bias = -0.0004;
scene.add(sunlight);

const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
const mat = createBlockMaterials();
mat.cloud = new THREE.MeshStandardMaterial({ color: '#eef1d9', roughness: 1, flatShading: true });
mat.ocean = new THREE.MeshStandardMaterial({ color: '#77a99b', roughness: 0.42, metalness: 0, transparent: true, opacity: 0.82 });
const blocks = [];
const blockKey = (x, y, z) => `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
const allowedTypes = new Set(Object.keys(BLOCKS).filter(type => type !== 'sticks'));
const placeableTypes = new Set(allowedTypes);
let worldSeed = Number(localStorage.getItem('bloque-seed')) || 847201;
let inventory = Object.fromEntries(Object.keys(BLOCKS).map(type => [type, 0]));
Object.assign(inventory, { grass: 32, dirt: 32, stone: 24, wood: 12, leaves: 12, sand: 12, water: 8, flower: 8 });
const addBlock = (x, y, z, type, { cast = true } = {}) => {
  const mesh = new THREE.Mesh(cubeGeo, mat[type] || mat.grass);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  mesh.userData = { type, removable: true };
  scene.add(mesh);
  blocks.push(mesh);
  return mesh;
};
const rand = (a, b) => {
  const n = Math.sin((a + worldSeed * 0.00013) * 127.1 + (b - worldSeed * 0.00017) * 311.7 + worldSeed * 0.00031) * 43758.5453;
  return n - Math.floor(n);
};
const smooth = t => t * t * (3 - 2 * t);
const valueNoise = (x, z) => {
  const ix = Math.floor(x), iz = Math.floor(z), fx = smooth(x - Math.floor(x)), fz = smooth(z - Math.floor(z));
  const a = rand(ix, iz), b = rand(ix + 1, iz), c = rand(ix, iz + 1), d = rand(ix + 1, iz + 1);
  const top = a + (b - a) * fx, bottom = c + (d - c) * fx;
  return top + (bottom - top) * fz;
};
const terrainNoise = (x, z) => (valueNoise(x / 4.8, z / 4.8) - 0.5) * 0.68 + (valueNoise(x / 2.1, z / 2.1) - 0.5) * 0.32;
const islandRadius = (x, z) => 10.6 + (valueNoise(x / 3.4, z / 3.4) - 0.5) * 3.4;
const heightAt = (x, z) => {
  const d = Math.sqrt((x * x) / 1.08 + (z * z) / 0.9);
  const radius = islandRadius(x, z);
  if (d > radius) return null;
  const edge = Math.max(0, 1 - d / (radius + 0.5));
  const elevation = 0.45 + edge * 3.1 + terrainNoise(x, z) * 2.7 + Math.sin((x + worldSeed % 29) * 0.42) * 0.22;
  return Math.max(0, Math.min(6, Math.floor(elevation)));
};
const biomeAt = (x, z, height = heightAt(x, z)) => {
  if (height === null) return 'ocean';
  const distance = Math.sqrt((x * x) / 1.08 + (z * z) / 0.9);
  const moisture = valueNoise((x + 40) / 5, (z - 30) / 5);
  const geology = valueNoise((x - 14) / 3.2, (z + 8) / 3.2);
  if (height >= 5) return 'highland';
  if (distance > islandRadius(x, z) - 1.35) return 'coast';
  if (geology > 0.72) return 'rocky';
  if (moisture > 0.64) return 'forest';
  if (moisture < 0.28) return 'dry';
  if (moisture > 0.53 && geology < 0.42) return 'moss';
  return 'meadow';
};

// A layered, hand-built island: grass crown, earthy voxel strata and a narrow sandy shoreline.
for (let x = -14; x <= 14; x++) {
  for (let z = -14; z <= 14; z++) {
    const h = heightAt(x, z);
    if (h === null) continue;
    const biome = biomeAt(x, z, h);
    const surface = biome === 'coast' ? 'sand' : biome === 'highland' ? 'snow' : biome === 'rocky' ? 'basalt' : biome === 'moss' ? 'moss' : biome === 'dry' ? 'clay' : 'grass';
    for (let y = -2; y < h; y++) {
      const top = y === h - 1;
      let type = top ? surface : y < h - 2 ? 'stone' : 'dirt';
      if (!top && y < h - 2) {
        const oreRoll = rand(x * 11 + y * 5, z * 13 - y * 7);
        if (oreRoll > 0.999) type = 'diamond_ore';
        else if (oreRoll > 0.997) type = 'emerald_ore';
        else if (oreRoll > 0.994) type = 'gold_ore';
        else if (oreRoll > 0.99) type = 'lapis_ore';
        else if (oreRoll > 0.985) type = 'redstone_ore';
        else if (oreRoll > 0.976) type = 'iron_ore';
        else if (oreRoll > 0.946) type = 'copper_ore';
        else if (oreRoll > 0.9) type = 'coal_ore';
        else if (oreRoll < 0.025) type = 'gravel';
      }
      addBlock(x, y, z, type);
    }
  }
}

// Quiet water around the island, kept low to leave the stepped shoreline visible.
const water = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat.ocean);
water.rotation.x = -Math.PI / 2;
water.position.y = -1.78;
water.receiveShadow = true;
scene.add(water);

// Trees with deliberately chunky, squared-off canopies.
function tree(x, z, scale = 1) {
  const h = heightAt(x, z);
  if (h === null) return;
  const trunkBase = h;
  for (let i = 0; i < 3 * scale; i++) addBlock(x, trunkBase + i, z, 'wood');
  const crownY = trunkBase + 3 * scale;
  const radius = Math.max(1, Math.round(scale));
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        if (Math.abs(dx) + Math.abs(dz) > radius * 2 - 1 || (dx === 0 && dz === 0 && dy < 1)) continue;
        if (rand(x + dx + dy * 3, z + dz) > 0.16) addBlock(x + dx, crownY + dy, z + dz, 'leaves');
      }
    }
  }
  addBlock(x, crownY + 1, z, 'leaves');
}
for (let x = -12; x <= 12; x++) for (let z = -12; z <= 12; z++) {
  const height = heightAt(x, z);
  const biome = biomeAt(x, z, height);
  if (height !== null && Math.abs(x) + Math.abs(z) > 4 && (biome === 'forest' ? rand(x * 3, z * 5) > 0.79 : biome === 'meadow' && rand(x * 4 + 2, z * 7 - 1) > 0.984)) {
    tree(x, z, rand(x + 12, z - 8) > 0.88 ? 2 : 1);
  }
}

// Small outcrops and scattered flowers add a little life to the open meadow.
for (const [x, z, h] of [[-4, 4, 1], [5, 4, 2], [1, -8, 1], [-7, -5, 1]]) {
  const base = heightAt(x, z);
  if (base !== null) for (let y = 0; y < h; y++) addBlock(x, base + y, z, 'stone');
}
for (let x = -9; x <= 9; x++) for (let z = -9; z <= 9; z++) {
  const h = heightAt(x, z);
  if (h === null || h < 1 || Math.abs(x) + Math.abs(z) <= 7) continue;
  const biome = biomeAt(x, z, h);
  if (biome === 'meadow' && rand(x * 2 + 3, z * 2 - 1) > 0.965) addBlock(x, h, z, 'flower');
  if (biome === 'dry' && rand(x * 5 - 2, z * 3 + 7) > 0.88) {
    const height = rand(x + 2, z - 4) > 0.6 ? 2 : 1;
    for (let y = 0; y < height; y++) addBlock(x, h + y, z, 'cactus');
  }
  if (biome === 'moss' && rand(x * 7 + 1, z * 11 - 3) > 0.94) addBlock(x, h, z, 'mushroom');
}

// Restore the player's edits on return; the untouched landscape is generated deterministically.
const baseBlockKeys = new Set(blocks.map(block => blockKey(block.position.x, block.position.y, block.position.z)));
const removedBase = new Set();
let savedPlacements = [];
let savedPlayerStart = null;
const isValidPosition = p => p && [p.x, p.y, p.z].every(Number.isFinite) && Math.abs(p.x) < 32 && p.y > -3 && p.y < 20 && Math.abs(p.z) < 32;
try {
  const saved = JSON.parse(localStorage.getItem(`bloque-world-${worldSeed}`) || localStorage.getItem('bloque-world-v1') || 'null');
  if (saved?.format === 'bloque-world' && saved.version === 1 && (saved.seed === undefined || saved.seed === worldSeed)) {
    if (isValidPosition(saved.player)) savedPlayerStart = { x: saved.player.x, z: saved.player.z };
    for (const key of Array.isArray(saved.removed) ? saved.removed : []) {
      if (!baseBlockKeys.has(key)) continue;
      removedBase.add(key);
      const target = blocks.find(block => blockKey(block.position.x, block.position.y, block.position.z) === key);
      if (target) { scene.remove(target); blocks.splice(blocks.indexOf(target), 1); }
    }
    if (saved.inventory && typeof saved.inventory === 'object') {
      for (const type of Object.keys(inventory)) {
        const quantity = Number(saved.inventory[type]);
        if (Number.isFinite(quantity) && quantity >= 0) inventory[type] = Math.min(999, Math.floor(quantity));
      }
    }
    const occupied = new Set(blocks.map(block => blockKey(block.position.x, block.position.y, block.position.z)));
    for (const item of Array.isArray(saved.placed) ? saved.placed.slice(0, 2000) : []) {
      if (!placeableTypes.has(item.type) || !isValidPosition(item) || occupied.has(blockKey(item.x, item.y, item.z))) continue;
      const position = { x: Math.round(item.x), y: Math.round(item.y), z: Math.round(item.z) };
      if (occupied.has(blockKey(position.x, position.y, position.z))) continue;
      const block = addBlock(position.x, position.y, position.z, item.type);
      block.userData.userPlaced = true;
      savedPlacements.push({ ...position, type: item.type });
      occupied.add(blockKey(position.x, position.y, position.z));
    }
  }
} catch (error) { console.warn('No se pudo restaurar el mundo guardado.', error); }
const worldSaveData = () => ({
  format: 'bloque-world', version: 1, seed: worldSeed,
  removed: [...removedBase], placed: savedPlacements, inventory,
  player: { x: player.feet.x, y: player.feet.y, z: player.feet.z },
});
function persistWorld() {
  try { localStorage.setItem(`bloque-world-${worldSeed}`, JSON.stringify(worldSaveData())); return true; }
  catch (error) { console.warn('No se pudo guardar el mundo en este dispositivo.', error); return false; }
}

const groundAt = (x, z) => {
  const height = heightAt(Math.round(x), Math.round(z));
  return height === null ? null : height - 0.5;
};
const collidesAt = (x, feetY, z) => blocks.some(block =>
  Math.abs(block.position.x - x) < 0.78 && Math.abs(block.position.z - z) < 0.78 &&
  block.position.y + 0.5 > feetY + 0.06 && block.position.y - 0.5 < feetY + 1.68
);
const player = new VoxelPlayer(scene, cubeGeo, groundAt);
if (savedPlayerStart) {
  const spawnFloor = groundAt(savedPlayerStart.x, savedPlayerStart.z);
  if (spawnFloor !== null) { player.feet.set(savedPlayerStart.x, spawnFloor, savedPlayerStart.z); player.group.position.copy(player.feet); }
}
controls.target.set(player.feet.x, player.feet.y + 1.1, player.feet.z);
camera.position.set(player.feet.x + 21, player.feet.y + 15.5, player.feet.z + 24);
controls.update();
const creatures = [];
const creatureKinds = ['sheep', 'fox', 'mushroom', 'slime'];
for (let i = 0; i < 12 && creatures.length < 7; i++) {
  const x = Math.round(rand(101 + i * 9, 47) * 20 - 10);
  const z = Math.round(rand(23, 317 + i * 7) * 20 - 10);
  if (Math.hypot(x, z) < 4.5 || groundAt(x, z) === null) continue;
  const type = creatures.length === 5 ? 'slime' : creatureKinds[Math.floor(rand(i * 7 + 4, i * 13 + 2) * 3)];
  creatures.push(createCreature(scene, cubeGeo, type, x, groundAt(x, z), z));
}

// Distant soft-edged cloud sculptures give the sky a playful voxel silhouette.
function cloud(x, y, z, size = 1) {
  const puffs = [[0, 0, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [1, 0, 1], [0, 1, 0]];
  for (const [dx, dy, dz] of puffs) {
    const c = new THREE.Mesh(cubeGeo, mat.cloud);
    c.position.set(x + dx * size, y + dy * size, z + dz * size);
    c.scale.setScalar(size * (dy ? 0.85 : 0.92));
    c.castShadow = false;
    scene.add(c);
  }
}
cloud(-16, 12, -3, 1.1); cloud(15, 15, -10, 1.2); cloud(-3, 17, -18, .8);

// Subtle selection outline on the block under the pointer.
const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.015, 1.015, 1.015)), new THREE.LineBasicMaterial({ color: '#f6f1ca', transparent: true, opacity: 0.9 }));
outline.visible = false;
outline.material.depthTest = false;
outline.renderOrder = 4;
scene.add(outline);
const raycaster = new THREE.Raycaster();
raycaster.far = 48;
const pointer = new THREE.Vector2();
let currentTarget = null;
let startPoint = null;
const setPointer = e => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
};
renderer.domElement.addEventListener('pointermove', e => {
  setPointer(e);
  const hit = raycaster.intersectObjects(blocks, false).find(h => h.object.userData.removable);
  currentTarget = hit?.object || null;
  if (currentTarget) {
    outline.position.copy(currentTarget.position);
    outline.visible = true;
  } else outline.visible = false;
});
renderer.domElement.addEventListener('pointerdown', e => { if (e.button === 0) startPoint = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
let selectedType = 'grass';
let placedCount = 0;
let removedCount = 0;
let health = 5;
let buildMode = false;
const controlsInput = { forward: false, back: false, left: false, right: false, jump: false };
const updateHealth = () => { document.querySelector('#hearts').textContent = `${'♥ '.repeat(health)}${'♡ '.repeat(5 - health)}`.trim(); };
let toastTimer;
const toast = message => {
  const el = document.querySelector('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
};
renderer.domElement.addEventListener('pointerup', e => {
  if (!startPoint || Math.hypot(e.clientX - startPoint.x, e.clientY - startPoint.y) > 5) { startPoint = null; return; }
  startPoint = null;
  setPointer(e);
  const hit = raycaster.intersectObjects(blocks, false).find(h => h.object.userData.removable);
  if (!hit) return;
  if (e.shiftKey || buildMode) {
    const normal = hit.face.normal.clone().applyQuaternion(hit.object.quaternion);
    const p = hit.object.position.clone().add(normal);
    if (p.y > 8) return toast('¡Hasta las nubes, no!');
    const position = { x: Math.round(p.x), y: Math.round(p.y), z: Math.round(p.z) };
    if (blocks.some(block => blockKey(block.position.x, block.position.y, block.position.z) === blockKey(position.x, position.y, position.z))) return toast('Ya hay un bloque en ese lugar.');
    if (!placeableTypes.has(selectedType) || (inventory[selectedType] || 0) < 1) return toast(`No tienes ${BLOCKS[selectedType]?.name || 'ese bloque'}. Mina bloques o fabrica más.`);
    inventory[selectedType]--;
    const added = addBlock(position.x, position.y, position.z, selectedType);
    added.userData.userPlaced = true;
    savedPlacements.push({ ...position, type: selectedType });
    persistWorld();
    refreshInventoryUI();
    currentTarget = added;
    placedCount++;
    document.querySelector('.quest-foot b').textContent = `${Math.min(placedCount + 1, 3)} DE 3`;
    if (placedCount === 2) toast('¡Misión completada! Sigue construyendo.');
    else toast('Bloque colocado');
  } else {
    const object = hit.object;
    if (object.position.y <= -1) return toast('La isla necesita sus cimientos.');
    const key = blockKey(object.position.x, object.position.y, object.position.z);
    scene.remove(object);
    const index = blocks.indexOf(object);
    if (index !== -1) blocks.splice(index, 1);
    if (object.userData.userPlaced) savedPlacements = savedPlacements.filter(item => blockKey(item.x, item.y, item.z) !== key);
    else if (baseBlockKeys.has(key)) removedBase.add(key);
    const dropType = object.userData.type;
    if (inventory[dropType] !== undefined) inventory[dropType] = Math.min(999, inventory[dropType] + 1);
    persistWorld();
    refreshInventoryUI();
    outline.visible = false;
    removedCount++;
    toast(removedCount === 1 ? 'Primer bloque roto. ¡Buen comienzo!' : 'Bloque recogido');
  }
});

const slots = [...document.querySelectorAll('.slot')];
function selectType(type) {
  if (!placeableTypes.has(type)) return;
  selectedType = type;
  slots.forEach((slot, index) => slot.classList.toggle('selected', HOTBAR_TYPES[index] === type));
  document.querySelector('#selectedName').textContent = BLOCKS[type]?.name || type;
}
function selectSlot(index) {
  if (index < 0 || index >= HOTBAR_TYPES.length) return;
  selectType(HOTBAR_TYPES[index]);
}
slots.forEach((slot, index) => slot.addEventListener('click', () => selectSlot(index)));
const inventoryGrid = document.querySelector('#inventoryGrid');
const recipeList = document.querySelector('#recipeList');
function refreshInventoryUI() {
  document.querySelectorAll('[data-count]').forEach(element => { element.textContent = inventory[element.dataset.count] ?? 0; });
  inventoryGrid.replaceChildren();
  for (const type of placeableTypes) {
    const definition = BLOCKS[type];
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'inventory-item';
    const swatch = document.createElement('span'); swatch.className = 'inventory-swatch'; swatch.style.background = definition.top[0];
    const label = document.createElement('span'); label.textContent = definition.name;
    const count = document.createElement('small'); count.textContent = inventory[type] ?? 0;
    button.append(swatch, label, count);
    button.addEventListener('click', () => {
      selectType(type); inventoryPanel.hidden = true;
      toast((inventory[type] || 0) ? `${definition.name} seleccionado` : `No tienes ${definition.name}. Fabrica o recolecta algunos.`);
    });
    inventoryGrid.append(button);
  }
  recipeList.replaceChildren();
  for (const recipe of RECIPES) {
    const button = document.createElement('button');
    const canCraft = Object.entries(recipe.ingredients).every(([type, amount]) => (inventory[type] || 0) >= amount);
    button.type = 'button'; button.className = 'recipe-card'; button.disabled = !canCraft;
    const requirements = Object.entries(recipe.ingredients).map(([type, amount]) => `${amount} ${BLOCKS[type]?.name || type}`).join(' + ');
    button.innerHTML = `<span class="recipe-icon">${recipe.icon}</span><span class="recipe-copy"><b>${recipe.name}</b><small>${requirements}</small></span><span class="recipe-arrow">↗</span>`;
    button.addEventListener('click', () => {
      if (!Object.entries(recipe.ingredients).every(([type, amount]) => inventory[type] >= amount)) return;
      for (const [type, amount] of Object.entries(recipe.ingredients)) inventory[type] -= amount;
      for (const [type, amount] of Object.entries(recipe.output)) inventory[type] = (inventory[type] || 0) + amount;
      persistWorld(); refreshInventoryUI();
      toast(`Fabricaste ${recipe.name}`);
    });
    recipeList.append(button);
  }
}
refreshInventoryUI();
window.addEventListener('keydown', e => {
  const movement = { KeyW: 'forward', ArrowUp: 'forward', KeyS: 'back', ArrowDown: 'back', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right' };
  if (movement[e.code]) { controlsInput[movement[e.code]] = true; e.preventDefault(); }
  if (e.code === 'Space' && !e.repeat) { controlsInput.jump = true; e.preventDefault(); }
  if (/^[1-8]$/.test(e.key)) selectSlot(Number(e.key) - 1);
  if (e.key.toLowerCase() === 'i') inventoryPanel.hidden = !inventoryPanel.hidden;
  if (e.key.toLowerCase() === 'b') { buildMode = !buildMode; document.querySelector('#buildMode').classList.toggle('active', buildMode); }
  if (e.key === 'Escape') inventoryPanel.hidden = true;
});
window.addEventListener('keyup', e => {
  const movement = { KeyW: 'forward', ArrowUp: 'forward', KeyS: 'back', ArrowDown: 'back', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right' };
  if (movement[e.code]) controlsInput[movement[e.code]] = false;
  if (e.code === 'Space') controlsInput.jump = false;
});
window.addEventListener('blur', () => { controlsInput.forward = controlsInput.back = controlsInput.left = controlsInput.right = controlsInput.jump = false; });
document.querySelector('#hideQuest').addEventListener('click', () => document.querySelector('.quest-card').classList.add('hidden'));
const inventoryPanel = document.querySelector('#inventoryPanel');
document.querySelector('.inventory-button').addEventListener('click', () => { inventoryPanel.hidden = !inventoryPanel.hidden; });
document.querySelector('#closeInventory').addEventListener('click', () => { inventoryPanel.hidden = true; });
document.querySelector('#importWorld').addEventListener('click', () => document.querySelector('#loadWorld').click());
inventoryPanel.querySelectorAll('[data-item]').forEach(button => button.addEventListener('click', () => {
  selectSlot(Number(button.dataset.item));
  inventoryPanel.hidden = true;
  toast(`${slots[Number(button.dataset.item)].dataset.name} seleccionado`);
}));
document.querySelector('#buildMode').addEventListener('click', () => {
  buildMode = !buildMode;
  document.querySelector('#buildMode').classList.toggle('active', buildMode);
  toast(buildMode ? 'Modo colocar: toca un bloque para construir' : 'Modo minar activado');
});
for (const button of document.querySelectorAll('.touch-pad [data-move]')) {
  const key = button.dataset.move;
  const start = event => { event.preventDefault(); controlsInput[key] = true; button.setPointerCapture?.(event.pointerId); };
  const stop = event => { event.preventDefault(); controlsInput[key] = false; };
  button.addEventListener('pointerdown', start);
  button.addEventListener('pointerup', stop);
  button.addEventListener('pointercancel', stop);
  button.addEventListener('lostpointercapture', stop);
}
document.querySelector('#touchJump').addEventListener('pointerdown', e => { e.preventDefault(); controlsInput.jump = true; });
document.querySelector('#newWorld').addEventListener('click', () => {
  if (!window.confirm('¿Generar un mundo procedural nuevo? Tu isla actual seguirá disponible en el archivo JSON que hayas descargado.')) return;
  worldSeed = Math.floor(Math.random() * 9000000) + 100000;
  localStorage.setItem('bloque-seed', String(worldSeed));
  location.reload();
});
document.querySelector('#saveWorld').addEventListener('click', () => {
  const data = worldSaveData();
  const stored = persistWorld();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mi-mundo-bloque.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(stored ? 'Mundo guardado y copia descargada' : 'Copia del mundo descargada');
});
document.querySelector('#loadWorld').addEventListener('change', async e => {
  const file = e.currentTarget.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data?.format !== 'bloque-world' || data.version !== 1 || !Array.isArray(data.placed) || !Array.isArray(data.removed)) throw new Error('Archivo incompatible');
    const safeData = {
      format: 'bloque-world', version: 1, seed: Number.isSafeInteger(data.seed) ? data.seed : 847201,
      removed: data.removed.filter(key => typeof key === 'string' && /^-?\d+,-?\d+,-?\d+$/.test(key)).slice(0, 10000),
      placed: data.placed.filter(item => placeableTypes.has(item?.type) && isValidPosition(item)).slice(0, 2000).map(item => ({ x: Math.round(item.x), y: Math.round(item.y), z: Math.round(item.z), type: item.type })),
      inventory: Object.fromEntries(Object.keys(inventory).map(type => [type, Math.max(0, Math.min(999, Math.floor(Number(data.inventory?.[type]) || 0)))])),
      player: isValidPosition(data.player) ? { x: data.player.x, y: data.player.y, z: data.player.z } : null,
    };
    localStorage.setItem('bloque-seed', String(safeData.seed));
    localStorage.setItem(`bloque-world-${safeData.seed}`, JSON.stringify(safeData));
    location.reload();
  } catch (error) { toast('No pude abrir ese archivo de mundo.'); console.warn(error); }
  e.currentTarget.value = '';
});
document.querySelector('.sound-toggle').addEventListener('click', e => {
  e.currentTarget.classList.toggle('muted');
  toast(e.currentTarget.classList.contains('muted') ? 'Sonido desactivado' : 'Sonido activado');
});
document.querySelector('.scene-tag button').addEventListener('click', () => toast('Isla del Amanecer · un lugar para empezar de nuevo'));
document.querySelector('.avatar').addEventListener('click', () => toast('¡Hola, Alex! Qué bueno verte por aquí.'));

const resize = () => {
  const width = host.clientWidth;
  const height = host.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
};
new ResizeObserver(resize).observe(host);
resize();
updateHealth();
document.querySelector('#seedLabel').textContent = worldSeed;
const clock = new THREE.Clock();
let elapsed = 0;
let uiElapsed = 0;
let autoSaveElapsed = 0;
const daySky = new THREE.Color('#d6e9dc');
const nightSky = new THREE.Color('#59677c');
const dayFog = new THREE.Color('#d6e9dc');
const nightFog = new THREE.Color('#657080');
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt; uiElapsed += dt; autoSaveElapsed += dt;
  const previous = player.feet.clone();
  player.update(dt, controlsInput, camera, groundAt, collidesAt);
  controlsInput.jump = false;
  const follow = player.feet.clone().sub(previous);
  camera.position.add(follow);
  controls.target.add(follow);
  controls.update();
  if (autoSaveElapsed >= 10) { persistWorld(); autoSaveElapsed = 0; }

  const phase = (elapsed / 240 + 0.25) % 1;
  const daylight = Math.max(0, Math.sin(phase * Math.PI * 2));
  const nightBlend = 1 - Math.min(1, daylight * 1.35);
  const night = nightBlend > 0.78;
  ambientLight.intensity = 0.38 + daylight * 1.62;
  sunlight.intensity = 0.18 + daylight * 3.0;
  sunlight.position.set(Math.cos(phase * Math.PI * 2) * 17, 5 + daylight * 22, Math.sin(phase * Math.PI * 2) * 17);
  scene.background.copy(nightSky).lerp(daySky, 1 - nightBlend);
  scene.fog.color.copy(nightFog).lerp(dayFog, 1 - nightBlend);
  water.position.y = -1.78 + Math.sin(elapsed * 0.55) * 0.018;
  updateCreatures(creatures, dt, elapsed, player.feet, groundAt, night, () => {
    health = Math.max(0, health - 1); updateHealth();
    if (health === 0) {
      health = 5;
      const spawn = new THREE.Vector3(0, groundAt(0, 0), 0);
      const respawnDelta = spawn.clone().sub(player.feet);
      player.feet.copy(spawn); player.group.position.copy(spawn); player.velocity.set(0, 0, 0);
      camera.position.add(respawnDelta); controls.target.add(respawnDelta); updateHealth();
      toast('Te has recuperado en el punto de inicio.');
    } else toast('¡Un moco de sombra te alcanzó!');
  });
  if (uiElapsed > 0.35) {
    uiElapsed = 0;
    const totalMinutes = Math.floor(((phase * 24 + 6) % 24) * 60);
    const hour = Math.floor(totalMinutes / 60), minute = totalMinutes % 60;
    const day = Math.floor(elapsed / 240) + 1;
    document.querySelector('#clock').textContent = `DÍA ${String(day).padStart(2, '0')} · ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    document.querySelector('#coordX').textContent = Math.round(player.feet.x);
    document.querySelector('#coordY').textContent = Math.floor(player.feet.y);
    document.querySelector('#coordZ').textContent = Math.round(player.feet.z);
  }
  renderer.render(scene, camera);
}
animate();
