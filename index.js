import { PointCloud, default as init } from "./pkg/wasm_gl.js";

// Globals.
let camera;
let scene;
let point_cloud;
let geometry;
let renderer;
let stats;
let pos_buffer_attr;
let col_buffer_attr;

let nb_particles = 1000000;
let speed = 5000;
let end_valid = 0;

// Prepare WebGL context with THREE.
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 200;
scene = new THREE.Scene();
scene.background = new THREE.Color( 0x050505 );

// Perpare visualization.
geometry = new THREE.BufferGeometry();
geometry.setDrawRange(0, end_valid);

// Run Forest!
run();

async function run() {
	// Initialize the wasm module.
	const wasm = await init("pkg/wasm_gl_bg.wasm");

	// Initialize the point cloud.
	point_cloud = PointCloud.new(nb_particles, speed);
	const positions = new Float32Array(
		wasm.memory.buffer,
		point_cloud.points(),
		3 * nb_particles
	);
	const colors = new Float32Array(
		wasm.memory.buffer,
		point_cloud.colors(),
		3 * nb_particles
	);

	// Bind geometry to THREE buffers.
	pos_buffer_attr = new THREE.BufferAttribute(positions, 3).setDynamic(true);
	col_buffer_attr = new THREE.BufferAttribute(colors, 3).setDynamic(true);
	geometry.addAttribute("position", pos_buffer_attr);
	geometry.addAttribute("color", col_buffer_attr);
	let material = new THREE.PointsMaterial({size: 1, vertexColors: THREE.VertexColors});
	let particles = new THREE.Points(geometry, material);
	scene.add(particles);

	// Setup the renderer.
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Display stats.
	stats = new Stats();
	document.body.appendChild(stats.dom);
	window.addEventListener('resize', onWindowResize);

	requestAnimationFrame(renderLoop);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function renderLoop() {
	let start_valid = end_valid;
	end_valid = point_cloud.tick();
	let nb_update = end_valid - start_valid;
	if (nb_update > 0) {
		geometry.setDrawRange(0, end_valid);
		pos_buffer_attr.updateRange.offset = start_valid;
		pos_buffer_attr.updateRange.count = end_valid - start_valid;
		pos_buffer_attr.needsUpdate = true;
		col_buffer_attr.updateRange.offset = start_valid;
		col_buffer_attr.updateRange.count = end_valid - start_valid;
		col_buffer_attr.needsUpdate = true;
	}
	renderer.render(scene, camera);
	stats.update();
	requestAnimationFrame(renderLoop);
}
