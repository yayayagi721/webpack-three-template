import "./style.scss";
import fragmentShader from "./shader/fragmentShader.glsl";
import vertexShader from "./shader/vertexShader.glsl";
import { addOriginArrowToScene } from "./helper/common";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GeoTIFFImage, fromUrl, ReadRasterResult } from "geotiff";
import fastMax from "fast-max";

const url = "https://image-cog.s3.ap-northeast-1.amazonaws.com/cog-dem10b.tif";
const UP_VECTOR = new THREE.Vector3(0, 1, 0);
const NON_VALUE = -9999;

const getRasterDataByBBox = async (): Promise<ReadRasterResult> => {
  const tiff = await fromUrl(url);

  const imageData = await tiff.readRasters(<any>{
    bbox: [139.5, 35.5, 140, 36], // lng1,lat1,lng2,lat2
    resX: 0.01,
    resY: 0.01,
  });

  return imageData;
};

const createGraphGeometryByReadRasterResult = (result: ReadRasterResult) => {
  const buffer = result[0];

  const vertexes = [];
  const indexes = [];

  const height = result.height;
  const width = result.width;

  const max = fastMax(buffer as any);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = x + y * width;
      const percentY = y / (height - 1);
      const percentX = x / (width - 1);

      const demHeight = NON_VALUE !== buffer[index] ? buffer[index] / max : 0;

      const pointOnPlane = new THREE.Vector3(
        (percentX - 0.5) * 2,
        demHeight,
        (percentY - 0.5) * 2
      );

      vertexes.push(pointOnPlane);

      if (x !== width - 1 && y !== height - 1) {
        indexes.push(index);
        indexes.push(index + width + 1);
        indexes.push(index + width);

        indexes.push(index);
        indexes.push(index + 1);
        indexes.push(index + width + 1);
      }
    }
  }

  const _vertices: number[] = [];
  vertexes.forEach((vector) => {
    _vertices.push(vector.x);
    _vertices.push(vector.y);
    _vertices.push(vector.z);
  });

  const verticesArray = new Float32Array(_vertices);

  const indexesArray = new Uint32Array(indexes);

  const geometry: THREE.BufferGeometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(verticesArray, 3)
  );

  geometry.setIndex(new THREE.BufferAttribute(indexesArray, 1));

  return geometry;
};

const createGraphGeometryByBBox = async () => {
  const result = await getRasterDataByBBox();
  return createGraphGeometryByReadRasterResult(result);
};

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
  addOriginArrowToScene(scene);

  const geometry = await createGraphGeometryByBBox();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    },
    wireframe: true,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
  const graph = new THREE.Mesh(geometry, material);

  scene.add(graph);

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
