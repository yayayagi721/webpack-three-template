import * as THREE from "three";

export const addOriginArrowToScene = (scene) => {
  const xDir = new THREE.Vector3(1, 0, 0);
  const yDir = new THREE.Vector3(0, 1, 0);
  const zDir = new THREE.Vector3(0, 0, 1);
  scene.add(createArrowHelper(xDir, "red"));
  scene.add(createArrowHelper(yDir, "blue"));
  scene.add(createArrowHelper(zDir, "yellow"));
};

const createArrowHelper = (dir: THREE.Vector3, color, length = 1) => {
  const origin = new THREE.Vector3(0, 0, 0);
  return new THREE.ArrowHelper(dir, origin, length, color);
};
