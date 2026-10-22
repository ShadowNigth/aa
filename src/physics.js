import * as THREE from 'three';

// Lightweight voxel collision/kinematics: gravity, grounded movement, step limits and jump impulse.
export class VoxelPlayer {
  constructor(scene, cubeGeometry, groundAt) {
    this.feet = new THREE.Vector3(0, groundAt(0, 0) ?? 0, 0);
    this.velocity = new THREE.Vector3();
    this.grounded = true;
    this.speed = 4.4;
    this.jumpVelocity = 7.6;
    this.height = 1.72;
    this.group = new THREE.Group();
    this.group.position.copy(this.feet);
    this.group.userData.kind = 'player';
    const make = (color, x, y, z, sx, sy, sz) => {
      const mesh = new THREE.Mesh(cubeGeometry, new THREE.MeshStandardMaterial({ color, roughness: 0.95, flatShading: true }));
      mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); mesh.castShadow = true; mesh.receiveShadow = true;
      this.group.add(mesh); return mesh;
    };
    make('#597e57', 0, 1.05, 0, 0.7, 0.78, 0.42);
    make('#e2bd8f', 0, 1.73, 0, 0.53, 0.54, 0.5);
    make('#48674d', -0.2, 0.35, 0, 0.23, 0.62, 0.28);
    make('#48674d', 0.2, 0.35, 0, 0.23, 0.62, 0.28);
    make('#e8eee0', -0.12, 1.78, 0.255, 0.055, 0.07, 0.035);
    make('#e8eee0', 0.12, 1.78, 0.255, 0.055, 0.07, 0.035);
    make('#34473c', -0.12, 1.78, 0.28, 0.024, 0.04, 0.02);
    make('#34473c', 0.12, 1.78, 0.28, 0.024, 0.04, 0.02);
    scene.add(this.group);
  }

  update(dt, input, camera, groundAt, collidesAt = () => false) {
    const forward = new THREE.Vector3(); camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    const wish = new THREE.Vector3();
    if (input.forward) wish.add(forward);
    if (input.back) wish.sub(forward);
    if (input.right) wish.add(right);
    if (input.left) wish.sub(right);
    if (wish.lengthSq()) wish.normalize();
    this.velocity.x = wish.x * this.speed;
    this.velocity.z = wish.z * this.speed;
    if (input.jump && this.grounded) { this.velocity.y = this.jumpVelocity; this.grounded = false; }

    const nextX = this.feet.x + this.velocity.x * dt;
    const nextZ = this.feet.z + this.velocity.z * dt;
    const nextGround = groundAt(nextX, nextZ);
    if (nextGround !== null && nextGround !== undefined && (nextGround - this.feet.y < 0.72 || !this.grounded) && !collidesAt(nextX, this.feet.y, nextZ)) {
      this.feet.x = nextX; this.feet.z = nextZ;
    } else { this.velocity.x = 0; this.velocity.z = 0; }

    this.velocity.y -= 19 * dt;
    const nextY = this.feet.y + this.velocity.y * dt;
    if (this.velocity.y > 0 && collidesAt(this.feet.x, nextY, this.feet.z)) this.velocity.y = 0;
    else this.feet.y = nextY;
    const ground = groundAt(this.feet.x, this.feet.z);
    if (ground !== null && ground !== undefined && this.feet.y <= ground) {
      this.feet.y = ground; this.velocity.y = 0; this.grounded = true;
    } else this.grounded = false;
    this.group.position.copy(this.feet);
    if (wish.lengthSq() > 0.01) this.group.rotation.y = Math.atan2(wish.x, wish.z);
  }
}
