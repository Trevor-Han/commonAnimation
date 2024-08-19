import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import GUI from "lil-gui";
import slicedVertexShader from "./shaders/sliced/vertex.glsl";
import slicedFragmentShader from "./shaders/sliced/fragment.glsl";
import {carColor} from './carColor.js'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 325 });
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Loaders
const rgbeLoader = new RGBELoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Environment map
 */
rgbeLoader.load("./aerodynamics_workshop.hdr", (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = environmentMap;
    scene.backgroundBlurriness = 0.5;
    scene.environment = environmentMap;
});

/**
 * Sliced model
 */
const uniforms = {
    uSliceStart: new THREE.Uniform(1.75),
    uSliceArc: new THREE.Uniform(1.25),
    uSliceStartY: new THREE.Uniform(0),
    uSliceWidth: new THREE.Uniform(500),
    uMinWidth: new THREE.Uniform(-500),
};

const patchMap = {
    csm_Slice: {
        "#include <colorspace_fragment>": `
            #include <colorspace_fragment>

            if(!gl_FrontFacing)
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        `, // it MUST have the same name in order to work
    },
};

gui.add(uniforms.uSliceStart, "value", -Math.PI, Math.PI, 0.001).name(
    "uSliceStart"
);
gui.add(uniforms.uSliceStart, "value", 0, Math.PI * 2, 0.001).name("uSliceArc");
gui.add(uniforms.uSliceWidth, "value", -500, 500, 0.001).name("uSliceWidth");
gui.add(uniforms.uSliceStartY, "value", -500, 500, 0.001).name("uSliceStartY");

// Material
const material = new THREE.MeshStandardMaterial({
    metalness: 0.5,
    roughness: 0.25,
    envMapIntensity: 0.5,
    color: "#858080",
});

/*const slicedMaterial = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshStandardMaterial,
    silent: true,
    vertexShader: slicedVertexShader,
    fragmentShader: slicedFragmentShader,
    uniforms,
    patchMap,

    // MeshStandardMaterial
    metalness: 0.5,
    roughness: 0.25,
    envMapIntensity: 0.5,
    // color: "#26d6e9",
    side: THREE.DoubleSide,
});*/

const slicedMaterial = (config )=>{
    return new CustomShaderMaterial({
        // CSM
        baseMaterial: THREE.MeshStandardMaterial,
        silent: true,
        vertexShader: slicedVertexShader,
        fragmentShader: slicedFragmentShader,
        uniforms,
        patchMap,

        // MeshStandardMaterial
        metalness: 0.5,
        roughness: 0.25,
        envMapIntensity: 0.5,
        color: config?.color || new THREE.Color(38,214,233),
        transparent: config?.transparent || false,
        opacity: config?.opacity || 1,
        side: THREE.DoubleSide,
    });
}

const slicedDepthMaterial = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshDepthMaterial,
    silent: true,
    vertexShader: slicedVertexShader,
    fragmentShader: slicedFragmentShader,
    uniforms,
    patchMap,

    // MeshStandardMaterial
    depthPacking: THREE.RGBADepthPacking,
});

// Model
let model = null;
/*gltfLoader.load("./gears.glb", (gltf) => {
    model = gltf.scene;

    model.traverse((child) => {
        // Check if it's a mesh and not anything else like camera ecc.
        if (child.isMesh) {
            if (child.name === "outerHull") {
                // We want to apply our custom shaders ONLY to the outerHull, while the other parts of the model won't be changed
                child.material = slicedMaterial;
                child.customDepthMaterial = slicedDepthMaterial;
            } else {
                child.material = material;
            }
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    scene.add(model);
});*/
gltfLoader.load("./su7-car_edit.glb", (gltf) => {
    model = gltf.scene;

    model.traverse((child) => {
        // Check if it's a mesh and not anything else like camera ecc.
        if (child.isMesh) {
            console.log(child.name);
            const met = carColor[child.name]
            // We want to apply our custom shaders ONLY to the outerHull, while the other parts of the model won't be changed
            child.material = slicedMaterial(met);
            child.customDepthMaterial = slicedDepthMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    scene.add(model);
});

/**
 * Plane
 */
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10, 10),
    new THREE.MeshStandardMaterial({ color: "#aaaaaa" })
);
plane.receiveShadow = true;
plane.position.x = -4;
plane.position.y = -3;
plane.position.z = -4;
plane.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(plane);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
directionalLight.position.set(6.25, 3, 4);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.normalBias = 0.05;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    35,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.set(-5, 5, 12);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    if (model) {
        // Update model
        // model.rotation.y = elapsedTime * 0.1;
    }

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
