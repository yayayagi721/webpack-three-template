import "./style.scss";
import fragmentShader from "./shader/fragmentShader.glsl";
import vertexShader from "./shader/vertexShader.glsl";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const main = async () => {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const canvas = document.querySelector(".webgl");

  const renderer = new THREE.WebGLRenderer({
    antialising: true,
    alpha: false,
    canvas: canvas,
  });

  const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    1000
  );
  const scene = new THREE.Scene();

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    },

    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const ambientLight = new THREE.AmbientLight("#fff", 1);

  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(sizes.width, sizes.height);

  camera.position.z = 2;

  scene.add(ambientLight);

  const update = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
};

main();
