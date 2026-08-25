/* ============================================================
   CONTENT — contact link, solar system data, work catalog
   ============================================================ */
const WHATSAPP_LINK = 'https://wa.me/94783876112';

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

const CATALOG_ITEMS = [
  {
    name: 'Graphic Designer', order: 1,
    desc: 'Graphic Designer & Photoshop expert specializing in striking photo manipulation, creative portraits, and dynamic visual storytelling.',
    image: 'images/graphic-designer.jpg',
    link: 'https://drive.google.com/drive/folders/1CxHi8clV6A4Qi9uU19Z8gc-y4tFKMzoP?usp=drive_link',
    cta: 'Check it out'
  },
  {
    name: 'UI/UX Designer', order: 2,
    desc: 'UI/UX Designer crafting human centered web & mobile experiences with Figma, design systems and interactive prototyping.',
    image: 'images/ui-ux-designer.jpg',
    link: 'https://drive.google.com/drive/folders/1fcJXDBZ3wVZ45ZMuSQstXKI5UeakMlpG?usp=drive_link',
    cta: 'Check it out'
  },
  {
    name: 'Video Editor', order: 3,
    desc: 'Video Editor & Motion Designer transforming raw footage into visual stories with Adobe After Effects.',
    image: 'images/video-editor.jpg',
    link: 'https://www.tiktok.com/@_azper',
    cta: 'Check it out'
  },
];

/* ============================================================
   WORDS PULL-UP — wraps text into words, reveals them staggered
   on scroll into view. Mirrors the Prisma WordsPullUp component.
   ============================================================ */
function wordsPullUp(el, text, { staggerDelay = 0.08, asterisk = false } = {}) {
  const words = text.split(' ');
  el.innerHTML = '';
  words.forEach((word, i) => {
    const isLast = i === words.length - 1;
    const wrap = document.createElement('span');
    wrap.className = 'pullup-word';
    const inner = document.createElement('span');
    inner.className = 'pullup-inner' + (isLast && asterisk ? ' hero-asterisk' : '');
    inner.style.transitionDelay = `${i * staggerDelay}s`;
    inner.textContent = word;
    wrap.appendChild(inner);
    el.appendChild(wrap);
    if (!isLast) el.appendChild(document.createTextNode('\u00A0'));
  });
  observeReveal(el.querySelectorAll('.pullup-word'));
}

/* Multi-style variant: segments = [{ text, className }], continuous stagger. */
function wordsPullUpMultiStyle(el, segments, { staggerDelay = 0.08 } = {}) {
  el.innerHTML = '';
  let index = 0;
  segments.forEach(seg => {
    seg.text.split(' ').forEach(word => {
      const wrap = document.createElement('span');
      wrap.className = 'pullup-word';
      const inner = document.createElement('span');
      inner.className = `pullup-inner ${seg.className || ''}`;
      inner.style.transitionDelay = `${index * staggerDelay}s`;
      inner.textContent = word;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      index++;
    });
  });
  observeReveal(el.querySelectorAll('.pullup-word'));
}

function observeReveal(nodeList) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '-40px' });
  nodeList.forEach(n => io.observe(n));
}

/* ============================================================
   SCROLL LETTER REVEAL — each character's opacity ramps up as
   the paragraph scrolls through the viewport. Mirrors Prisma's
   AnimatedLetter + useScroll(['start 0.8','end 0.2']) behaviour.
   ============================================================ */
function scrollLetterReveal(el, text) {
  el.innerHTML = '';
  const chars = text.split('');
  const spans = chars.map(ch => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch;
    el.appendChild(span);
    return span;
  });

  const total = chars.length;
  let ticking = false;

  function update() {
    ticking = false;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // 'start 0.8' -> progress 0 when el top hits 80% of viewport height
    // 'end 0.2'   -> progress 1 when el bottom hits 20% of viewport height
    const startY = vh * 0.8;
    const endY = vh * 0.2;
    const progress = Math.min(1, Math.max(0, (startY - rect.top) / (startY - endY + rect.height)));

    spans.forEach((span, i) => {
      const charProgress = i / total;
      const start = Math.max(0, charProgress - 0.1);
      const end = Math.min(1, charProgress + 0.05);
      let t = (progress - start) / (end - start || 1);
      t = Math.min(1, Math.max(0, t));
      span.style.opacity = String(0.2 + t * 0.8);
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

/* ============================================================
   SOLAR SYSTEM — scoped to the hero's rounded, inset container.
   Drag to orbit, click a planet to focus on it.
   ============================================================ */
const solarSystem = (function () {
  const zone = document.getElementById('cosmos-zone');
  const canvas = document.getElementById('cosmos-canvas');
  if (!zone || !canvas || typeof THREE === 'undefined') return null;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);

  scene.add(new THREE.AmbientLight(0x445577, 0.55));
  scene.add(new THREE.PointLight(0xfff2d0, 3.2, 300, 1.4));

  const sun = new THREE.Mesh(new THREE.SphereGeometry(2.1, 48, 48), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
  scene.add(sun);
  const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(2.7, 48, 48), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.18 }));
  scene.add(sunGlow);

  const planetMeshes = [];
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  SOLAR_PLANETS.forEach((p, i) => {
    const ringGeo = new THREE.RingGeometry(p.dist - 0.02, p.dist + 0.02, 128);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xdedbc8, transparent: true, opacity: 0.14, side: THREE.DoubleSide });
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

  const REST_DISTANCE = 30;
  const rig = { azimuth: 0.5, polar: 1.15, distance: REST_DISTANCE, targetAzimuth: 0.5, targetPolar: 1.15 };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const introZoomFrames = 230;
  let introZoomFrame = prefersReducedMotion ? introZoomFrames : 0;
  const introStartDistance = 2.4;

  function updateCameraFromRig() {
    const x = rig.distance * Math.sin(rig.polar) * Math.cos(rig.azimuth);
    const y = rig.distance * Math.cos(rig.polar);
    const z = rig.distance * Math.sin(rig.polar) * Math.sin(rig.azimuth);
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }
  updateCameraFromRig();

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

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  zone.addEventListener('click', (e) => {
    if (dragMoved) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(planetMeshes);
    if (hits.length) selectPlanet(hits[0].object.userData.index);
  });

  function updateIntroZoom() {
    if (introZoomFrame >= introZoomFrames) {
      rig.distance = REST_DISTANCE;
      return;
    }
    introZoomFrame++;
    const t = Math.min(1, introZoomFrame / introZoomFrames);
    const eased = 1 - Math.pow(1 - t, 3);
    rig.distance = introStartDistance + (REST_DISTANCE - introStartDistance) * eased;
  }

  let selectedIndex = -1;
  function selectPlanet(i) {
    selectedIndex = i;
    const mesh = planetMeshes[i];
    const targetAngle = Math.atan2(mesh.position.z, mesh.position.x);
    rig.targetAzimuth = targetAngle + 0.6;
  }
  selectPlanet(0);

  function resize() {
    const w = zone.clientWidth || window.innerWidth;
    const h = zone.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / (h || 1);
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  function frame() {
    requestAnimationFrame(frame);

    updateIntroZoom();
    rig.azimuth += (rig.targetAzimuth - rig.azimuth) * 0.06;
    rig.polar += (rig.targetPolar - rig.polar) * 0.06;
    if (autoRotate) rig.targetAzimuth += 0.0009;
    updateCameraFromRig();

    planetMeshes.forEach((mesh) => {
      const p = mesh.userData;
      p.angle += p.speed;
      mesh.position.set(Math.cos(p.angle) * p.dist, Math.sin(p.angle * 0.15) * 0.3, Math.sin(p.angle) * p.dist);
      mesh.rotation.y += 0.01;
      mesh.scale.setScalar(mesh.userData.index === selectedIndex ? 1.35 : 1);
    });
    sun.rotation.y += 0.0015;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  // re-measure once layout settles (fonts/viewport can shift height:100vh sizing)
  window.addEventListener('load', resize);
  setTimeout(resize, 300);

  return { selectPlanet };
})();

/* ============================================================
   WORK — feature-card catalog, staggered entrance on scroll
   ============================================================ */
(function buildCatalog() {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '-60px' });

  CATALOG_ITEMS.forEach((p, i) => {
    const card = document.createElement('a');
    card.className = 'feature-card';
    card.href = p.link;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.style.transitionDelay = `${i * 0.15}s`;
    card.innerHTML = `
      <img class="card-img" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
      <h3>${p.name}</h3>
      <span class="checkout-btn">${p.cta}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(-45deg);"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </span>
    `;
    grid.appendChild(card);
    io.observe(card);
  });
})();

/* ============================================================
   ABOUT & CONTACT IMAGES — optional, drop files into an
   "images" folder next to index.html using these filenames.
   ============================================================ */
(function addAboutAndContactImages() {
  const aboutCard = document.querySelector('.about-card');
  if (aboutCard) {
    const img = document.createElement('img');
    img.className = 'about-img';
    img.src = 'images/about-me.jpg';
    img.alt = 'Nirush Madushan';
    img.loading = 'lazy';
    img.onerror = function () { this.style.display = 'none'; };
    aboutCard.insertBefore(img, aboutCard.firstChild);
  }

  const ctaSection = document.querySelector('.cta');
  if (ctaSection) {
    const img = document.createElement('img');
    img.className = 'cta-img';
    img.src = 'images/contact.jpg';
    img.alt = 'Contact';
    img.loading = 'lazy';
    img.onerror = function () { this.style.display = 'none'; };
    ctaSection.insertBefore(img, ctaSection.firstChild);
  }
})();

/* ============================================================
   TEXT CONTENT — wire up the pull-up / scroll-reveal copy
   ============================================================ */
wordsPullUp(document.getElementById('hero-heading'), 'Nirush', { asterisk: true });

wordsPullUpMultiStyle(document.getElementById('about-heading'), [
  { text: 'Hi! I’m Nirush Madushan,', className: 'style-regular' },
  { text: 'a self taught creator.', className: 'style-italic' },
]);

document.getElementById('about-body').textContent =
  'Skilled in Figma, Photoshop and After Effects.I’m always learning from new projects and very adaptive.';

wordsPullUpMultiStyle(document.getElementById('features-line-1'), [
  { text: 'Featured projects', className: 'style-regular' },
]);
wordsPullUpMultiStyle(document.getElementById('features-line-2'), [
  { text: 'across design and motion.', className: 'style-regular' },
]);

/* ============================================================
   NAV ACTIVE STATE
   ============================================================ */
(function navActiveState() {
  const navLinks = Array.from(document.querySelectorAll('.navbar-pill a'));
  const sectionForLink = navLinks.map(link => document.getElementById((link.getAttribute('href') || '').slice(1)));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = sectionForLink.indexOf(entry.target);
      if (entry.isIntersecting && idx > -1) {
        navLinks.forEach(l => l.classList.remove('active'));
        navLinks[idx].classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sectionForLink.forEach(s => s && io.observe(s));
})();
