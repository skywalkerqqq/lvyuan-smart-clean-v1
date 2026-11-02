/* =========================================================
   智能安防套装 · 实时写实产品渲染
   Three.js r160 · 单场景 · 无 UI · 可拖拽 / 缩放 / 平移
   ========================================================= */
(() => {
  'use strict';

  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true
  });

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x07080a, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080a);
  scene.fog = new THREE.Fog(0x07080a, 22, 48);

  const camera = new THREE.PerspectiveCamera(
    27,
    window.innerWidth / window.innerHeight,
    0.1,
    140
  );

  const MAX_ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const clock = new THREE.Clock();

  /* ---------------------------------------------------------
     Procedural textures
     --------------------------------------------------------- */
  function makeNoiseTexture(repeat) {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 182 + Math.random() * 60;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    tex.anisotropy = MAX_ANISO;
    return tex;
  }

  const bodyNoise = makeNoiseTexture(2.2);
  const baseNoise = makeNoiseTexture(5.5);

  function makeGlowTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.72)');
    g.addColorStop(0.48, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function makeContactTexture() {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(0,0,0,0.82)');
    g.addColorStop(0.34, 'rgba(0,0,0,0.52)');
    g.addColorStop(0.66, 'rgba(0,0,0,0.16)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  function makePanelGlowTexture() {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0.00, 'rgba(92,255,196,0.20)');
    g.addColorStop(0.22, 'rgba(72,238,176,0.10)');
    g.addColorStop(0.52, 'rgba(45,180,128,0.035)');
    g.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function makePanelReflectionTexture() {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');

    const band = ctx.createLinearGradient(0, 0, size, size);
    band.addColorStop(0.00, 'rgba(220,240,255,0)');
    band.addColorStop(0.26, 'rgba(220,240,255,0.10)');
    band.addColorStop(0.40, 'rgba(220,240,255,0.025)');
    band.addColorStop(0.62, 'rgba(220,240,255,0)');
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, size, size);

    const spot = ctx.createRadialGradient(
      size * 0.30, size * 0.22, 0,
      size * 0.30, size * 0.22, size * 0.46
    );
    spot.addColorStop(0, 'rgba(255,255,255,0.15)');
    spot.addColorStop(0.45, 'rgba(255,255,255,0.04)');
    spot.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const glowTex = makeGlowTexture();
  const contactTex = makeContactTexture();
  const panelGlowTex = makePanelGlowTexture();
  const panelReflectionTex = makePanelReflectionTexture();

  /* ---------------------------------------------------------
     Studio backdrop / floor
     --------------------------------------------------------- */
  function makeBackdropTexture() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0.00, '#040506');
    g.addColorStop(0.16, '#080a0d');
    g.addColorStop(0.34, '#20242a');
    g.addColorStop(0.50, '#2f343b');
    g.addColorStop(0.66, '#171b21');
    g.addColorStop(0.82, '#08090c');
    g.addColorStop(1.00, '#040506');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 512);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }

  function makeFloorGlowTexture() {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0.00, 'rgba(255,255,255,0.72)');
    g.addColorStop(0.28, 'rgba(255,255,255,0.38)');
    g.addColorStop(0.62, 'rgba(255,255,255,0.10)');
    g.addColorStop(1.00, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  const backdropTex = makeBackdropTexture();
  const backdrop = new THREE.Mesh(
    new THREE.SphereGeometry(60, 64, 32),
    new THREE.MeshBasicMaterial({
      map: backdropTex,
      side: THREE.BackSide,
      fog: false
    })
  );
  scene.add(backdrop);

  const FLOOR_Y = -0.145;
  const floorGlowTex = makeFloorGlowTexture();
  const floorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 22),
    new THREE.MeshBasicMaterial({
      map: floorGlowTex,
      color: 0x1b222b,
      transparent: true,
      depthWrite: false,
      opacity: 0.44,
      toneMapped: false
    })
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = FLOOR_Y - 0.001;
  floorGlow.renderOrder = 0;
  scene.add(floorGlow);

  const shadowCatcher = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.ShadowMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.52
    })
  );
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = FLOOR_Y;
  shadowCatcher.receiveShadow = true;
  shadowCatcher.renderOrder = 3;
  scene.add(shadowCatcher);

  /* ---------------------------------------------------------
     Geometry helpers
     --------------------------------------------------------- */
  function roundedRectShape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  function roundedBoxGeometry(w, h, d, r, bevel, curveSegments) {
    const shape = roundedRectShape(w, h, r);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.002, d),
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: bevel,
      bevelThickness: bevel,
      curveSegments: curveSegments || 12
    });
    geo.center();
    return geo;
  }

  function flatRoundedBox(w, d, h, r, bevel) {
    const geo = roundedBoxGeometry(w, d, h, r, bevel, 12);
    geo.rotateX(-Math.PI / 2);
    geo.computeBoundingBox();
    return geo;
  }

  function glowSprite(parent, position, color, size, opacity) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity,
        toneMapped: false
      })
    );
    sprite.position.copy(position);
    sprite.scale.set(size, size, 1);
    sprite.renderOrder = 12;
    parent.add(sprite);
    return sprite;
  }

  function contactShadow(x, y, z, w, d, opacity) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        depthWrite: false,
        opacity,
        color: 0x000000,
        toneMapped: false
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.renderOrder = 2;
    scene.add(m);
    return m;
  }

  /* ---------------------------------------------------------
     Materials
     --------------------------------------------------------- */
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x383c42,
    roughness: 0.60,
    metalness: 0.03,
    clearcoat: 0.14,
    clearcoatRoughness: 0.74,
    envMapIntensity: 0.85,
    roughnessMap: bodyNoise,
    bumpMap: bodyNoise,
    bumpScale: 0.0020
  });

  const sensorMat = bodyMat.clone();
  sensorMat.color = new THREE.Color(0x4a4e54);
  sensorMat.roughness = 0.56;

  const sensorTopMat = sensorMat.clone();
  sensorTopMat.color = new THREE.Color(0x3c4046);
  sensorTopMat.roughness = 0.70;
  sensorTopMat.clearcoat = 0.06;

  const baseMat = new THREE.MeshPhysicalMaterial({
    color: 0x15171a,
    roughness: 0.90,
    metalness: 0.02,
    clearcoat: 0.06,
    clearcoatRoughness: 0.85,
    envMapIntensity: 0.12,
    roughnessMap: baseNoise,
    bumpMap: baseNoise,
    bumpScale: 0.0030
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1f2226,
    roughness: 0.45,
    metalness: 0.16,
    envMapIntensity: 0.9
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x08090b,
    roughness: 0.32,
    metalness: 0.36,
    envMapIntensity: 1.3
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xb9bdc4,
    roughness: 0.30,
    metalness: 1.0,
    envMapIntensity: 1.5
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x06080b,
    roughness: 0.035,
    metalness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.025,
    envMapIntensity: 3.2
  });

  const lensInnerMat = new THREE.MeshPhysicalMaterial({
    color: 0x020304,
    roughness: 0.16,
    metalness: 0.45,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.6
  });

  const diffuserMat = new THREE.MeshPhysicalMaterial({
    color: 0x0e1311,
    roughness: 0.38,
    metalness: 0.03,
    clearcoat: 0.62,
    clearcoatRoughness: 0.18,
    emissive: 0x0a2c1f,
    emissiveIntensity: 0.010,
    envMapIntensity: 0.65
  });

  const ledGreenMat = new THREE.MeshBasicMaterial({
    color: 0x8effc9,
    toneMapped: false
  });

  const ledBlueMat = new THREE.MeshBasicMaterial({
    color: 0x6fd2ff,
    toneMapped: false
  });

  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x0b0c0d,
    roughness: 0.84,
    metalness: 0.0,
    envMapIntensity: 0.35
  });

  const innerMetalMat = new THREE.MeshStandardMaterial({
    color: 0x2b3138,
    roughness: 0.28,
    metalness: 0.85,
    envMapIntensity: 1.25
  });

  const glassHighlightMat = new THREE.MeshBasicMaterial({
    color: 0xb8e5ff,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false
  });

  const alarmRimMat = new THREE.MeshStandardMaterial({
    color: 0x1d2c25,
    roughness: 0.42,
    metalness: 0.08,
    emissive: 0x2affb0,
    emissiveIntensity: 0.018,
    envMapIntensity: 0.55
  });

  /* ---------------------------------------------------------
     Studio environment (PMREM) + lights
     --------------------------------------------------------- */
  function buildStudioEnvironment() {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x050607);

    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(50, 32, 16),
      new THREE.MeshBasicMaterial({ color: 0x050607, side: THREE.BackSide })
    );
    envScene.add(shell);

    function panel(width, height, rgb, position, target) {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setRGB(rgb[0], rgb[1], rgb[2]),
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
      mesh.position.set(position[0], position[1], position[2]);
      mesh.lookAt(target[0], target[1], target[2]);
      envScene.add(mesh);
    }

    panel(12, 15, [2.5, 2.8, 3.2], [-12, 7, 6], [0, 1, 0]);
    panel(9, 12, [1.0, 1.35, 1.75], [11, 5, 4], [0, 1, 0]);
    panel(12, 8, [1.7, 1.8, 1.9], [0, 15, 0], [0, 1, 0]);
    panel(6, 4.5, [0.65, 0.85, 1.15], [0, 4, 15], [0, 1, 0]);
    panel(5, 7, [0.52, 0.72, 1.00], [0, 4, -15], [0, 1, 0]);

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const rt = pmrem.fromScene(envScene, 0.02, 0.1, 100);
    scene.environment = rt.texture;
    pmrem.dispose();
  }

  function buildLights() {
    scene.add(new THREE.HemisphereLight(0xa9bdd8, 0x07080a, 0.48));

    const key = new THREE.DirectionalLight(0xf4f3ef, 3.25);
    key.position.set(-8, 10, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -7;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 38;
    key.shadow.bias = -0.00015;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = 4;
    key.target.position.set(0, 0.85, 0);
    key.shadow.camera.updateProjectionMatrix();
    scene.add(key);
    scene.add(key.target);

    const fill = new THREE.DirectionalLight(0xd7e0e9, 1.45);
    fill.position.set(7, 4.5, 6);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xd8e9ff, 2.85);
    rim.position.set(-1.5, 6.5, -9);
    scene.add(rim);

    const rimRight = new THREE.DirectionalLight(0xa9c8ef, 1.55);
    rimRight.position.set(8, 5, -7);
    scene.add(rimRight);

    const top = new THREE.DirectionalLight(0xffffff, 0.82);
    top.position.set(0, 12, 1);
    scene.add(top);

    const lift = new THREE.DirectionalLight(0xc3d5e8, 0.58);
    lift.position.set(3, 1.8, 9);
    scene.add(lift);

    const glint = new THREE.PointLight(0xd9edff, 18, 11, 2);
    glint.position.set(3.2, 2.5, 4.8);
    scene.add(glint);

    // 镜头玻璃上的一枚小型柔光高光
    const lensGlint = new THREE.PointLight(0xcfe8ff, 8, 6, 2);
    lensGlint.position.set(1.8, 2.2, 3.0);
    scene.add(lensGlint);

    // 顶部柔光在底座中心形成极轻的光池，避免底座整体过亮
    const pool = new THREE.SpotLight(0xdfeaff, 38, 20, 0.62, 0.92, 1.45);
    pool.position.set(0, 8.5, 3.2);
    pool.target.position.set(0, 0, 0.15);
    pool.castShadow = false;
    scene.add(pool);
    scene.add(pool.target);
  }

  /* ---------------------------------------------------------
     Base
     --------------------------------------------------------- */
  function buildBase() {
    const geo = roundedBoxGeometry(3.9, 3.9, 0.18, 0.16, 0.028, 14);
    geo.rotateX(-Math.PI / 2);
    geo.computeBoundingBox();

    const mesh = new THREE.Mesh(geo, baseMat);
    mesh.position.y = -0.135 - geo.boundingBox.min.y;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    mesh.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(mesh);
    return box.max.y;
  }

  /* ---------------------------------------------------------
     PTZ camera
     --------------------------------------------------------- */
  function addPart(parent, geometry, material, position, rotation) {
    const mesh = new THREE.Mesh(geometry, material);
    if (position) mesh.position.set(position[0], position[1], position[2]);
    if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function buildPTZ(baseTop) {
    const group = new THREE.Group();
    group.position.set(0.0, baseTop, 0.08);
    group.rotation.y = 0.30;
    group.scale.setScalar(1.2);
    scene.add(group);

    // 底盘
    addPart(group, new THREE.CylinderGeometry(0.52, 0.57, 0.10, 64), bodyMat, [0, 0.05, 0]);
    addPart(group, new THREE.TorusGeometry(0.56, 0.006, 10, 64), darkMat, [0, 0.013, 0], [Math.PI / 2, 0, 0]);
    addPart(group, new THREE.TorusGeometry(0.515, 0.005, 10, 64), darkMat, [0, 0.10, 0], [Math.PI / 2, 0, 0]);
    addPart(group, new THREE.TorusGeometry(0.568, 0.004, 8, 64), rubberMat, [0, 0.006, 0], [Math.PI / 2, 0, 0]);

    // 转轴与机身
    addPart(group, new THREE.CylinderGeometry(0.22, 0.26, 0.16, 48), darkMat, [0, 0.18, 0]);
    addPart(group, new THREE.CylinderGeometry(0.40, 0.44, 1.10, 64), bodyMat, [0, 0.81, 0]);
    addPart(group, new THREE.CylinderGeometry(0.443, 0.447, 0.10, 64), darkMat, [0, 0.31, 0]);
    addPart(group, new THREE.CylinderGeometry(0.37, 0.40, 0.06, 64), bodyMat, [0, 1.39, 0]);
    addPart(group, new THREE.TorusGeometry(0.395, 0.008, 12, 64), darkMat, [0, 1.365, 0], [Math.PI / 2, 0, 0]);

    // 极细的机身分模线，增加工业制品细节
    addPart(group, new THREE.TorusGeometry(0.438, 0.0032, 8, 64), darkMat, [0, 0.35, 0], [Math.PI / 2, 0, 0]);
    addPart(group, new THREE.TorusGeometry(0.405, 0.0028, 8, 64), darkMat, [0, 1.21, 0], [Math.PI / 2, 0, 0]);
    addPart(group, new THREE.TorusGeometry(0.436, 0.0024, 8, 64), darkMat, [0, 0.43, 0], [Math.PI / 2, 0, 0]);
    addPart(group, new THREE.TorusGeometry(0.407, 0.0018, 8, 64), darkMat, [0, 1.10, 0], [Math.PI / 2, 0, 0]);

    // 球形云台
    addPart(group, new THREE.SphereGeometry(0.46, 64, 48), bodyMat, [0, 1.78, 0]);

    // 云台球体的精细分模线
    addPart(group, new THREE.TorusGeometry(0.430, 0.0024, 8, 64), darkMat, [0, 1.62, 0], [Math.PI / 2, 0, 0]);

    // 镜头所在的黑色圆形面板，从球体正面切出
    const faceCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.462, 64, 32, 0, Math.PI * 2, 0, 0.78),
      blackMat
    );
    faceCap.rotation.x = Math.PI / 2;
    faceCap.position.set(0, 1.78, 0);
    faceCap.castShadow = true;
    faceCap.receiveShadow = true;
    group.add(faceCap);
    addPart(group, new THREE.TorusGeometry(0.323, 0.004, 10, 64), darkMat, [0, 1.78, 0.327]);

    // 云台两侧的转轴盖，暗示可俯仰的机械结构
    addPart(group, new THREE.CylinderGeometry(0.09, 0.09, 0.035, 32), darkMat, [-0.458, 1.78, 0], [0, 0, Math.PI / 2]);
    addPart(group, new THREE.CylinderGeometry(0.09, 0.09, 0.035, 32), darkMat, [0.458, 1.78, 0], [0, 0, Math.PI / 2]);
    addPart(group, new THREE.TorusGeometry(0.092, 0.0022, 8, 32), innerMetalMat, [-0.462, 1.78, 0], [0, Math.PI / 2, 0]);
    addPart(group, new THREE.TorusGeometry(0.092, 0.0022, 8, 32), innerMetalMat, [0.462, 1.78, 0], [0, Math.PI / 2, 0]);

    // 镜头总成
    const lens = new THREE.Group();
    lens.position.set(0, 1.78, 0.43);
    lens.rotation.x = -0.02;
    group.add(lens);

    addPart(lens, new THREE.CylinderGeometry(0.25, 0.27, 0.09, 64), blackMat, [0, 0, 0], [Math.PI / 2, 0, 0]);
    addPart(lens, new THREE.TorusGeometry(0.252, 0.0055, 10, 64), darkMat, [0, 0, 0.030]);
    addPart(lens, new THREE.TorusGeometry(0.235, 0.017, 16, 64), blackMat, [0, 0, 0.045]);
    addPart(lens, new THREE.CircleGeometry(0.202, 64), glassMat, [0, 0, 0.052]);
    addPart(lens, new THREE.TorusGeometry(0.202, 0.0025, 12, 64), darkMat, [0, 0, 0.054]);
    addPart(lens, new THREE.TorusGeometry(0.150, 0.0025, 10, 64), innerMetalMat, [0, 0, 0.0545]);
    addPart(lens, new THREE.TorusGeometry(0.238, 0.0016, 10, 64), innerMetalMat, [0, 0, 0.047]);
    addPart(lens, new THREE.CircleGeometry(0.088, 64), lensInnerMat, [0, 0, 0.0555]);
    addPart(lens, new THREE.TorusGeometry(0.106, 0.003, 12, 64), blackMat, [0, 0, 0.056]);
    addPart(lens, new THREE.CircleGeometry(0.034, 32), glassMat, [0, 0, 0.0575]);

    const lensReflection = new THREE.Mesh(
      new THREE.CircleGeometry(0.026, 24),
      glassHighlightMat
    );
    lensReflection.position.set(-0.062, 0.058, 0.058);
    lensReflection.scale.set(1.7, 0.34, 1);
    lensReflection.rotation.z = 0.65;
    lensReflection.castShadow = false;
    lensReflection.receiveShadow = false;
    lens.add(lensReflection);

    // 冰蓝工作灯
    const ledDir = new THREE.Vector3(0.27, 0.08, 0.355).normalize();
    const headCenter = new THREE.Vector3(0, 1.78, 0);
    const ledPos = headCenter.clone().addScaledVector(ledDir, 0.462);
    addPart(group, new THREE.SphereGeometry(0.020, 20, 14), blackMat, [ledPos.x, ledPos.y, ledPos.z]);
    const ledBezel = new THREE.Mesh(
      new THREE.TorusGeometry(0.0165, 0.0022, 8, 28),
      innerMetalMat
    );
    ledBezel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), ledDir);
    ledBezel.position.copy(ledPos).addScaledVector(ledDir, 0.001);
    ledBezel.castShadow = false;
    ledBezel.receiveShadow = false;
    group.add(ledBezel);

    const led = addPart(
      group,
      new THREE.SphereGeometry(0.013, 18, 14),
      ledBlueMat,
      [ledPos.x + ledDir.x * 0.005, ledPos.y + ledDir.y * 0.005, ledPos.z + ledDir.z * 0.005]
    );
    led.castShadow = false;
    led.receiveShadow = false;
    glowSprite(
      group,
      ledPos.clone().addScaledVector(ledDir, 0.010),
      0x5fc8ff,
      0.22,
      0.90
    );

    return group;
  }

  /* ---------------------------------------------------------
     Door / window magnetic sensor
     --------------------------------------------------------- */
  function buildSensor(baseTop) {
    const group = new THREE.Group();
    group.position.set(-0.92, baseTop, 1.05);
    group.rotation.y = 0.20;
    group.scale.setScalar(1.14);
    scene.add(group);

    const mainGeo = flatRoundedBox(0.82, 0.52, 0.125, 0.065, 0.012);
    const main = new THREE.Mesh(mainGeo, sensorMat);
    main.position.set(-0.44, -mainGeo.boundingBox.min.y, 0);
    main.castShadow = true;
    main.receiveShadow = true;
    group.add(main);

    const magnetGeo = flatRoundedBox(0.74, 0.48, 0.105, 0.055, 0.010);
    const magnet = new THREE.Mesh(magnetGeo, sensorMat);
    magnet.position.set(0.44, -magnetGeo.boundingBox.min.y, 0);
    magnet.castShadow = true;
    magnet.receiveShadow = true;
    group.add(magnet);

    const mainTop = main.position.y + mainGeo.boundingBox.max.y;
    const magnetTop = magnet.position.y + magnetGeo.boundingBox.max.y;

    // 主机顶部：橡胶密封圈 + 微弧盖板，形成极细的层次
    const mainGasketGeo = flatRoundedBox(0.76, 0.46, 0.004, 0.052, 0.002);
    const mainGasket = new THREE.Mesh(mainGasketGeo, rubberMat);
    mainGasket.position.set(-0.44, mainTop + 0.001, 0);
    mainGasket.castShadow = true;
    mainGasket.receiveShadow = true;
    group.add(mainGasket);

    const topGeo = flatRoundedBox(0.70, 0.40, 0.005, 0.050, 0.0025);
    const top = new THREE.Mesh(topGeo, sensorTopMat);
    top.position.set(-0.44, mainTop + 0.005, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // 磁条另一半也有对应的微弧盖板，保持成对的产品语言
    const magnetGasketGeo = flatRoundedBox(0.68, 0.42, 0.004, 0.048, 0.002);
    const magnetGasket = new THREE.Mesh(magnetGasketGeo, rubberMat);
    magnetGasket.position.set(0.44, magnetTop + 0.001, 0);
    magnetGasket.castShadow = true;
    magnetGasket.receiveShadow = true;
    group.add(magnetGasket);

    const magnetTopGeo = flatRoundedBox(0.62, 0.36, 0.005, 0.045, 0.0025);
    const magnetDeck = new THREE.Mesh(magnetTopGeo, sensorTopMat);
    magnetDeck.position.set(0.44, magnetTop + 0.005, 0);
    magnetDeck.castShadow = true;
    magnetDeck.receiveShadow = true;
    group.add(magnetDeck);

    // 隐藏式状态灯：金属小圈 + 内凹黑色灯座
    const ledRecess = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.0025, 20), rubberMat);
    ledRecess.position.set(-0.16, mainTop + 0.0105, 0.11);
    group.add(ledRecess);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0024, 8, 24), innerMetalMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(-0.16, mainTop + 0.0122, 0.11);
    group.add(ring);

    const led = new THREE.Mesh(new THREE.SphereGeometry(0.0096, 16, 12), ledGreenMat);
    led.position.set(-0.16, mainTop + 0.0145, 0.11);
    led.castShadow = false;
    led.receiveShadow = false;
    group.add(led);

    glowSprite(
      group,
      new THREE.Vector3(-0.16, mainTop + 0.023, 0.11),
      0x64ffc0,
      0.058,
      0.45
    );

    // 磁吸对位面的拉丝金属触点（藏在间隙里）
    const wellMain = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.085, 0.34), rubberMat);
    wellMain.position.set(-0.023, 0.062, 0);
    wellMain.castShadow = false;
    group.add(wellMain);

    const wellMagnet = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.075, 0.30), rubberMat);
    wellMagnet.position.set(0.063, 0.056, 0);
    wellMagnet.castShadow = false;
    group.add(wellMagnet);

    const stripMain = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.05, 0.28), steelMat);
    stripMain.position.set(-0.020, 0.068, 0);
    stripMain.castShadow = false;
    group.add(stripMain);

    const stripMagnet = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.044, 0.25), steelMat);
    stripMagnet.position.set(0.060, 0.056, 0);
    stripMagnet.castShadow = false;
    group.add(stripMagnet);

    return { group, mainTop };
  }

  /* ---------------------------------------------------------
     Sound / light alarm
     --------------------------------------------------------- */
  function buildAlarm(baseTop) {
    const group = new THREE.Group();
    group.position.set(1.22, baseTop, 0.85);
    group.rotation.y = 0.14;
    group.scale.setScalar(1.02);
    scene.add(group);

    const bodyGeo = roundedBoxGeometry(1.10, 1.10, 0.32, 0.15, 0.024, 12);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = -bodyGeo.boundingBox.min.y;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const bodyFront = bodyGeo.boundingBox.max.z;
    const bodyCenterY = body.position.y;

    // 橡胶密封圈，让正面组件与机身之间多一层真实装配关系
    const alarmGasketGeo = roundedBoxGeometry(1.035, 1.035, 0.008, 0.145, 0.003, 12);
    const alarmGasket = new THREE.Mesh(alarmGasketGeo, rubberMat);
    alarmGasket.position.set(0, bodyCenterY, bodyFront - 0.001);
    alarmGasket.castShadow = true;
    alarmGasket.receiveShadow = true;
    group.add(alarmGasket);

    // 深色边框
    const borderGeo = roundedBoxGeometry(0.99, 0.99, 0.012, 0.135, 0.004, 12);
    const border = new THREE.Mesh(borderGeo, blackMat);
    border.position.set(0, bodyCenterY, bodyFront + 0.001);
    border.castShadow = true;
    border.receiveShadow = true;
    group.add(border);

    // 极窄的导光边框，待机时比面板更弱
    const rimGeo = roundedBoxGeometry(0.97, 0.97, 0.006, 0.13, 0.003, 12);
    const rim = new THREE.Mesh(rimGeo, alarmRimMat);
    rim.position.set(0, bodyCenterY, bodyFront + 0.006);
    rim.castShadow = true;
    rim.receiveShadow = true;
    group.add(rim);

    // 全域匀光面板（待机时仅透出极弱的青绿色）
    const panelGeo = roundedBoxGeometry(0.94, 0.94, 0.022, 0.125, 0.006, 12);
    const panel = new THREE.Mesh(panelGeo, diffuserMat);
    panel.position.set(0, bodyCenterY, bodyFront + 0.004);
    panel.castShadow = true;
    panel.receiveShadow = true;
    group.add(panel);

    // 匀光面板上的极弱中心辉光，避免变成一块死板的绿色屏幕
    const panelGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.90, 0.90),
      new THREE.MeshBasicMaterial({
        map: panelGlowTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.75,
        toneMapped: false
      })
    );
    panelGlow.position.set(
      0,
      bodyCenterY,
      panel.position.z + panelGeo.boundingBox.max.z + 0.0015
    );
    panelGlow.renderOrder = 4;
    group.add(panelGlow);

    // 面板上的一道极淡摄影棚反射，让它更像磨砂导光板而不是显示屏幕
    const panelReflection = new THREE.Mesh(
      new THREE.PlaneGeometry(0.90, 0.90),
      new THREE.MeshBasicMaterial({
        map: panelReflectionTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.62,
        toneMapped: false
      })
    );
    panelReflection.position.set(
      0,
      bodyCenterY,
      panel.position.z + panelGeo.boundingBox.max.z + 0.002
    );
    panelReflection.renderOrder = 5;
    group.add(panelReflection);

    // 底部隐藏式出声缝：一排极细的微孔
    for (let i = -2; i <= 2; i += 1) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.012, 0.012), rubberMat);
      slot.position.set(i * 0.060, 0.060, bodyFront + 0.002);
      slot.castShadow = false;
      group.add(slot);
    }

    // 极小的待机状态灯：金属圈 + 内凹黑色灯座
    const statusRecess = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, 0.0025, 20),
      rubberMat
    );
    statusRecess.rotation.x = Math.PI / 2;
    statusRecess.position.set(0.22, 0.077, bodyFront + 0.003);
    group.add(statusRecess);

    const statusRing = new THREE.Mesh(new THREE.TorusGeometry(0.0135, 0.0022, 8, 24), innerMetalMat);
    statusRing.position.set(0.22, 0.077, bodyFront + 0.0045);
    group.add(statusRing);

    const statusLed = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 16, 12), ledGreenMat);
    statusLed.position.set(0.22, 0.077, bodyFront + 0.007);
    statusLed.castShadow = false;
    group.add(statusLed);
    glowSprite(group, new THREE.Vector3(0.22, 0.084, bodyFront + 0.014), 0x64ffc0, 0.048, 0.38);

    // 微弱待机绿光的光晕
    glowSprite(
      group,
      new THREE.Vector3(0, bodyCenterY, bodyFront + 0.045),
      0x39ffb2,
      1.40,
      0.018
    );

    return group;
  }

  /* ---------------------------------------------------------
     Scene assembly
     --------------------------------------------------------- */
  const BASE_TOP = buildBase();
  buildLights();
  buildStudioEnvironment();

  buildPTZ(BASE_TOP);
  buildSensor(BASE_TOP);
  buildAlarm(BASE_TOP);

  // 底座上的柔和接触阴影
  contactShadow(0, BASE_TOP + 0.004, 0.08, 1.62, 1.62, 0.34);
  contactShadow(-0.92, BASE_TOP + 0.004, 1.05, 2.20, 1.38, 0.26);
  contactShadow(1.22, BASE_TOP + 0.004, 0.85, 1.58, 1.58, 0.30);

  // 地面上的大范围软阴影，帮助底座“落地”
  contactShadow(0, FLOOR_Y + 0.003, 0.0, 7.2, 7.2, 0.55);

  /* ---------------------------------------------------------
     Camera controls (no visible UI)
     --------------------------------------------------------- */
  const INITIAL = {
    theta: 0.60,
    phi: 1.41,
    radius: 12.1,
    targetY: 1.15
  };

  const view = {
    theta: INITIAL.theta,
    phi: INITIAL.phi,
    radius: INITIAL.radius,
    target: new THREE.Vector3(0, INITIAL.targetY, 0)
  };

  const goal = {
    theta: view.theta,
    phi: view.phi,
    radius: view.radius,
    target: view.target.clone()
  };

  function clampGoal() {
    goal.phi = THREE.MathUtils.clamp(goal.phi, 0.48, 1.42);
    goal.radius = THREE.MathUtils.clamp(goal.radius, 9.0, 24.0);
    goal.target.x = THREE.MathUtils.clamp(goal.target.x, -1.4, 1.4);
    goal.target.z = THREE.MathUtils.clamp(goal.target.z, -1.4, 1.4);
    goal.target.y = THREE.MathUtils.clamp(goal.target.y, 0.55, 2.15);
  }

  function applyCamera() {
    const sinPhi = Math.sin(view.phi);
    camera.position.set(
      view.target.x + view.radius * sinPhi * Math.sin(view.theta),
      view.target.y + view.radius * Math.cos(view.phi),
      view.target.z + view.radius * sinPhi * Math.cos(view.theta)
    );
    camera.lookAt(view.target);
  }

  function resetView(immediate) {
    goal.theta = INITIAL.theta;
    goal.phi = INITIAL.phi;
    goal.radius = INITIAL.radius;
    goal.target.set(0, INITIAL.targetY, 0);
    if (immediate) {
      view.theta = goal.theta;
      view.phi = goal.phi;
      view.radius = goal.radius;
      view.target.copy(goal.target);
      applyCamera();
    }
  }

  applyCamera();

  let drag = null;

  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 && event.button !== 2) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('dragging');
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      pan: event.button === 2
    };
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;

    if (drag.pan) {
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      const scale = view.radius * 0.00105;
      goal.target.addScaledVector(right, -dx * scale);
      goal.target.addScaledVector(up, dy * scale);
      clampGoal();
    } else {
      goal.theta -= dx * 0.005;
      goal.phi -= dy * 0.005;
      clampGoal();
    }
  });

  function endDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    drag = null;
    canvas.classList.remove('dragging');
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  canvas.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      goal.radius *= Math.exp(event.deltaY * 0.00115);
      clampGoal();
    },
    { passive: false }
  );

  canvas.addEventListener('dblclick', () => resetView(false));

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------------------------------------------------------
     Render loop
     --------------------------------------------------------- */
  function animate() {
    const damping = 0.12;
    view.theta += (goal.theta - view.theta) * damping;
    view.phi += (goal.phi - view.phi) * damping;
    view.radius += (goal.radius - view.radius) * damping;
    view.target.lerp(goal.target, damping);
    applyCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  /* ---------------------------------------------------------
     Capture helpers (used for the still render)
     --------------------------------------------------------- */
  window.resetView = resetView;

  window.captureRender = function captureRender(size) {
    const px = size || 1600;
    const oldSize = new THREE.Vector2();
    renderer.getSize(oldSize);
    const oldRatio = renderer.getPixelRatio();
    const oldAspect = camera.aspect;

    resetView(true);
    renderer.setPixelRatio(1);
    renderer.setSize(px, px, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    applyCamera();
    renderer.render(scene, camera);
    const data = renderer.domElement.toDataURL('image/png');

    renderer.setPixelRatio(oldRatio);
    renderer.setSize(oldSize.x, oldSize.y, false);
    camera.aspect = oldAspect;
    camera.updateProjectionMatrix();
    applyCamera();
    renderer.render(scene, camera);
    return data;
  };

  window.saveRender = async function saveRender(size) {
    const data = window.captureRender(size || 1600);
    const response = await fetch('/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'render-raw.png', data })
    });
    if (!response.ok) throw new Error('save failed: ' + response.status);
    return await response.text();
  };

  document.documentElement.dataset.ready = 'true';
})();
