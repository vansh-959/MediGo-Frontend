// Three.js 3D Floating Holographic Medical Globe & Particle Matrix Scene
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('three-hero-container');
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene, Camera, Renderer Setup
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060b13, 0.025);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Core Globe Group
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // 1. Holographic Sphere Wireframe Core
  const sphereGeo = new THREE.IcosahedronGeometry(5, 5);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x0ea5e9,
    wireframe: true,
    transparent: true,
    opacity: 0.18
  });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  globeGroup.add(sphereMesh);

  // 2. Inner Glowing Core
  const innerGeo = new THREE.SphereGeometry(4.7, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.08
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  globeGroup.add(innerMesh);

  // 3. Orbiting Rings (Medical Hologram Rings)
  const ringGeo1 = new THREE.RingGeometry(6.2, 6.3, 64);
  const ringMat1 = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 3;
  globeGroup.add(ring1);

  const ringGeo2 = new THREE.RingGeometry(7.0, 7.08, 64);
  const ringMat2 = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3
  });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.rotation.y = Math.PI / 4;
  globeGroup.add(ring2);

  // 4. Hospital Node Beacons (Glowing Spheres on Globe Surface)
  const nodeCoords = [
    { lat: 40.71, lng: -74.00, name: "Apex Healthcare" },
    { lat: 40.73, lng: -73.93, name: "Metro General" },
    { lat: 40.78, lng: -73.97, name: "St. Jude Neuroscience" },
    { lat: 40.67, lng: -73.94, name: "Green Valley" },
    { lat: 40.75, lng: -73.98, name: "Horizon Children's" }
  ];

  const nodesGroup = new THREE.Group();
  globeGroup.add(nodesGroup);

  function latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  nodeCoords.forEach((node) => {
    const pos = latLngToVector3(node.lat, node.lng, 5.05);

    // Glowing Node Marker
    const markerGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(pos);
    nodesGroup.add(marker);

    // Outer Pulsing Aura Ring
    const auraGeo = new THREE.RingGeometry(0.2, 0.35, 32);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.position.copy(pos);
    aura.lookAt(0, 0, 0);
    nodesGroup.add(aura);
  });

  // 5. Floating Medical Particle Cloud (DNA / Molecule Particles)
  const particleCount = 450;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 30;
    particlePositions[i + 1] = (Math.random() - 0.5) * 30;
    particlePositions[i + 2] = (Math.random() - 0.5) * 30;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.12,
    transparent: true,
    opacity: 0.5
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Mouse Interactivity
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;

  const windowHalfX = width / 2;
  const windowHalfY = height / 2;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = (e.clientX - rect.left - windowHalfX);
    mouseY = (e.clientY - rect.top - windowHalfY);
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Constant slow rotation
    globeGroup.rotation.y += 0.003;
    ring1.rotation.z += 0.002;
    ring2.rotation.z -= 0.003;
    particleSystem.rotation.y -= 0.0005;

    // Smooth Mouse Influence
    targetRotationY = mouseX * 0.0003;
    targetRotationX = mouseY * 0.0003;

    globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.05;
    globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.05;

    renderer.render(scene, camera);
  }

  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    if (!container) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
  });
});
