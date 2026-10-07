// 3D vizitky (Three.js) – fyzicky vyzerajúce karty s hrúbkou, svetlom a tieňom
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function texFrom(url, renderer) {
  return new Promise((res) => {
    new THREE.TextureLoader().load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      res(t);
    }, undefined, () => res(null));
  });
}

/**
 * cards: [{ front, back, w, h, pos:[x,y,z], rot:[x,y,z], finish:'matte'|'soft'|'gloss', edge:'#hex', thick }]
 * opts: { camZ, fov, shadow, parallax, float, bg }
 */
export async function cardScene(el, cards, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr || 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = opts.exposure ?? 1.0;
  renderer.shadowMap.enabled = opts.shadow !== false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' });

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = opts.env ?? 0.55;

  const camera = new THREE.PerspectiveCamera(opts.fov || 30, 1, 1, 2000);
  camera.position.set(0, 0, opts.camZ || 260);

  const key = new THREE.DirectionalLight(0xffffff, opts.keyLight ?? 1.1);
  key.position.set(-80, 140, 180);
  key.castShadow = opts.shadow !== false;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -160; key.shadow.camera.right = 160; key.shadow.camera.top = 160; key.shadow.camera.bottom = -160;
  key.shadow.radius = 8; key.shadow.bias = -0.0005;
  scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, opts.ambient ?? 0.25));

  if (opts.shadow !== false) {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.ShadowMaterial({ opacity: opts.shadowOpacity ?? 0.22 }));
    ground.position.z = opts.groundZ ?? -40;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  const group = new THREE.Group();
  scene.add(group);
  const meshes = [];
  for (const c of cards) {
    const w = c.w || 90, h = c.h || 50, t = c.thick || 0.6;
    const [ft, bt] = await Promise.all([texFrom(c.front, renderer), texFrom(c.back || c.front, renderer)]);
    const finish = c.finish || 'matte';
    const face = (map) => new THREE.MeshPhysicalMaterial({
      map, roughness: finish === 'gloss' ? 0.28 : finish === 'soft' ? 0.85 : 0.62,
      clearcoat: finish === 'gloss' ? 1 : 0, clearcoatRoughness: 0.18, sheen: finish === 'soft' ? 0.4 : 0, sheenRoughness: 0.8,
    });
    const edge = new THREE.MeshStandardMaterial({ color: c.edge || '#EEE9DF', roughness: 0.9 });
    const geo = new THREE.BoxGeometry(w, h, t, 1, 1, 1);
    const mesh = new THREE.Mesh(geo, [edge, edge, edge, edge, face(ft), face(bt)]);
    mesh.castShadow = true;
    mesh.position.set(...(c.pos || [0, 0, 0]));
    mesh.rotation.set(...(c.rot || [0, 0, 0]));
    mesh.userData = { base: mesh.position.clone(), rot: mesh.rotation.clone(), phase: Math.random() * Math.PI * 2 };
    group.add(mesh);
    meshes.push(mesh);
  }

  // veľkosť
  function resize() {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    if (opts.fit) { // aby sa karty vošli aj na úzkom displeji
      const need = opts.fit / camera.aspect;
      camera.position.z = Math.max(opts.camZ || 260, need);
    }
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(el);

  // pohyb myšou
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  if (opts.parallax !== false) window.addEventListener('pointermove', onMove, { passive: true });

  // drag otáčanie (voliteľné)
  let drag = null, spinY = 0, spinX = 0, velY = 0;
  if (opts.drag) {
    el.style.touchAction = 'pan-y'; el.style.cursor = 'grab';
    el.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, sy: spinY, sx: spinX }; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; });
    el.addEventListener('pointermove', (e) => { if (!drag) return; const ny = drag.sy + (e.clientX - drag.x) * 0.012; velY = ny - spinY; spinY = ny; spinX = Math.max(-0.6, Math.min(0.6, drag.sx + (e.clientY - drag.y) * 0.006)); kick(); });
    const up = () => { drag = null; el.style.cursor = 'grab'; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }

  // slučka len keď je scéna vidieť
  let visible = true, raf = 0, last = performance.now(), idleUntil = performance.now() + 4000;
  const clock = new THREE.Clock();
  function frame(now) {
    raf = 0;
    const tt = clock.getElapsedTime();
    cur.x += (target.x - cur.x) * 0.06; cur.y += (target.y - cur.y) * 0.06;
    if (!drag && opts.drag) { spinY += velY; velY *= 0.94; if (opts.autoSpin) spinY += opts.autoSpin; }
    group.rotation.y = cur.x * (opts.parallaxAmt ?? 0.25) + spinY;
    group.rotation.x = cur.y * (opts.parallaxAmt ?? 0.25) * 0.6 + spinX;
    if (opts.float !== false) meshes.forEach((m) => {
      m.position.y = m.userData.base.y + Math.sin(tt * 0.9 + m.userData.phase) * (opts.floatAmt ?? 1.6);
      m.rotation.z = m.userData.rot.z + Math.sin(tt * 0.6 + m.userData.phase) * 0.012;
    });
    renderer.render(scene, camera);
    const moving = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.001 || Math.abs(velY) > 0.0002 || drag;
    if (visible && !document.hidden && (opts.float !== false || opts.autoSpin || moving || now < idleUntil)) raf = requestAnimationFrame(frame);
    last = now;
  }
  function kick() { idleUntil = performance.now() + 1500; if (!raf && visible) raf = requestAnimationFrame(frame); }
  window.addEventListener('pointermove', kick, { passive: true });
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) kick(); }, { threshold: 0 });
  io.observe(el);
  document.addEventListener('visibilitychange', kick);
  kick();

  return {
    meshes, scene, camera, renderer, group,
    async setTexture(i, side, url) {
      const t = await texFrom(url, renderer); if (!t) return;
      const m = meshes[i].material[side === 'back' ? 5 : 4];
      if (m.map) m.map.dispose(); m.map = t; m.needsUpdate = true; kick();
    },
    setFinish(i, finish) {
      [4, 5].forEach((k) => { const m = meshes[i].material[k]; m.roughness = finish === 'gloss' ? 0.28 : finish === 'soft' ? 0.85 : 0.62; m.clearcoat = finish === 'gloss' ? 1 : 0; m.sheen = finish === 'soft' ? 0.4 : 0; m.needsUpdate = true; });
      kick();
    },
    setThickness(i, t, edgeColor) {
      const m = meshes[i]; const p = m.geometry.parameters;
      m.geometry.dispose(); m.geometry = new THREE.BoxGeometry(p.width, p.height, t);
      if (edgeColor) [0, 1, 2, 3].forEach((k) => m.material[k].color.set(edgeColor));
      kick();
    },
    spinTo(y) { spinY = y; kick(); },
    kick,
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); el.innerHTML = ''; },
  };
}
