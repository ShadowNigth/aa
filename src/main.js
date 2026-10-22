import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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

scene.add(new THREE.HemisphereLight('#f4ffe9', '#82946d', 2.0));
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
const mat = {
  grass: new THREE.MeshStandardMaterial({ color: '#85a866', roughness: 1, flatShading: true }),
  dirt: new THREE.MeshStandardMaterial({ color: '#98764c', roughness: 1, flatShading: true }),
  stone: new THREE.MeshStandardMaterial({ color: '#929b87', roughness: 1, flatShading: true }),
  wood: new THREE.MeshStandardMaterial({ color: '#8a6743', roughness: 1, flatShading: true }),
  leaves: new THREE.MeshStandardMaterial({ color: '#6f935c', roughness: 1, flatShading: true }),
  sand: new THREE.MeshStandardMaterial({ color: '#d2bd7e', roughness: 1, flatShading: true }),
  flower: new THREE.MeshStandardMaterial({ color: '#e6a574', roughness: 1, flatShading: true }),
  water: new THREE.MeshStandardMaterial({ color: '#77a99b', roughness: 0.42, metalness: 0, transparent: true, opacity: 0.82 }),
  cloud: new THREE.MeshStandardMaterial({ color: '#eef1d9', roughness: 1, flatShading: true }),
  trunk: new THREE.MeshStandardMaterial({ color: '#876443', roughness: 1, flatShading: true }),
};
const blocks = [];
const blockKey = (x, y, z) => `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
const allowedTypes = new Set(['grass', 'dirt', 'stone', 'wood', 'leaves', 'sand', 'water', 'flower']);
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
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
};
const heightAt = (x, z) => {
  const d = Math.sqrt((x * x) / 1.08 + (z * z) / 0.9);
  if (d > 11.4) return null;
  const edge = Math.max(0, 1 - d / 12);
  return Math.max(0, Math.min(4, Math.floor(edge * 2.25 + 0.7 + Math.sin(x * 0.7) * 0.22 + Math.cos(z * 0.5) * 0.25 + rand(x, z) * 0.58)));
};

// A layered, hand-built island: grass crown, earthy voxel strata and a narrow sandy shoreline.
for (let x = -12; x <= 12; x++) {
  for (let z = -12; z <= 12; z++) {
    const d = Math.sqrt((x * x) / 1.08 + (z * z) / 0.9);
    const h = heightAt(x, z);
    if (h === null) continue;
    const coast = d > 9.1;
    for (let y = -2; y < h; y++) {
      const top = y === h - 1;
      addBlock(x, y, z, top ? (coast ? 'sand' : 'grass') : y < h - 2 ? 'stone' : 'dirt');
    }
  }
}

// Quiet water around the island, kept low to leave the stepped shoreline visible.
const water = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat.water);
water.rotation.x = -Math.PI / 2;
water.position.y = -1.78;
water.receiveShadow = true;
scene.add(water);

// Trees with deliberately chunky, squared-off canopies.
function tree(x, z, scale = 1) {
  const h = heightAt(x, z);
  if (h === null) return;
  const ground = h - 0.5;
  for (let i = 0; i < 3 * scale; i++) addBlock(x, ground + 1 + i, z, 'wood');
  const crownY = ground + 3 * scale;
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
tree(-5, -2, 1); tree(-8, 2, 1); tree(4, -5, 1); tree(7, 1, 1); tree(-2, 7, 1);

// Small outcrops and scattered flowers add a little life to the open meadow.
for (const [x, z, h] of [[-4, 4, 1], [5, 4, 2], [1, -8, 1], [-7, -5, 1]]) {
  const base = heightAt(x, z);
  if (base !== null) for (let y = 0; y < h; y++) addBlock(x, base + y, z, 'stone');
}
for (let x = -9; x <= 9; x++) for (let z = -9; z <= 9; z++) {
  if (rand(x * 2 + 3, z * 2 - 1) > 0.965) {
    const h = heightAt(x, z);
    if (h !== null && h >= 1 && Math.abs(x) + Math.abs(z) > 7) addBlock(x, h, z, 'flower');
  }
}

// Restore the player's edits on return; the untouched landscape is generated deterministically.
const baseBlockKeys = new Set(blocks.map(block => blockKey(block.position.x, block.position.y, block.position.z)));
const removedBase = new Set();
let savedPlacements = [];
const isValidPosition = p => p && [p.x, p.y, p.z].every(Number.isFinite) && Math.abs(p.x) < 32 && p.y > -3 && p.y < 20 && Math.abs(p.z) < 32;
try {
  const saved = JSON.parse(localStorage.getItem('bloque-world-v1') || 'null');
  if (saved?.format === 'bloque-world' && saved.version === 1) {
    for (const key of Array.isArray(saved.removed) ? saved.removed : []) {
      if (!baseBlockKeys.has(key)) continue;
      removedBase.add(key);
      const target = blocks.find(block => blockKey(block.position.x, block.position.y, block.position.z) === key);
      if (target) { scene.remove(target); blocks.splice(blocks.indexOf(target), 1); }
    }
    const occupied = new Set(blocks.map(block => blockKey(block.position.x, block.position.y, block.position.z)));
    for (const item of Array.isArray(saved.placed) ? saved.placed.slice(0, 2000) : []) {
      if (!allowedTypes.has(item.type) || !isValidPosition(item) || occupied.has(blockKey(item.x, item.y, item.z))) continue;
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
  format: 'bloque-world', version: 1, seed: 847201,
  removed: [...removedBase], placed: savedPlacements,
});
function persistWorld() {
  try { localStorage.setItem('bloque-world-v1', JSON.stringify(worldSaveData())); return true; }
  catch (error) { console.warn('No se pudo guardar el mundo en este dispositivo.', error); return false; }
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
raycaster.far = 9;
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
  if (e.shiftKey) {
    const normal = hit.face.normal.clone().applyQuaternion(hit.object.quaternion);
    const p = hit.object.position.clone().add(normal);
    if (p.y > 8) return toast('¡Hasta las nubes, no!');
    const position = { x: Math.round(p.x), y: Math.round(p.y), z: Math.round(p.z) };
    if (blocks.some(block => blockKey(block.position.x, block.position.y, block.position.z) === blockKey(position.x, position.y, position.z))) return toast('Ya hay un bloque en ese lugar.');
    const added = addBlock(position.x, position.y, position.z, selectedType);
    added.userData.userPlaced = true;
    savedPlacements.push({ ...position, type: selectedType });
    persistWorld();
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
    persistWorld();
    outline.visible = false;
    removedCount++;
    toast(removedCount === 1 ? 'Primer bloque roto. ¡Buen comienzo!' : 'Bloque recogido');
  }
});

const slots = [...document.querySelectorAll('.slot')];
const slotTypes = ['grass', 'dirt', 'stone', 'wood', 'leaves', 'sand', 'water', 'flower'];
function selectSlot(index) {
  if (index < 0 || index >= slots.length) return;
  slots.forEach((slot, i) => slot.classList.toggle('selected', i === index));
  selectedType = slotTypes[index];
  document.querySelector('#selectedName').textContent = slots[index].dataset.name;
}
slots.forEach((slot, index) => slot.addEventListener('click', () => selectSlot(index)));
window.addEventListener('keydown', e => {
  if (/^[1-8]$/.test(e.key)) selectSlot(Number(e.key) - 1);
  if (e.key.toLowerCase() === 'i') inventoryPanel.hidden = !inventoryPanel.hidden;
  if (e.key === 'Escape') inventoryPanel.hidden = true;
});
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
      format: 'bloque-world', version: 1, seed: 847201,
      removed: data.removed.filter(key => typeof key === 'string' && baseBlockKeys.has(key)),
      placed: data.placed.filter(item => allowedTypes.has(item?.type) && isValidPosition(item)).slice(0, 2000).map(item => ({ x: Math.round(item.x), y: Math.round(item.y), z: Math.round(item.z), type: item.type })),
    };
    localStorage.setItem('bloque-world-v1', JSON.stringify(safeData));
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
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  const time = clock.getElapsedTime();
  water.position.y = -1.78 + Math.sin(time * 0.55) * 0.018;
  renderer.render(scene, camera);
}
animate();

let minutes = 41;
setInterval(() => {
  minutes = (minutes + 1) % 60;
  const hour = minutes === 0 ? 10 : 9;
  document.querySelector('#clock').textContent = `DÍA 01 · ${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}, 18000);
