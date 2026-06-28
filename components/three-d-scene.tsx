'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json';

/* ===== Text3D helper ===== */
function makeText(text: string, font: any, color: number, opts: Record<string, unknown> = {}): THREE.Mesh {
  const geo = new TextGeometry(text, { font, size: 0.45, depth: 0.12, curveSegments: 12, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.01, bevelSegments: 6 } as any);
  geo.computeBoundingBox();
  const cx = (geo.boundingBox!.max.x - geo.boundingBox!.min.x) / 2;
  geo.translate(-cx, -0.15, 0);
  const mat = new THREE.MeshPhysicalMaterial({
    color, metalness: 0.9, roughness: 0.06, clearcoat: 0.6, clearcoatRoughness: 0.08,
    emissive: color, emissiveIntensity: 0.12,
    ...opts,
  });
  return new THREE.Mesh(geo, mat);
}

/* ===== Build school objects ===== */

function makePen(env: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const mk = (c: number, o: Record<string, unknown> = {}) => new THREE.MeshPhysicalMaterial({ color: c, envMap: env, metalness: 0.85, roughness: 0.08, ...o });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 32), mk(0x1e293b, { clearcoat: 0.3 }));
  body.rotation.x = Math.PI / 2; g.add(body);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 24), mk(0x94a3b8, { roughness: 0.05, metalness: 0.95 }));
  tip.position.z = 0.47; tip.rotation.x = Math.PI / 2; g.add(tip);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.08, 24), mk(0x3b82f6, { roughness: 0.12, clearcoat: 0.8 }));
  cap.position.z = -0.47; cap.rotation.x = Math.PI / 2; g.add(cap);
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.22, 0.015), mk(0x94a3b8, { roughness: 0.05, metalness: 0.95 }));
  clip.position.set(0.095, 0, -0.4); clip.rotation.z = 0.15; g.add(clip);
  g.scale.set(1.2, 1.2, 1.2);
  return g;
}

function makeCalc(env: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const mk = (c: number, o: Record<string, unknown> = {}) => new THREE.MeshPhysicalMaterial({ color: c, envMap: env, ...o });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.12), mk(0x1e293b, { metalness: 0.7, roughness: 0.1, clearcoat: 0.5 }));
  g.add(body);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.02), mk(0x06b6d4, { emissive: 0x06b6d4, emissiveIntensity: 0.8, roughness: 0.05, metalness: 0 }));
  screen.position.set(0, 0.3, 0.07); g.add(screen);
  for (let i = 0; i < 12; i++) {
    const gold = i >= 9;
    const btn = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.025), mk(gold ? 0xf59e0b : 0x334155, { metalness: 0.3, roughness: 0.3 }));
    btn.position.set(-0.28 + (i % 3) * 0.28, 0.05 - Math.floor(i / 3) * 0.18, 0.07);
    g.add(btn);
  }
  g.scale.set(0.7, 0.7, 0.7);
  return g;
}

function makeBook(env: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const mk = (c: number, o: Record<string, unknown> = {}) => new THREE.MeshPhysicalMaterial({ color: c, envMap: env, ...o });
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.05, 0.03), mk(0x1e3a5f, { roughness: 0.5, clearcoat: 0.15 }));
  back.position.z = -0.02; g.add(back);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.01, 0.06), mk(0xf8fafc, { roughness: 0.8 }));
  pages.position.y = 0.02; g.add(pages);
  const front = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.05, 0.03), mk(0x2563eb, { roughness: 0.3, clearcoat: 0.4 }));
  front.position.z = 0.04; g.add(front);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.9, 0.08), mk(0x1e40af, { roughness: 0.4 }));
  spine.position.set(-0.38, 0, 0.01); spine.rotation.y = -0.06; g.add(spine);
  g.scale.set(0.5, 0.5, 0.5);
  return g;
}

function makeGlobe(env: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const mk = (c: number, o: Record<string, unknown> = {}) => new THREE.MeshPhysicalMaterial({ color: c, envMap: env, ...o });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.35, 48, 48), mk(0x3b82f6, { roughness: 0.15, metalness: 0.3, emissive: 0x3b82f6, emissiveIntensity: 0.08 }));
  g.add(sphere);
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.01, 16, 48), mk(0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.6 }));
    ring.rotation.x = Math.PI / 2 + i * Math.PI / 3;
    ring.rotation.z = i * 0.4;
    g.add(ring);
  }
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.15, 12), mk(0x64748b, { metalness: 0.8, roughness: 0.15 }));
  stand.position.y = -0.4; g.add(stand);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 24), mk(0x475569, { metalness: 0.8, roughness: 0.15 }));
  base.position.y = -0.47; g.add(base);
  g.scale.set(0.8, 0.8, 0.8);
  return g;
}

function makeCap(env: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const mk = (c: number, o: Record<string, unknown> = {}) => new THREE.MeshPhysicalMaterial({ color: c, envMap: env, ...o });
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.7), mk(0x1e293b, { roughness: 0.4 }));
  g.add(board);
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.04, 20, 20), mk(0x3b82f6, { emissive: 0x3b82f6, emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.1 }));
  button.position.y = 0.02; g.add(button);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 24), mk(0x0f172a, { roughness: 0.6 }));
  band.position.y = -0.02; g.add(band);
  const tassel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.005, 0.005), mk(0xf59e0b, { emissive: 0xf59e0b, emissiveIntensity: 0.3 }));
  tassel.position.set(0.36, -0.01, 0); tassel.rotation.x = 0.2; g.add(tassel);
  const tasselEnd = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), mk(0xf59e0b, { emissive: 0xf59e0b, emissiveIntensity: 0.35 }));
  tasselEnd.position.set(0.56, -0.06, 0); g.add(tasselEnd);
  g.scale.set(0.55, 0.55, 0.55);
  return g;
}

/* ===== New decorative objects ===== */

function makeAtom(env: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const mk = (c: number, o: Record<string, unknown> = {}) => new THREE.MeshPhysicalMaterial({ color: c, envMap: env, ...o });
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20), mk(0xf59e0b, { emissive: 0xf59e0b, emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.2 }));
  g.add(nucleus);
  for (let i = 0; i < 3; i++) {
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.006, 12, 32), mk(0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 0.3, metalness: 0.5, roughness: 0.2, transparent: true, opacity: 0.7 }));
    orbit.rotation.x = Math.PI / 2;
    orbit.rotation.y = (i / 3) * Math.PI;
    orbit.rotation.z = (i / 3) * Math.PI * 0.5;
    g.add(orbit);
  }
  return g;
}

function makeTorusKnot(env: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xa78bfa, envMap: env, metalness: 0.7, roughness: 0.1,
    emissive: 0xa78bfa, emissiveIntensity: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.05,
  });
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.25, 0.08, 100, 16), mat);
  g.add(knot);
  return g;
}

function makeOctahedron(env: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4, envMap: env, metalness: 0.8, roughness: 0.05,
    emissive: 0x06b6d4, emissiveIntensity: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.02,
    transparent: true, opacity: 0.85,
  });
  const oct = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), mat);
  oct.castShadow = true;
  g.add(oct);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.15 });
  const wire = new THREE.Mesh(new THREE.OctahedronGeometry(0.21, 0), wireMat);
  g.add(wire);
  g.scale.set(0.9, 0.9, 0.9);
  return g;
}

function makeSphereRing(env: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const count = 12;
  const colors = [0x3b82f6, 0x6366f1, 0x06b6d4, 0xa78bfa, 0xf59e0b, 0x22c55e];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const c = colors[i % colors.length];
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12),
      new THREE.MeshPhysicalMaterial({ color: c, envMap: env, emissive: c, emissiveIntensity: 0.2, metalness: 0.5, roughness: 0.1 }));
    s.position.set(Math.cos(a) * 0.4, Math.sin(a) * 0.4, 0);
    g.add(s);
  }
  return g;
}

/* ===== Particles (primary) ===== */
function makeParticles(): THREE.Points {
  const count = 400;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 3 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.cos(phi) * 0.4;
    pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.04, color: 0x60a5fa, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  const p = new THREE.Points(geo, mat);
  p.userData = { rotSpeed: 0.008 };
  return p;
}

/* ===== Starfield (distant tiny stars) ===== */
function makeStarfield(): THREE.Points {
  const count = 200;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3] = (Math.random() - 0.5) * 50;
    pos[i*3+1] = (Math.random() - 0.5) * 30;
    pos[i*3+2] = (Math.random() - 0.5) * 50 - 10;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.015, color: 0xffffff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  return new THREE.Points(geo, mat);
}

/* ===== Environment ===== */
function makeEnv(renderer: THREE.WebGLRenderer): THREE.Texture {
  const scene = new THREE.Scene();
  const colors = [0x3b82f6, 0x6366f1, 0x06b6d4, 0x0a0a2a, 0xf59e0b];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const light = new THREE.DirectionalLight(colors[i % colors.length], 100);
    light.position.set(Math.cos(a) * 20, Math.sin(a * 2) * 10, Math.sin(a) * 20);
    scene.add(light);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene).texture;
  pmrem.dispose();
  return env;
}

/* ===== Component ===== */
export default function ThreeDBackground({ scrollY }: { scrollY: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollY);
  scrollRef.current = scrollY;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    let sy = 0;
    let destroyed = false;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    /* Scene */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080818);
    scene.fog = new THREE.FogExp2(0x080818, 0.035);

    /* Camera */
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 60);
    camera.position.set(0, 0.3, 5);

    /* Lights */
    scene.add(new THREE.AmbientLight(0x404080, 0.3));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(6, 10, 4); key.castShadow = true;
    key.shadow.mapSize.width = 1024; key.shadow.mapSize.height = 1024;
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 20;
    key.shadow.bias = -0.001;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x3b82f6, 1.0); fill.position.set(-4, 3, -5); scene.add(fill);
    const rim = new THREE.DirectionalLight(0x6366f1, 0.6); rim.position.set(0, -5, 2); scene.add(rim);
    const top = new THREE.DirectionalLight(0x22d3ee, 0.4); top.position.set(0, 8, 0); scene.add(top);
    scene.add(new THREE.HemisphereLight(0x3b82f6, 0x0f172a, 0.5));

    /* Env */
    const env = makeEnv(renderer);

    /* Scroll group for parallax */
    const scrollGroup = new THREE.Group();
    scene.add(scrollGroup);

    const items: { obj: THREE.Object3D; baseY: number; rotY: number; speed: number; float: number; extra?: (t: number) => void }[] = [];
    const add = (obj: THREE.Object3D, x: number, y: number, z: number, rotX: number, rotY: number, speed: number, floatAmp: number, extra?: (t: number) => void) => {
      obj.position.set(x, y, z);
      obj.rotation.x = rotX;
      obj.rotation.y = rotY;
      obj.castShadow = true;
      obj.traverse((c) => { if (c instanceof THREE.Mesh) { c.castShadow = true; c.receiveShadow = true; if (Array.isArray(c.material)) c.material.forEach(m => { m.envMap = env; }); else c.material.envMap = env; }});
      scrollGroup.add(obj);
      items.push({ obj, baseY: y, rotY, speed, float: floatAmp, extra });
    };

    /* Font text */
    const textItems: { text: string; x: number; y: number; z: number; rotX: number; rotY: number; speed: number; float: number; color: number }[] = [
      { text: 'MATH', x: -1.8, y: 1.8, z: 0.2, rotX: 0.2, rotY: 0.5, speed: 0.06, float: 0.08, color: 0xf59e0b },
      { text: 'A+', x: 2, y: 2.2, z: -0.3, rotX: -0.1, rotY: -0.3, speed: 0.08, float: 0.1, color: 0x22c55e },
      { text: 'EDU', x: -2, y: -1.8, z: 0.4, rotX: 0.15, rotY: 0.4, speed: 0.05, float: 0.07, color: 0x3b82f6 },
      { text: 'SCIENCE', x: 2.2, y: -1.5, z: -0.5, rotX: -0.05, rotY: -0.2, speed: 0.04, float: 0.06, color: 0x06b6d4 },
      { text: 'BOOK', x: 0, y: 2.8, z: -0.4, rotX: 0, rotY: 0.1, speed: 0.03, float: 0.05, color: 0xa78bfa },
    ];

    const loader = new FontLoader();
    loader.load(FONT_URL, (font) => {
      if (destroyed) return;
      for (const t of textItems) {
        const mesh = makeText(t.text, font, t.color);
        add(mesh, t.x, t.y, t.z, t.rotX, t.rotY, t.speed, t.float);
      }
    }, undefined, () => {
      console.warn('Font load failed, skipping 3D text');
    });

    /* School objects */
    add(makePen(env), -1.5, 0.8, 0.6, 0.3, 0.5, 0.12, 0.1);
    add(makeCalc(env), 1.8, 0.3, -0.3, 0.1, -0.3, 0.05, 0.08);
    add(makeBook(env), -1.3, -0.8, 0.8, 0, 0.4, 0.04, 0.06);
    add(makeGlobe(env), 1.5, -0.8, -0.5, 0.1, -0.2, 0.07, 0.08);
    add(makeCap(env), 0, -1.8, 0, 0.1, -0.1, 0.05, 0.07);

    /* New decorative objects */
    add(makeAtom(env), -2.2, 0.2, -0.6, 0.1, 0.3, 0.06, 0.09);
    add(makeTorusKnot(env), 2, -0.1, 0.8, 0.3, 0.2, 0.04, 0.07);
    add(makeOctahedron(env), -0.5, 1.2, 1.2, 0.2, 0.5, 0.08, 0.06);
    add(makeSphereRing(env), -1, 1.8, -0.8, 0.3, 0.1, 0.03, 0.05);

    /* Particles */
    const particles = makeParticles();
    scene.add(particles);

    /* Starfield */
    const starfield = makeStarfield();
    scene.add(starfield);

    /* Ground with grid */
    const groundMat = new THREE.MeshPhysicalMaterial({ color: 0x0a0a1a, envMap: env, envMapIntensity: 0.2, metalness: 0.08, roughness: 0.6, transparent: true, opacity: 0.5 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(12, 24, 0x1e3a5f, 0x1e3a5f);
    gridHelper.position.y = -2.18;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    scene.add(particles);

    /* Mouse */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouse = (e: MouseEvent) => { mouse.tx = (e.clientX / window.innerWidth) * 2 - 1; mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1; };
    window.addEventListener('mousemove', onMouse, { passive: true });

    /* Resize */
    const onResize = () => {
      const cw = container.clientWidth, ch = container.clientHeight;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    };
    window.addEventListener('resize', onResize);

    /* Animation */
    let time = 0;
    let angle = 0;
    function animate() {
      if (destroyed) return;
      requestAnimationFrame(animate);
      const dt = 0.016;
      time += dt;
      sy = scrollRef.current;

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      angle += dt * 0.008;

      const ox = Math.sin(angle) * 0.3 + mouse.x * 0.2;
      const oy = Math.sin(angle * 0.6) * 0.1 + mouse.y * 0.15;
      camera.position.x += (ox - camera.position.x) * 0.015;
      camera.position.y += (oy + 0.3 - sy * 0.3 - camera.position.y) * 0.015;
      camera.position.z += (5 + sy * 1.5 - camera.position.z) * 0.015;
      camera.lookAt(0, 0, 0);

      scrollGroup.position.y = -sy * 0.3;

      for (const it of items) {
        it.obj.rotation.y += dt * it.speed;
        it.obj.position.y = it.baseY + Math.sin(time * 0.4 + it.speed * 10) * it.float;
        if (it.extra) it.extra(time);
      }

      particles.rotation.y += dt * 0.008;
      starfield.rotation.y += dt * 0.002;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      destroyed = true;
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none" />;
}
