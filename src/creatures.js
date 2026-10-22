import * as THREE from 'three';

const PALETTES = {
  sheep: { body: '#e6e2ce', face: '#b18a69', legs: '#675c50', name: 'oveja' },
  fox: { body: '#d27f4d', face: '#f1d3a1', legs: '#503d36', name: 'zorro' },
  slime: { body: '#718f92', face: '#38595b', legs: '#58777b', name: 'moco de sombra' },
  mushroom: { body: '#d59273', face: '#f3e5c7', legs: '#e8ddc1', name: 'hongo errante' },
};

export function createCreature(scene, geometry, type, x, y, z) {
  const palette = PALETTES[type];
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const box = (color, px, py, pz, sx, sy, sz) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true }));
    mesh.position.set(px, py, pz); mesh.scale.set(sx, sy, sz); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
  };
  if (type === 'sheep') {
    box(palette.body, 0, 0.68, 0, 0.95, 0.76, 0.68);
    box(palette.body, 0.47, 0.93, 0.05, 0.43, 0.43, 0.42);
    box(palette.face, 0.68, 0.91, 0.12, 0.22, 0.25, 0.3);
    for (const sx of [-0.3, 0.3]) for (const sz of [-0.2, 0.2]) box(palette.legs, sx, 0.22, sz, 0.16, 0.42, 0.16);
    box('#293b38', 0.68, 1, 0.275, 0.035, 0.045, 0.025);
  } else if (type === 'fox') {
    box(palette.body, 0, 0.55, 0, 1.05, 0.55, 0.56);
    box(palette.face, 0.48, 0.77, 0.04, 0.43, 0.43, 0.4);
    box(palette.face, 0.72, 0.66, 0.05, 0.3, 0.18, 0.24);
    box(palette.body, -0.65, 0.73, 0, 0.48, 0.35, 0.35);
    box('#f1d7b0', -0.89, 0.78, 0, 0.16, 0.17, 0.2);
    for (const sx of [-0.31, 0.33]) for (const sz of [-0.16, 0.16]) box(palette.legs, sx, 0.2, sz, 0.14, 0.38, 0.14);
    box('#343a35', 0.56, 0.83, 0.23, 0.045, 0.06, 0.025);
  } else if (type === 'slime') {
    box(palette.body, 0, 0.43, 0, 0.9, 0.85, 0.9);
    box('#e2eee0', -0.2, 0.5, 0.46, 0.12, 0.15, 0.035);
    box('#e2eee0', 0.2, 0.5, 0.46, 0.12, 0.15, 0.035);
    box('#253d3c', -0.2, 0.5, 0.49, 0.045, 0.09, 0.025);
    box('#253d3c', 0.2, 0.5, 0.49, 0.045, 0.09, 0.025);
  } else {
    box(palette.body, 0, 0.52, 0, 0.7, 0.58, 0.7);
    box('#d77866', 0, 0.93, 0, 0.88, 0.2, 0.88);
    box(palette.face, 0, 0.26, 0, 0.28, 0.35, 0.28);
    box('#faf1d9', -0.12, 0.6, 0.32, 0.055, 0.07, 0.035);
    box('#faf1d9', 0.12, 0.6, 0.32, 0.055, 0.07, 0.035);
  }
  group.userData = { type, name: palette.name, hostile: type === 'slime', direction: Math.random() * Math.PI * 2, turnIn: Math.random() * 4, speed: type === 'fox' ? 1.55 : type === 'slime' ? 1.2 : 0.75, attackWait: 0, legs: group.children.filter((_, i) => type === 'sheep' ? i >= 3 && i <= 6 : type === 'fox' ? i >= 5 && i <= 8 : false) };
  scene.add(group);
  return group;
}

export function updateCreatures(creatures, dt, time, playerPosition, groundAt, isNight, onAttack = () => {}) {
  for (const creature of creatures) {
    const state = creature.userData;
    state.turnIn -= dt;
    state.attackWait -= dt;
    const dx = playerPosition.x - creature.position.x, dz = playerPosition.z - creature.position.z;
    const distance = Math.hypot(dx, dz);
    if (state.hostile && isNight && distance < 8) {
      state.direction = Math.atan2(dx, dz);
      if (distance < 1.35 && state.attackWait <= 0) { state.attackWait = 1.5; onAttack(); }
    } else if (state.turnIn <= 0) {
      state.direction += (Math.random() - 0.5) * 2.4;
      state.turnIn = 1.3 + Math.random() * 3.2;
    }
    const speed = state.hostile && isNight && distance < 8 ? state.speed * 1.25 : state.speed;
    const nx = creature.position.x + Math.sin(state.direction) * speed * dt;
    const nz = creature.position.z + Math.cos(state.direction) * speed * dt;
    const floor = groundAt(nx, nz);
    const currentFloor = groundAt(creature.position.x, creature.position.z);
    if (floor !== null && floor !== undefined && currentFloor !== null && Math.abs(floor - currentFloor) < 1.1) {
      creature.position.x = nx; creature.position.z = nz;
    } else state.direction += Math.PI * (0.7 + Math.random() * 0.6);
    const y = groundAt(creature.position.x, creature.position.z);
    if (y !== null && y !== undefined) creature.position.y = y + (state.type === 'slime' ? Math.abs(Math.sin(time * 4 + creature.position.x)) * 0.12 : Math.sin(time * 5 + creature.position.z) * 0.025);
    creature.rotation.y = state.direction;
    const gait = Math.sin(time * 8 + creature.position.z) * 0.22;
    state.legs.forEach((leg, index) => { leg.rotation.x = gait * (index % 2 ? -1 : 1); });
    if (state.type === 'slime') {
      const squish = 1 + Math.sin(time * 5 + creature.position.x) * 0.08;
      creature.scale.set(1, squish, 1);
    }
  }
}
