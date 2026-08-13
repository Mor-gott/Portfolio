/* ============================================================
   CONTACT — your WhatsApp number, used across the site
   ============================================================ */
const WHATSAPP_LINK = 'https://wa.me/94783876112';

/* ============================================================
   SOLAR SYSTEM — the 9 planets rendered in the 3D background.
   Purely visual/interactive (drag to orbit, click to focus) —
   not tied to the service cards below.
   ============================================================ */
const SOLAR_PLANETS = [
  { name: 'MERCURY', order: 1, color: 0x9c9088, size: 0.26, dist: 4.2,  speed: 0.0180 },
  { name: 'VENUS',   order: 2, color: 0xd9b483, size: 0.40, dist: 5.6,  speed: 0.0140 },
  { name: 'EARTH',   order: 3, color: 0x4f8ff0, size: 0.42, dist: 7.2,  speed: 0.0118 },
  { name: 'MARS',    order: 4, color: 0xc1440e, size: 0.32, dist: 8.8,  speed: 0.0098 },
  { name: 'JUPITER', order: 5, color: 0xd8ae6d, size: 0.95, dist: 11.4, speed: 0.0062 },
  { name: 'SATURN',  order: 6, color: 0xe3c98f, size: 0.85, dist: 14.2, speed: 0.0048, hasRing: true },
  { name: 'URANUS',  order: 7, color: 0x9fd8d8, size: 0.58, dist: 16.6, speed: 0.0035 },
  { name: 'NEPTUNE', order: 8, color: 0x4062d8, size: 0.56, dist: 18.8, speed: 0.0028 },
  { name: 'PLUTO',   order: 9, color: 0xab9b8e, size: 0.16, dist: 20.8, speed: 0.0020 },
];

/* ============================================================
   CATALOG — service cards shown in the "Featured Projects" grid.
   Each entry's "image" points at a file inside a local "images"
   folder that sits next to index.html — drop your own photos in
   there using these exact filenames and they'll show up on the
   matching card automatically.
   ============================================================ */
const CATALOG_ITEMS = [
  {
    name: 'GRAPHIC DESIGNER', order: 1,
    desc: 'Graphic Designer & Photoshop expert specializing in striking photo manipulation, creative portraits, and dynamic visual storytelling.',
    image: 'images/graphic-designer.jpg',
    link: 'https://drive.google.com/drive/folders/1CxHi8clV6A4Qi9uU19Z8gc-y4tFKMzoP?usp=drive_link',
    cta: 'Check it out'
  },
  {
    name: 'UI/UX DESIGNER', order: 2,
    desc: 'UI/UX Designer crafting human centered web & mobile experiences with Figma | Design Systems & Interactive Prototyping',
    image: 'images/ui-ux-designer.jpg',
    link: 'https://drive.google.com/drive/folders/1fcJXDBZ3wVZ45ZMuSQstXKI5UeakMlpG?usp=drive_link',
    cta: 'Check it out'
  },
  {
    name: 'VIDEO EDITOR', order: 3,
    desc: 'Video Editor & Motion Designer | Transforming raw footage into visual stories with Adobe After Effects.',
    image: 'images/video-editor.jpg',
    link: 'https://www.tiktok.com/@_azper',
    cta: 'Check it out'
  },
];

/* ============================================================
   STARFIELD BACKGROUND (2D canvas, cheap ambient dust, full doc height)
   ============================================================ */
(function starfield() {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w * h) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.2,
      a: Math.random() * 0.6 + 0.15,
      tw: Math.random() * 0.015 + 0.003,
      dir: Math.random() > 0.5 ? 1 : -1
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      s.a += s.tw * s.dir;
      if (s.a > 0.85 || s.a < 0.1) s.dir *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(237,234,225,${s.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ============================================================
   SHARED COSMOS RENDERER
   One WebGL context, one canvas, fixed to the viewport. Every
   frame we render the main solar system full-window (visible only
   where the DOM above it is transparent — the hero + tour zone),
   then render N additional scenes into scissored rectangles that
   track the on-screen position of small placeholder <div>s: the
   catalog planets, the fact-section object, and the CTA orrery.
   This keeps every section genuinely 3D and interactive while
   using a single GL context for performance.
   ============================================================ */
const Cosmos = (function () {
  const canvas = document.getElementById('cosmos-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
  window.addEventListener('resize', resize);
  resize();

  const miniViewports = []; // { el, scene, camera, update(dt), onDrag(dx,dy), state }

  function registerViewport(el, scene, camera, update) {
    const state = { dragging: false, moved: false, lastX: 0, lastY: 0 };
    el.style.cursor = 'grab';

    el.addEventListener('pointerdown', (e) => {
      state.dragging = true; state.moved = false;
      state.lastX = e.clientX; state.lastY = e.clientY;
      e.preventDefault();
    });
    window.addEventListener('pointermove', (e) => {
      if (!state.dragging) return;
      const dx = e.clientX - state.lastX, dy = e.clientY - state.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) state.moved = true;
      if (update.onDrag) update.onDrag(dx, dy);
      state.lastX = e.clientX; state.lastY = e.clientY;
    });
    window.addEventListener('pointerup', () => { state.dragging = false; });
    window.addEventListener('pointercancel', () => { state.dragging = false; });
    // stop a drag-release from also firing a parent card's "select planet" click
    el.addEventListener('click', (e) => {
      if (state.moved) { e.stopPropagation(); state.moved = false; }
    }, true);

    miniViewports.push({ el, scene, camera, update, state });
  }

  let mainScene = null, mainCamera = null, mainUpdate = null;
  function setMain(scene, camera, update) { mainScene = scene; mainCamera = camera; mainUpdate = update; }

  function frame(t) {
    requestAnimationFrame(frame);

    if (mainUpdate) mainUpdate(t);

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    if (mainScene && mainCamera) {
      mainCamera.aspect = window.innerWidth / window.innerHeight;
      mainCamera.updateProjectionMatrix();
      renderer.render(mainScene, mainCamera);
    }

    renderer.setScissorTest(true);
    miniViewports.forEach(vp => {
      const rect = vp.el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return; // offscreen, skip

      if (vp.update.tick) vp.update.tick(t, vp.state.dragging);

      const x = Math.round(rect.left * renderer.getPixelRatio());
      const yBottom = Math.round((window.innerHeight - rect.top - rect.height) * renderer.getPixelRatio());
      const w = Math.round(rect.width * renderer.getPixelRatio());
      const h = Math.round(rect.height * renderer.getPixelRatio());

      renderer.setScissor(x, yBottom, w, h);
      renderer.setViewport(x, yBottom, w, h);
      vp.camera.aspect = rect.width / rect.height;
      vp.camera.updateProjectionMatrix();
      renderer.clearDepth();
      renderer.render(vp.scene, vp.camera);
    });
    renderer.setScissorTest(false);
  }
  requestAnimationFrame(frame);

  return { setMain, registerViewport, renderer };
})();

/* ============================================================
   MAIN SOLAR SYSTEM — hero + tour shared scene
   ============================================================ */
const solarSystem = (function () {
  const zone = document.getElementById('cosmos-zone');
  const tourSection = document.getElementById('tour');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);

  scene.add(new THREE.AmbientLight(0x445577, 0.55));
  const sunLight = new THREE.PointLight(0xfff2d0, 3.2, 300, 1.4);
  scene.add(sunLight);

  const sun = new THREE.Mesh(new THREE.SphereGeometry(2.1, 48, 48), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
  scene.add(sun);
  const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(2.7, 48, 48), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.18 }));
  scene.add(sunGlow);

  const planetMeshes = [];
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  SOLAR_PLANETS.forEach((p, i) => {
    const ringGeo = new THREE.RingGeometry(p.dist - 0.02, p.dist + 0.02, 128);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6fe3c8, transparent: true, opacity: 0.14, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    orbitGroup.add(ring);

    const geo = new THREE.SphereGeometry(p.size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.85, metalness: 0.05 });
    const mesh = new THREE.Mesh(geo, mat);
    const angle = Math.random() * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * p.dist, 0, Math.sin(angle) * p.dist);
    mesh.userData = { ...p, angle, index: i };
    orbitGroup.add(mesh);
    planetMeshes.push(mesh);

    if (p.hasRing) {
      const satRing = new THREE.Mesh(
        new THREE.RingGeometry(p.size * 1.4, p.size * 2.1, 48),
        new THREE.MeshBasicMaterial({ color: 0xd8c090, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
      );
      satRing.rotation.x = Math.PI / 2.3;
      mesh.add(satRing);
    }
  });

  const starCount = 1200;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 60 + Math.random() * 140;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i * 3 + 2] = r * Math.cos(phi);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.55 })));

  const rig = { azimuth: 0.5, polar: 1.15, distance: 34, targetAzimuth: 0.5, targetPolar: 1.15 };
  function updateCameraFromRig() {
    const x = rig.distance * Math.sin(rig.polar) * Math.cos(rig.azimuth);
    const y = rig.distance * Math.cos(rig.polar);
    const z = rig.distance * Math.sin(rig.polar) * Math.sin(rig.azimuth);
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }
  updateCameraFromRig();

  // drag rotates the whole cosmos, scoped to hero+tour zone
  let dragging = false, dragMoved = false, lastX = 0, lastY = 0, autoRotate = true;
  zone.addEventListener('pointerdown', (e) => {
    dragging = true; dragMoved = false; lastX = e.clientX; lastY = e.clientY; autoRotate = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    rig.targetAzimuth -= dx * 0.004;
    rig.targetPolar = Math.min(2.4, Math.max(0.5, rig.targetPolar - dy * 0.003));
    lastX = e.clientX; lastY = e.clientY;
  });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointercancel', () => { dragging = false; });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  zone.addEventListener('click', (e) => {
    if (dragMoved) return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(planetMeshes);
    if (hits.length) selectPlanet(hits[0].object.userData.index);
  });

  function updateScrollProgress() {
    const tourRect = tourSection.getBoundingClientRect();
    const vh = window.innerHeight;
    let progress = 1 - Math.min(1, Math.max(0, tourRect.top / vh));
    progress = Math.min(1, Math.max(0, progress));
    rig.distance = 34 - progress * 12;
  }

  let selectedIndex = -1;

  function selectPlanet(i) {
    selectedIndex = i;
    const mesh = planetMeshes[i];
    const targetAngle = Math.atan2(mesh.position.z, mesh.position.x);
    rig.targetAzimuth = targetAngle + 0.6;
  }
  selectPlanet(0);

  Cosmos.setMain(scene, camera, () => {
    updateScrollProgress();
    rig.azimuth += (rig.targetAzimuth - rig.azimuth) * 0.06;
    rig.polar += (rig.targetPolar - rig.polar) * 0.06;
    if (autoRotate) rig.targetAzimuth += 0.0009;
    updateCameraFromRig();

    planetMeshes.forEach((mesh) => {
      const p = mesh.userData; // per-mesh copy of its SOLAR_PLANETS entry
      p.angle += p.speed;
      mesh.position.set(Math.cos(p.angle) * p.dist, Math.sin(p.angle * 0.15) * 0.3, Math.sin(p.angle) * p.dist);
      mesh.rotation.y += 0.01;
      mesh.scale.setScalar(mesh.userData.index === selectedIndex ? 1.35 : 1);
    });
    sun.rotation.y += 0.0015;
  });

  return { selectPlanet };
})();

/* ============================================================
   CATALOG — service cards
   ============================================================ */
(function buildCatalog() {
  const grid = document.getElementById('catalog-grid');

  CATALOG_ITEMS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'planet-card';
    card.innerHTML = `
      <div class="badge">
        <span>${String(p.order).padStart(2, '0')} / ${String(CATALOG_ITEMS.length).padStart(2, '0')}</span>
      </div>
      <img class="card-img" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
      <h3>${p.name}</h3>
      <a class="checkout-btn" href="${p.link}" target="_blank" rel="noopener noreferrer">${p.cta} &rarr;</a>
    `;
    grid.appendChild(card);
  });
})();

/* ============================================================
   ABOUT ME & CONTACT IMAGES
   Same "images" folder as the work cards above — drop
   images/about-me.jpg and images/contact.jpg in there and
   they'll appear on the About me and Contact cards.
   ============================================================ */
(function addAboutAndContactImages() {
  const factCard = document.querySelector('.fact-card');
  if (factCard) {
    const aboutImg = document.createElement('img');
    aboutImg.className = 'about-img';
    aboutImg.src = 'images/about-me.jpg';
    aboutImg.alt = 'About me';
    aboutImg.loading = 'lazy';
    aboutImg.onerror = function () { this.style.display = 'none'; };
    factCard.insertBefore(aboutImg, factCard.firstChild);
  }

  const ctaSection = document.querySelector('.cta');
  if (ctaSection) {
    const contactImg = document.createElement('img');
    contactImg.className = 'contact-img';
    contactImg.src = 'images/contact.jpg';
    contactImg.alt = 'Contact';
    contactImg.loading = 'lazy';
    contactImg.onerror = function () { this.style.display = 'none'; };
    ctaSection.insertBefore(contactImg, ctaSection.firstChild);
  }
})();

/* ============================================================
   FACT SECTION — a small tumbling "forged element" object
   ============================================================ */
(function buildFactObject() {
  const el = document.getElementById('fact-object');
  if (!el) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 3.4);

  scene.add(new THREE.AmbientLight(0x554433, 0.6));
  const light = new THREE.PointLight(0xffcf8a, 2.4, 50);
  light.position.set(2, 2, 3);
  scene.add(light);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshStandardMaterial({ color: 0xe8b96a, emissive: 0x7a4d18, emissiveIntensity: 0.5, roughness: 0.4, metalness: 0.3, flatShading: true })
  );
  scene.add(core);

  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.15, 1)),
    new THREE.LineBasicMaterial({ color: 0x6fe3c8, transparent: true, opacity: 0.4 })
  );
  scene.add(wire);

  let spinBoost = 0;
  Cosmos.registerViewport(el, scene, camera, {
    onDrag(dx, dy) {
      core.rotation.y += dx * 0.012; core.rotation.x += dy * 0.01;
      wire.rotation.y += dx * 0.012; wire.rotation.x += dy * 0.01;
      spinBoost = 0.5;
    },
    tick() {
      core.rotation.y += 0.004 + spinBoost;
      core.rotation.x += 0.0015;
      wire.rotation.y += 0.004 + spinBoost;
      wire.rotation.x += 0.0015;
      spinBoost *= 0.9;
    }
  });
})();

/* ============================================================
   CTA — a mini interactive orrery of the whole system
   ============================================================ */
(function buildOrrery() {
  const el = document.getElementById('cta-orrery');
  if (!el) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 9, 15);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0x445577, 0.6));
  const light = new THREE.PointLight(0xfff2d0, 2.6, 60);
  scene.add(light);

  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
  scene.add(sun);

  const group = new THREE.Group();
  scene.add(group);

  const orreryPlanets = SOLAR_PLANETS.map((p, i) => {
    const dist = 2 + i * 0.85;
    const size = Math.max(0.16, Math.min(0.5, p.size * 0.35));
    const ringGeo = new THREE.RingGeometry(dist - 0.01, dist + 0.01, 64);
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x6fe3c8, transparent: true, opacity: 0.16, side: THREE.DoubleSide }));
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.85 }));
    const angle = Math.random() * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
    group.add(mesh);
    return { mesh, angle, dist, speed: 0.02 - i * 0.002 };
  });

  let autoSpin = 0.0015, spinBoost = 0;
  Cosmos.registerViewport(el, scene, camera, {
    onDrag(dx) {
      group.rotation.y += dx * 0.01;
      spinBoost = 0.006;
    },
    tick() {
      group.rotation.y += autoSpin + spinBoost;
      spinBoost *= 0.9;
      orreryPlanets.forEach(op => {
        op.angle += op.speed;
        op.mesh.position.set(Math.cos(op.angle) * op.dist, 0, Math.sin(op.angle) * op.dist);
      });
      sun.rotation.y += 0.002;
    }
  });
})();

/* ============================================================
   NAV LINK ACTIVE STATE + SCROLL REVEALS
   ============================================================ */
(function scrollFx() {
  const sections = ['tour', 'catalog', 'fact', 'footer'].map(id => document.getElementById(id));
  const navLinks = Array.from(document.querySelectorAll('nav.links a'));

  const io2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = sections.indexOf(entry.target);
      if (entry.isIntersecting && idx > -1 && navLinks[idx]) {
        navLinks.forEach(l => l.classList.remove('active'));
        navLinks[idx].classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => s && io2.observe(s));

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }
})();

document.getElementById('play-trailer').addEventListener('click', () => {
  document.getElementById('tour').scrollIntoView({ behavior: 'smooth' });
});
