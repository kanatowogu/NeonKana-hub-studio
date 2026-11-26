import * as THREE from 'three';

/**
 * BNBU Phase II Residential College Cluster — Option A Suspended Monorail Hub (V2)
 * Calibrated from Real North-Up Satellite Map:
 *   - 2F Closed Ring Corridor Diameter = 100.0m (R = 50.0m)
 *   - 6 Inward-Opening U-Shaped Colleges (6-fold symmetry, 65.5m radial dormitory wings, outer connecting bar)
 *   - Existing SE Circular Pavilion (R = 28.5m, θ = +67°)
 *   - Raised 3F SAFEGE Station (+11.60m platform, +19.15m lofty roof)
 *   - Differential B1 (Enclosed Box) vs B2 (Open 3-Segment Inverted-U Concrete Portals + Twin Split Roofs)
 *   - Enriched Courtyard (Sunken Reflecting Pool Terraces, Grand Stairs/Ramps, 1F Bike Slatted Galleries)
 */

export const AXIS_DEG = 30; // WNW (-150°, 10:00) to ESE (+30°, 4:00) — exact canyon alignment on satellite map
export const AXIS_RAD = THREE.MathUtils.degToRad(AXIS_DEG);
export const DIR_SE = new THREE.Vector3(Math.cos(AXIS_RAD), 0, Math.sin(AXIS_RAD));
export const PERP_NE = new THREE.Vector3(Math.sin(AXIS_RAD), 0, -Math.cos(AXIS_RAD));

export const DATUMS = {
  WATER: -0.45,
  F1: 0.0,
  F2: 5.2,
  F3: 11.6,
  GIRDER_BOT: 15.3,
  GIRDER_TOP: 16.7,
  LINTEL_BOT: 17.7,
  LINTEL_TOP: 19.15,
  ROOF_LOW: 19.15,
  ROOF_HIGH: 19.65,
};

// 6-fold rotational symmetry matching satellite map (11:00, 1:00, 3:00, 5:00, 7:00, 9:00)
export const COLLEGE_ANGLES_DEG = [-120, -60, 0, 60, 120, 180];

export function localToWorld(s, y, u) {
  return new THREE.Vector3(
    s * DIR_SE.x + u * PERP_NE.x,
    y,
    s * DIR_SE.z + u * PERP_NE.z
  );
}

export function worldToTrackLocal(v) {
  return {
    s: v.x * DIR_SE.x + v.z * DIR_SE.z,
    y: v.y,
    u: v.x * PERP_NE.x + v.z * PERP_NE.z,
  };
}

export function createHubScene() {
  const root = new THREE.Group();
  root.name = 'BNBU_OptionA_Hub_V2_Root';

  // --- Shared Clipping Planes ---
  const sectionPlane = new THREE.Plane(new THREE.Vector3(-PERP_NE.x, 0, -PERP_NE.z), 999);
  const slicePlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), 999),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), 999),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 999),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), 999),
  ];
  const activeClipPlanes = [];

  function regMat(mat) {
    mat.clippingPlanes = activeClipPlanes;
    mat.clipShadows = true;
    return mat;
  }

  // --- Materials (SKILL.md Ando Matte White-Model Standard) ---
  const matBoardPrimary = regMat(new THREE.MeshStandardMaterial({
    color: 0xd8d5ce, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide,
  }));
  const matBoardWarm = regMat(new THREE.MeshStandardMaterial({
    color: 0xd1cec6, roughness: 0.88, metalness: 0.0, side: THREE.DoubleSide,
  }));
  const matBoardDark = regMat(new THREE.MeshStandardMaterial({
    color: 0xc0bcb3, roughness: 0.86, metalness: 0.0, side: THREE.DoubleSide,
  }));
  const matPortalConcrete = regMat(new THREE.MeshStandardMaterial({
    color: 0xd4d0c8, roughness: 0.84, metalness: 0.0, side: THREE.DoubleSide,
  }));
  const matRing2F = regMat(new THREE.MeshStandardMaterial({
    color: 0xd8d5ce, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide,
  }));
  const matStation3F = regMat(new THREE.MeshStandardMaterial({
    color: 0xd8d5ce, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide,
  }));
  const matAcoustic = regMat(new THREE.MeshStandardMaterial({
    color: 0xd5d2ca, roughness: 0.86, metalness: 0.0, transparent: true, opacity: 1.0, side: THREE.DoubleSide,
  }));
  const matShellRoof = regMat(new THREE.MeshStandardMaterial({
    color: 0xd8d5ce, roughness: 0.85, metalness: 0.0, transparent: true, opacity: 1.0, side: THREE.DoubleSide,
  }));
  const matSteelGirder = regMat(new THREE.MeshStandardMaterial({
    color: 0xbab7af, roughness: 0.72, metalness: 0.14, side: THREE.DoubleSide,
  }));
  const matGlass = regMat(new THREE.MeshStandardMaterial({
    color: 0x9bb0bc, roughness: 0.22, metalness: 0.05, transparent: true, opacity: 0.30, depthWrite: false, side: THREE.DoubleSide,
  }));
  const matWater = regMat(new THREE.MeshStandardMaterial({
    color: 0x96a6ad, roughness: 0.14, metalness: 0.18, transparent: true, opacity: 0.72, side: THREE.DoubleSide,
  }));
  const matLawnSubtle = regMat(new THREE.MeshStandardMaterial({
    color: 0xdad8d0, roughness: 0.94, metalness: 0.0,
  }));
  const matBikeSlat = regMat(new THREE.MeshStandardMaterial({
    color: 0xc5c0b6, roughness: 0.86, metalness: 0.0,
  }));

  // Context Existing Colleges — Translucent Ghost Massing
  const matContextGhost = regMat(new THREE.MeshStandardMaterial({
    color: 0xe3e0d9, roughness: 0.90, metalness: 0.0, transparent: true, opacity: 0.33, depthWrite: false, side: THREE.DoubleSide,
  }));
  const matContextPodium = regMat(new THREE.MeshStandardMaterial({
    color: 0xd5d1c8, roughness: 0.90, metalness: 0.0, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide,
  }));
  const matContextEdge = new THREE.LineBasicMaterial({
    color: 0x454a50, transparent: true, opacity: 0.22, clippingPlanes: activeClipPlanes,
  });

  const matTrainMaroon = regMat(new THREE.MeshStandardMaterial({ color: 0x6b242b, roughness: 0.55, metalness: 0.08 }));
  const matTrainIvory = regMat(new THREE.MeshStandardMaterial({ color: 0xe6e2da, roughness: 0.60, metalness: 0.05 }));
  const matTrainGlass = regMat(new THREE.MeshStandardMaterial({ color: 0x3b4854, roughness: 0.25, metalness: 0.15 }));
  const matFigure = regMat(new THREE.MeshStandardMaterial({ color: 0x3e4247, roughness: 0.9, metalness: 0.0 }));

  const matEdge = new THREE.LineBasicMaterial({
    color: 0x2a2e33, transparent: true, opacity: 0.16, clippingPlanes: activeClipPlanes,
  });
  const matLineMajor = new THREE.LineBasicMaterial({ color: 0x4b4f54, transparent: true, opacity: 0.65 });
  const matLineMinor = new THREE.LineBasicMaterial({ color: 0x7b7e82, transparent: true, opacity: 0.40 });
  const matLineAccent = new THREE.LineBasicMaterial({ color: 0x6b242b, transparent: true, opacity: 0.55 });

  function addArchMesh(parent, geo, mat, { castShadow = true, receiveShadow = true, edges = true, edgeAngle = 22, edgeMat = matEdge } = {}) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    parent.add(mesh);
    if (edges) {
      const eg = new THREE.EdgesGeometry(geo, edgeAngle);
      mesh.add(new THREE.LineSegments(eg, edgeMat));
    }
    return mesh;
  }

  function createScaleFigure() {
    const g = new THREE.Group();
    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.85, 8), matFigure);
    legs.position.y = 0.425; legs.castShadow = true; g.add(legs);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.62, 8), matFigure);
    torso.position.y = 1.16; torso.castShadow = true; g.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), matFigure);
    head.position.y = 1.63; head.castShadow = true; g.add(head);
    return g;
  }

  // --- Strict Scene Hierarchy ---
  const groups = {
    siteBase: new THREE.Group(),          // 01_Site_Base_Water_Terraces
    contextFootprints: new THREE.Group(), // 01a_Context_Colleges_Footprints
    contextMassing: new THREE.Group(),    // 01b_Context_Colleges_Massing
    ring2F: new THREE.Group(),            // 02_Ring2F_Bridges_Stairs_BikeGallery
    cores: new THREE.Group(),             // 03_Vertical_Cores
    station3F: new THREE.Group(),         // 04_Station3F_Platforms
    stationB1: new THREE.Group(),         // 04a_Station_B1_EnclosedBox
    stationB2: new THREE.Group(),         // 04b_Station_B2_OpenPortals (non-peelable portals)
    stationB2Roof: new THREE.Group(),     // 04c_Station_B2_TwinRoof (peelable roof plates)
    safegeTracks: new THREE.Group(),      // 05_SAFEGE_Tracks_Trains
    acousticA1: new THREE.Group(),        // 06a_Acoustic_A1_Baffles
    acousticA2: new THREE.Group(),        // 06b_Acoustic_A2_Tunnel
    figures: new THREE.Group(),           // 07_Scale_Figures
    helpers: new THREE.Group(),           // 08_SliceBox_SectionPlane_Axes
  };

  Object.entries(groups).forEach(([k, g]) => { g.name = k; root.add(g); });

  function makeTrackAlignedGroup(name) {
    const g = new THREE.Group();
    g.name = name;
    g.rotation.y = -AXIS_RAD;
    return g;
  }

  const stationLocal = makeTrackAlignedGroup('Station_Local');
  const b1Local = makeTrackAlignedGroup('B1_Local');
  const b2Local = makeTrackAlignedGroup('B2_Local');
  const b2RoofLocal = makeTrackAlignedGroup('B2_Roof_Local');
  const tracksLocal = makeTrackAlignedGroup('Tracks_Local');
  const a1Local = makeTrackAlignedGroup('A1_Local');
  const a2Local = makeTrackAlignedGroup('A2_Local');
  const coresLocal = makeTrackAlignedGroup('Cores_Local');

  groups.station3F.add(stationLocal);
  groups.stationB1.add(b1Local);
  groups.stationB2.add(b2Local);
  groups.stationB2Roof.add(b2RoofLocal);
  groups.safegeTracks.add(tracksLocal);
  groups.acousticA1.add(a1Local);
  groups.acousticA2.add(a2Local);
  groups.cores.add(coresLocal);

  const contextColliders = [];

  // =========================================================================
  // 01. SITE BASE, SUNKEN REFLECTING POOL TERRACES & 6 INWARD-OPENING U-COLLEGES
  // =========================================================================
  const groundBoard = new THREE.Mesh(
    new THREE.CylinderGeometry(188, 192, 1.4, 96),
    new THREE.MeshStandardMaterial({ color: 0xe6e3dc, roughness: 0.94, metalness: 0.0 })
  );
  groundBoard.position.y = -0.72;
  groundBoard.receiveShadow = true;
  groups.siteBase.add(groundBoard);

  // Central Ando Sunken Reflecting Pool & Stepped Amphitheater Terraces (R=26m -> R=19m)
  const poolBasin = addArchMesh(groups.siteBase, new THREE.CylinderGeometry(19.5, 19.5, 0.08, 64), matWater, {
    castShadow: false, receiveShadow: true, edges: false,
  });
  poolBasin.position.y = 0.04;

  // Concentric stepped minimalist concrete terrace rings around the reflecting pool
  [
    { rIn: 19.5, rOut: 21.8, h: 0.22 },
    { rIn: 21.8, rOut: 24.4, h: 0.42 },
    { rIn: 24.4, rOut: 27.2, h: 0.62 },
  ].forEach(({ rIn, rOut, h }) => {
    const s = new THREE.Shape();
    s.absarc(0, 0, rOut, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, rIn, 0, Math.PI * 2, true);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 72 });
    g.rotateX(Math.PI / 2);
    const m = addArchMesh(groups.siteBase, g, matBoardWarm, { castShadow: true, receiveShadow: true });
    m.position.y = h;
  });

  // Minimalist rectilinear concrete stepping causeway crossing the water basin along the track axis
  const causeway = addArchMesh(
    groups.siteBase,
    new THREE.BoxGeometry(54.0, 0.26, 4.4),
    matBoardPrimary,
    { castShadow: true, receiveShadow: true }
  );
  causeway.position.y = 0.20;
  causeway.rotation.y = -AXIS_RAD;

  // Subtle geometric lawn pad under outer courtyard
  const lawnRingShape = new THREE.Shape();
  lawnRingShape.absarc(0, 0, 44.5, 0, Math.PI * 2, false);
  const lawnHole = new THREE.Path();
  lawnHole.absarc(0, 0, 27.3, 0, Math.PI * 2, true);
  lawnRingShape.holes.push(lawnHole);
  const lawnGeo = new THREE.ExtrudeGeometry(lawnRingShape, { depth: 0.05, bevelEnabled: false, curveSegments: 72 });
  lawnGeo.rotateX(Math.PI / 2);
  const lawnMesh = new THREE.Mesh(lawnGeo, matLawnSubtle);
  lawnMesh.position.y = 0.05;
  lawnMesh.receiveShadow = true;
  groups.siteBase.add(lawnMesh);

  function addCircleLine(parent, radius, y, mat, segments = 128) {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
    }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    parent.add(line);
    return line;
  }

  function addPolyline(parent, pts, mat) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    parent.add(line);
    return line;
  }

  const yLine = 0.04;
  // Concentric site lines: central lawn (R=45), 1F inner walkway (R=54.5 & 58), outer vehicular ring (R=135 & 143)
  addCircleLine(groups.siteBase, 45.0, yLine, matLineMinor, 96);
  addCircleLine(groups.contextFootprints, 54.5, yLine, matLineMajor, 128);
  addCircleLine(groups.contextFootprints, 58.0, yLine, matLineMajor, 128);
  addCircleLine(groups.contextFootprints, 135.0, yLine, matLineMinor, 128);
  addCircleLine(groups.contextFootprints, 143.0, yLine, matLineMinor, 128);

  // Existing SE Circular Courtyard Pavilion (Satellite Map: SE quadrant R=28.5m, θ=+67°, Ø17.6m, H=7.2m)
  const pavRad = THREE.MathUtils.degToRad(67);
  const pavX = Math.cos(pavRad) * 28.5;
  const pavZ = Math.sin(pavRad) * 28.5;
  const pavFP = addCircleLine(groups.siteBase, 8.8, yLine + 0.02, matLineAccent, 64);
  pavFP.position.set(pavX, 0, pavZ);

  const pavMass = new THREE.Group();
  pavMass.position.set(pavX, 0, pavZ);
  const pavBase = addArchMesh(pavMass, new THREE.CylinderGeometry(7.2, 5.2, 2.2, 40), matContextPodium, {
    castShadow: false, receiveShadow: false, edgeMat: matContextEdge,
  });
  pavBase.position.y = 1.1;
  const pavTop = addArchMesh(pavMass, new THREE.CylinderGeometry(8.8, 7.6, 5.0, 40), matContextGhost, {
    castShadow: false, receiveShadow: false, edgeMat: matContextEdge,
  });
  pavTop.position.y = 4.7;
  groups.contextMassing.add(pavMass);

  // Landmarks matching real satellite map:
  // 1) North (12:00) Lakefront Spiral Student Center (x ≈ +18, z ≈ -162)
  [24, 16, 8].forEach((r) => {
    const c = addCircleLine(groups.contextFootprints, r, yLine, matLineMinor, 48);
    c.position.set(18, 0, -162);
  });
  // 2) South (6:00) Circular Entrance Plaza (x ≈ -4, z ≈ +152)
  [16, 9].forEach((r) => {
    const c = addCircleLine(groups.contextFootprints, r, yLine, matLineMinor, 48);
    c.position.set(-4, 0, 152);
  });

  // Track ground centerline projection
  const axisLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([localToWorld(-165, yLine, 0), localToWorld(165, yLine, 0)]),
    new THREE.LineDashedMaterial({ color: 0x6b242b, dashSize: 3.0, gapSize: 1.8, transparent: true, opacity: 0.45 })
  );
  axisLine.computeLineDistances();
  groups.siteBase.add(axisLine);

  // --- Build 6 Center-Symmetric Inward-Opening U-Shaped Colleges (65.5m radial wings!) ---
  const WING_R0 = 63.0;
  const WING_LEN = 65.5;   // Exact user-locked dormitory length: 65.5m (R = 63.0m to 128.5m)
  const WING_W = 13.0;
  const WING_H = 24.0;     // 7-story real scale
  const WING_HALF_ANGLE = 15.0; // Two wings at θ_c ± 15° (12 radial wings spaced every 30° around circle!)

  COLLEGE_ANGLES_DEG.forEach((deg, idx) => {
    const radCenter = THREE.MathUtils.degToRad(deg);
    const fpGroup = new THREE.Group();
    const massGroup = new THREE.Group();

    // 1. Twin 65.5m Radial 7-Story Dormitory Wings (opening INWARD toward central lawn!)
    [-1, 1].forEach((side) => {
      const wingDeg = deg + side * WING_HALF_ANGLE;
      const wingRad = THREE.MathUtils.degToRad(wingDeg);
      const cosW = Math.cos(wingRad);
      const sinW = Math.sin(wingRad);

      function w2w(r, y, t) {
        return new THREE.Vector3(r * cosW - t * sinW, y, r * sinW + t * cosW);
      }

      const wgFP = new THREE.Group();
      wgFP.rotation.y = -wingRad;
      const wgMass = new THREE.Group();
      wgMass.rotation.y = -wingRad;

      const rMid = WING_R0 + WING_LEN / 2;
      const hw = WING_W / 2;

      addPolyline(wgFP, [
        new THREE.Vector3(WING_R0, yLine, -hw),
        new THREE.Vector3(WING_R0 + WING_LEN, yLine, -hw),
        new THREE.Vector3(WING_R0 + WING_LEN, yLine, hw),
        new THREE.Vector3(WING_R0, yLine, hw),
        new THREE.Vector3(WING_R0, yLine, -hw),
      ], matLineMajor);

      const wingMesh = addArchMesh(
        wgMass,
        new THREE.BoxGeometry(WING_LEN, WING_H, WING_W),
        matContextGhost,
        { castShadow: false, receiveShadow: false, edgeMat: matContextEdge }
      );
      wingMesh.position.set(rMid, WING_H / 2, 0);

      for (let fl = 1; fl <= 6; fl++) {
        const fy = fl * 3.4;
        wgMass.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(WING_R0, fy, -hw),
            new THREE.Vector3(WING_R0 + WING_LEN, fy, -hw),
            new THREE.Vector3(WING_R0 + WING_LEN, fy, hw),
            new THREE.Vector3(WING_R0, fy, hw),
            new THREE.Vector3(WING_R0, fy, -hw),
          ]),
          matContextEdge
        ));
      }

      fpGroup.add(wgFP);
      massGroup.add(wgMass);

      contextColliders.push({
        name: `College_${idx + 1}_Wing_${side < 0 ? 'L' : 'R'}`,
        type: 'dorm7F',
        yMin: 0,
        yMax: WING_H,
        cornersWorld: [
          w2w(WING_R0, 0, -hw),
          w2w(WING_R0 + WING_LEN, 0, -hw),
          w2w(WING_R0 + WING_LEN, 0, hw),
          w2w(WING_R0, 0, hw),
        ],
      });
    });

    // 2. Outer Connecting Main Building Bar (AT THE OUTER PERIMETER -> closes back of U so U opens INWARD!)
    const barGroupFP = new THREE.Group();
    barGroupFP.rotation.y = -radCenter;
    const barGroupMass = new THREE.Group();
    barGroupMass.rotation.y = -radCenter;

    const barRIn = 112.0;
    const barROut = 128.0;
    const barDepth = barROut - barRIn;
    const barSpan = 48.0;
    const barH = 11.5;

    addPolyline(barGroupFP, [
      new THREE.Vector3(barRIn, yLine, -barSpan / 2),
      new THREE.Vector3(barROut, yLine, -barSpan / 2),
      new THREE.Vector3(barROut, yLine, barSpan / 2),
      new THREE.Vector3(barRIn, yLine, barSpan / 2),
      new THREE.Vector3(barRIn, yLine, -barSpan / 2),
    ], matLineMajor);

    const barMesh = addArchMesh(
      barGroupMass,
      new THREE.BoxGeometry(barDepth, barH, barSpan),
      matContextPodium,
      { castShadow: false, receiveShadow: false, edgeMat: matContextEdge }
    );
    barMesh.position.set(barRIn + barDepth / 2, barH / 2, 0);

    // 3. Inner Curved/Faceted 2F Activity Podium & 1F Covered Walkway facing Central Lawn
    const podR0 = 58.0;
    const podDepth = 5.5;
    const podHalfW = 19.5;
    const podH = 8.2;

    addPolyline(barGroupFP, [
      new THREE.Vector3(podR0, yLine, -podHalfW),
      new THREE.Vector3(podR0 + podDepth, yLine, -podHalfW),
      new THREE.Vector3(podR0 + podDepth, yLine, podHalfW),
      new THREE.Vector3(podR0, yLine, podHalfW),
      new THREE.Vector3(podR0, yLine, -podHalfW),
    ], matLineMajor);

    const podMesh = addArchMesh(
      barGroupMass,
      new THREE.BoxGeometry(podDepth, podH, podHalfW * 2),
      matContextPodium,
      { castShadow: false, receiveShadow: false, edgeMat: matContextEdge }
    );
    podMesh.position.set(podR0 + podDepth / 2, podH / 2, 0);

    const colCanopy = addArchMesh(
      barGroupMass,
      new THREE.BoxGeometry(3.4, 0.35, podHalfW * 2 + 4.0),
      matContextPodium,
      { castShadow: false, receiveShadow: false, edgeMat: matContextEdge }
    );
    colCanopy.position.set(56.2, 4.2, 0);

    const cosC = Math.cos(radCenter);
    const sinC = Math.sin(radCenter);
    function c2w(r, y, t) { return new THREE.Vector3(r * cosC - t * sinC, y, r * sinC + t * cosC); }
    contextColliders.push({
      name: `College_${idx + 1}_Podium2F`,
      type: 'podium2F',
      yMin: 0,
      yMax: podH,
      cornersWorld: [
        c2w(podR0, 0, -podHalfW),
        c2w(podR0 + podDepth, 0, -podHalfW),
        c2w(podR0 + podDepth, 0, podHalfW),
        c2w(podR0, 0, podHalfW),
      ],
    });

    fpGroup.add(barGroupFP);
    massGroup.add(barGroupMass);
    groups.contextFootprints.add(fpGroup);
    groups.contextMassing.add(massGroup);
  });

  // =========================================================================
  // 02. PURPLE 2F CLOSED RING CORRIDOR (D = 100m, R = 50m) + 6 BRIDGES + BIKE GALLERIES + GRAND STAIRS
  // =========================================================================
  const R_RING = 50.0; // User-locked Diameter = 100.0m!
  const RING_W = 5.2;
  const RING_INNER = R_RING - RING_W / 2; // 47.4
  const RING_OUTER = R_RING + RING_W / 2; // 52.6
  const SLAB_2F_H = 0.48;

  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, RING_OUTER, 0, Math.PI * 2, false);
  const ringHole = new THREE.Path();
  ringHole.absarc(0, 0, RING_INNER, 0, Math.PI * 2, true);
  ringShape.holes.push(ringHole);

  const ringGeo = new THREE.ExtrudeGeometry(ringShape, { depth: SLAB_2F_H, bevelEnabled: false, curveSegments: 120 });
  ringGeo.rotateX(Math.PI / 2);
  const ringMesh = addArchMesh(groups.ring2F, ringGeo, matRing2F);
  ringMesh.position.y = DATUMS.F2;

  function addRingParapet(r1, r2, yTop, h, mat, edges = true) {
    const s = new THREE.Shape();
    s.absarc(0, 0, r2, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, r1, 0, Math.PI * 2, true);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 120 });
    g.rotateX(Math.PI / 2);
    const m = addArchMesh(groups.ring2F, g, mat, { edges, castShadow: mat !== matGlass });
    m.position.y = yTop;
    return m;
  }

  addRingParapet(RING_INNER, RING_INNER + 0.24, DATUMS.F2 + 0.36, 0.36, matRing2F);
  addRingParapet(RING_INNER + 0.08, RING_INNER + 0.16, DATUMS.F2 + 1.12, 0.76, matGlass, false);
  addRingParapet(RING_OUTER - 0.24, RING_OUTER, DATUMS.F2 + 0.36, 0.36, matRing2F);
  addRingParapet(RING_OUTER - 0.16, RING_OUTER - 0.08, DATUMS.F2 + 1.12, 0.76, matGlass, false);

  const colGeo = new THREE.CylinderGeometry(0.32, 0.32, DATUMS.F2 - SLAB_2F_H, 16);
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2 + THREE.MathUtils.degToRad(5);
    const col = addArchMesh(groups.ring2F, colGeo, matBoardDark, { edgeAngle: 35 });
    col.position.set(Math.cos(a) * R_RING, (DATUMS.F2 - SLAB_2F_H) / 2, Math.sin(a) * R_RING);
  }

  // 6 Radial Bridges + 12 Under-Ring Bicycle/E-Bike Slatted Parking Galleries
  COLLEGE_ANGLES_DEG.forEach((deg) => {
    const bg = new THREE.Group();
    const rad = THREE.MathUtils.degToRad(deg);
    bg.rotation.y = -rad;

    const bridgeLen = 7.0;
    const bridgeW = 4.6;
    const bridgeDeck = addArchMesh(bg, new THREE.BoxGeometry(bridgeLen, SLAB_2F_H, bridgeW), matRing2F);
    bridgeDeck.position.set(55.7, DATUMS.F2 - SLAB_2F_H / 2, 0);

    [-bridgeW / 2 + 0.12, bridgeW / 2 - 0.12].forEach((zOff) => {
      const curb = addArchMesh(bg, new THREE.BoxGeometry(bridgeLen, 0.42, 0.22), matRing2F);
      curb.position.set(55.7, DATUMS.F2 + 0.21, zOff);
      const gl = addArchMesh(bg, new THREE.BoxGeometry(bridgeLen, 0.68, 0.06), matGlass, { edges: false, castShadow: false });
      gl.position.set(55.7, DATUMS.F2 + 0.76, zOff);
    });

    const nodeSlab = addArchMesh(bg, new THREE.BoxGeometry(3.8, SLAB_2F_H + 0.08, 12.0), matRing2F);
    nodeSlab.position.set(59.6, DATUMS.F2 - SLAB_2F_H / 2, 0);
    const portalTop = addArchMesh(bg, new THREE.BoxGeometry(1.1, 0.46, 12.0), matBoardPrimary);
    portalTop.position.set(58.4, DATUMS.F2 + 3.4, 0);
    [-5.5, 5.5].forEach((zP) => {
      const pier = addArchMesh(bg, new THREE.BoxGeometry(1.1, 3.4, 0.55), matBoardPrimary);
      pier.position.set(58.4, DATUMS.F2 + 1.7, zP);
    });

    [-1, 1].forEach((side) => {
      const subAngle = THREE.MathUtils.degToRad(side * 12);
      const bikeBay = new THREE.Group();
      bikeBay.rotation.y = -subAngle;

      const plinth = addArchMesh(bikeBay, new THREE.BoxGeometry(4.2, 0.14, 12.6), matBoardWarm, { edges: true });
      plinth.position.set(R_RING, 0.07, 0);

      for (let z = -5.8; z <= 5.8; z += 0.95) {
        const slat = addArchMesh(bikeBay, new THREE.BoxGeometry(0.14, 3.2, 0.22), matBikeSlat, { edges: false });
        slat.position.set(R_RING + 1.95, 1.65, z);
      }
      const slatTop = addArchMesh(bikeBay, new THREE.BoxGeometry(0.32, 0.24, 12.2), matBoardDark);
      slatTop.position.set(R_RING + 1.95, 3.25, 0);

      for (let z = -5.0; z <= 5.0; z += 1.25) {
        const hoop = addArchMesh(bikeBay, new THREE.BoxGeometry(1.4, 0.72, 0.08), matSteelGirder, { edges: false, castShadow: false });
        hoop.position.set(R_RING - 0.3, 0.48, z);
      }

      bg.add(bikeBay);
    });

    groups.ring2F.add(bg);
  });

  // Sculptural Outdoor Grand Stairs & Barrier-Free Ramps descending from 2F Ring into Central Courtyard
  [-105, 115].forEach((deg) => {
    const sg = new THREE.Group();
    sg.rotation.y = -THREE.MathUtils.degToRad(deg);

    const steps = 16;
    const runTotal = 11.2;
    const stairW = 5.4;
    for (let i = 0; i < steps; i++) {
      const hStep = DATUMS.F2 * (1 - i / steps);
      const rPos = RING_INNER - (i + 0.5) * (runTotal / steps);
      const tread = addArchMesh(sg, new THREE.BoxGeometry(runTotal / steps + 0.05, hStep, stairW), matBoardWarm, { edges: i % 2 === 0 });
      tread.position.set(rPos, hStep / 2, 0);
    }
    [-stairW / 2 - 0.18, stairW / 2 + 0.18].forEach((zW) => {
      const cheek = addArchMesh(sg, new THREE.BoxGeometry(runTotal + 0.4, DATUMS.F2 + 0.7, 0.32), matRing2F);
      cheek.position.set(RING_INNER - runTotal / 2, (DATUMS.F2 + 0.7) / 2, zW);
    });

    const ramp1 = addArchMesh(sg, new THREE.BoxGeometry(12.0, 0.32, 2.2), matRing2F);
    ramp1.position.set(RING_INNER - 6.0, DATUMS.F2 * 0.75, stairW / 2 + 1.6);
    ramp1.rotation.z = 0.21;
    const landing = addArchMesh(sg, new THREE.BoxGeometry(2.8, 0.36, 4.8), matBoardWarm);
    landing.position.set(RING_INNER - 12.6, DATUMS.F2 * 0.5, stairW / 2 + 2.8);
    const ramp2 = addArchMesh(sg, new THREE.BoxGeometry(12.0, 0.32, 2.2), matRing2F);
    ramp2.position.set(RING_INNER - 6.0, DATUMS.F2 * 0.25, stairW / 2 + 4.0);
    ramp2.rotation.z = -0.21;

    groups.ring2F.add(sg);
  });

  // =========================================================================
  // 03. VERTICAL CORES (ANDO NE CYLINDER + SW RECTANGULAR BOX + 2F SKY-BRIDGES)
  // =========================================================================
  const CORE_H = DATUMS.LINTEL_TOP + 0.45; // 19.60m

  // --- 3A. NE Cylindrical Vertical Core ---
  const cylGroup = new THREE.Group();
  cylGroup.position.set(6.0, 0, -16.2);

  const CYL_R_OUT = 7.0;
  const CYL_R_IN = 6.4;
  const slitRad = 0.06;
  [
    [slitRad, Math.PI - slitRad],
    [Math.PI + slitRad, Math.PI * 2 - slitRad],
  ].forEach(([a0, a1]) => {
    const s = new THREE.Shape();
    s.absarc(0, 0, CYL_R_OUT, a0, a1, false);
    s.absarc(0, 0, CYL_R_IN, a1, a0, true);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: CORE_H, bevelEnabled: false, curveSegments: 44 });
    g.rotateX(-Math.PI / 2);
    addArchMesh(cylGroup, g, matStation3F);
  });

  const oculusShape = new THREE.Shape();
  oculusShape.absarc(0, 0, CYL_R_OUT + 0.3, 0, Math.PI * 2, false);
  const oculusHole = new THREE.Path();
  oculusHole.absarc(0, 0, 4.0, 0, Math.PI * 2, true);
  oculusShape.holes.push(oculusHole);
  const oculusGeo = new THREE.ExtrudeGeometry(oculusShape, { depth: 0.48, bevelEnabled: false, curveSegments: 48 });
  oculusGeo.rotateX(Math.PI / 2);
  const oculusMesh = addArchMesh(cylGroup, oculusGeo, matStation3F);
  oculusMesh.position.y = CORE_H;

  [DATUMS.F2, DATUMS.F3].forEach((yLvl) => {
    const ls = new THREE.Shape();
    ls.absarc(0, 0, CYL_R_IN - 0.06, 0, Math.PI * 2, false);
    const lh = new THREE.Path();
    lh.absarc(0, 0, 2.5, 0, Math.PI * 2, true);
    ls.holes.push(lh);
    const lg = new THREE.ExtrudeGeometry(ls, { depth: 0.38, bevelEnabled: false, curveSegments: 36 });
    lg.rotateX(Math.PI / 2);
    const lm = addArchMesh(cylGroup, lg, matBoardWarm);
    lm.position.y = yLvl;
  });

  const liftCyl = addArchMesh(cylGroup, new THREE.CylinderGeometry(1.75, 1.75, CORE_H - 0.6, 20), matGlass, { edges: false, castShadow: false });
  liftCyl.position.y = (CORE_H - 0.6) / 2;

  const neBridge3F = addArchMesh(cylGroup, new THREE.BoxGeometry(8.0, 0.58, 5.0), matStation3F);
  neBridge3F.position.set(0, DATUMS.F3 - 0.29, 6.2);
  const neBridge2F = addArchMesh(cylGroup, new THREE.BoxGeometry(5.8, 0.48, 32.0), matRing2F);
  neBridge2F.position.set(0, DATUMS.F2 - 0.24, -19.0);
  const neMidPier = addArchMesh(cylGroup, new THREE.CylinderGeometry(0.36, 0.36, DATUMS.F2 - 0.48, 16), matBoardDark);
  neMidPier.position.set(0, (DATUMS.F2 - 0.48) / 2, -19.0);

  coresLocal.add(cylGroup);

  // --- 3B. SW Rectangular Concrete Box Core ---
  const boxGroup = new THREE.Group();
  boxGroup.position.set(-8.0, 0, 13.6);

  const BX = 12.0;
  const BZ = 7.6;
  const WT = 0.46;

  const wallN = addArchMesh(boxGroup, new THREE.BoxGeometry(BX - 0.9, CORE_H, WT), matStation3F);
  wallN.position.set(0, CORE_H / 2, -BZ / 2 + WT / 2);
  const wallS = addArchMesh(boxGroup, new THREE.BoxGeometry(BX - 0.9, CORE_H, WT), matStation3F);
  wallS.position.set(0, CORE_H / 2, BZ / 2 - WT / 2);
  const wallW = addArchMesh(boxGroup, new THREE.BoxGeometry(WT, CORE_H, BZ - 1.3), matStation3F);
  wallW.position.set(-BX / 2 + WT / 2, CORE_H / 2, 0);
  const wallE = addArchMesh(boxGroup, new THREE.BoxGeometry(WT, CORE_H, BZ - 1.3), matStation3F);
  wallE.position.set(BX / 2 - WT / 2, CORE_H / 2, 0);

  const boxRoof = addArchMesh(boxGroup, new THREE.BoxGeometry(BX + 0.5, 0.46, BZ + 0.5), matStation3F);
  boxRoof.position.set(0, CORE_H + 0.36, 0);

  const swLift = addArchMesh(boxGroup, new THREE.BoxGeometry(3.0, CORE_H - 0.4, 3.0), matGlass, { edges: false, castShadow: false });
  swLift.position.set(-3.0, (CORE_H - 0.4) / 2, 0);

  for (let f = 0; f < 2; f++) {
    const y0 = f === 0 ? 0 : DATUMS.F2;
    const hF = f === 0 ? DATUMS.F2 : DATUMS.F3 - DATUMS.F2;
    const stair = addArchMesh(boxGroup, new THREE.BoxGeometry(5.6, 0.34, 2.0), matBoardWarm);
    stair.position.set(1.8, y0 + hF / 2, f === 0 ? -1.4 : 1.4);
    stair.rotation.z = f === 0 ? 0.58 : -0.58;
  }

  const swBridge3F = addArchMesh(boxGroup, new THREE.BoxGeometry(8.0, 0.58, 4.4), matStation3F);
  swBridge3F.position.set(0, DATUMS.F3 - 0.29, -4.6);

  const swBridge2F = addArchMesh(boxGroup, new THREE.BoxGeometry(5.8, 0.48, 34.0), matRing2F);
  swBridge2F.position.set(0, DATUMS.F2 - 0.24, 19.5);
  const swMidPier = addArchMesh(boxGroup, new THREE.CylinderGeometry(0.36, 0.36, DATUMS.F2 - 0.48, 16), matBoardDark);
  swMidPier.position.set(0, (DATUMS.F2 - 0.48) / 2, 19.5);

  coresLocal.add(boxGroup);

  // =========================================================================
  // 04. RAISED 3F MAIN STATION (LENGTH 96m, WIDTH 16.4m) + B1 vs B2 VARIANTS
  // =========================================================================
  const ST_LEN = 96.0;
  const ST_W = 16.4;
  const PLAT_W = 4.2;
  const SLAB_3F_H = 0.65;

  [-6.1, 6.1].forEach((zPlat) => {
    const plat = addArchMesh(stationLocal, new THREE.BoxGeometry(ST_LEN, SLAB_3F_H, PLAT_W), matStation3F);
    plat.position.set(0, DATUMS.F3 - SLAB_3F_H / 2, zPlat);

    const innerZ = zPlat > 0 ? zPlat - PLAT_W / 2 + 0.14 : zPlat + PLAT_W / 2 - 0.14;
    const curb = addArchMesh(stationLocal, new THREE.BoxGeometry(ST_LEN - 1.4, 0.34, 0.20), matBoardDark);
    curb.position.set(0, DATUMS.F3 + 0.17, innerZ);
    const screen = addArchMesh(stationLocal, new THREE.BoxGeometry(ST_LEN - 1.4, 1.15, 0.06), matGlass, { edges: false, castShadow: false });
    screen.position.set(0, DATUMS.F3 + 0.91, innerZ);

    const outerZ = zPlat > 0 ? zPlat + PLAT_W / 2 - 0.15 : zPlat - PLAT_W / 2 + 0.15;
    const outCurb = addArchMesh(stationLocal, new THREE.BoxGeometry(ST_LEN, 0.38, 0.26), matStation3F);
    outCurb.position.set(0, DATUMS.F3 + 0.19, outerZ);
    const outGlass = addArchMesh(stationLocal, new THREE.BoxGeometry(ST_LEN - 0.6, 0.85, 0.06), matGlass, { edges: false, castShadow: false });
    outGlass.position.set(0, DATUMS.F3 + 0.80, outerZ);
  });

  for (let s = -42; s <= 42; s += 14) {
    const tieBeam = addArchMesh(stationLocal, new THREE.BoxGeometry(0.80, 0.72, ST_W - 0.4), matBoardDark);
    tieBeam.position.set(s, DATUMS.F3 - SLAB_3F_H - 0.36, 0);
  }

  // --- VARIANT B2 (DEFAULT): OPEN 3-SEGMENT ORTHOGONAL INVERTED-U CONCRETE PORTALS + TWIN ROOFS ---
  const PORTAL_BAYS = [-42, -28, -14, 0, 14, 28, 42];
  const PORTAL_THICK_S = 1.35;
  const PORTAL_LEG_W = 1.15;
  const PORTAL_SPAN_OUT = ST_W + 2.4; // 18.8m

  PORTAL_BAYS.forEach((sBay) => {
    const legZ = PORTAL_SPAN_OUT / 2 - PORTAL_LEG_W / 2;

    [-legZ, legZ].forEach((zLeg) => {
      const leg = addArchMesh(
        b2Local,
        new THREE.BoxGeometry(PORTAL_THICK_S, DATUMS.LINTEL_BOT, PORTAL_LEG_W),
        matPortalConcrete
      );
      leg.position.set(sBay, DATUMS.LINTEL_BOT / 2, zLeg);
    });

    const lintelH = DATUMS.LINTEL_TOP - DATUMS.LINTEL_BOT; // 1.45m
    const lintel = addArchMesh(
      b2Local,
      new THREE.BoxGeometry(PORTAL_THICK_S, lintelH, PORTAL_SPAN_OUT),
      matPortalConcrete
    );
    lintel.position.set(sBay, DATUMS.LINTEL_BOT + lintelH / 2, 0);

    [-2.2, 2.2].forEach((zTrack) => {
      const hanger = addArchMesh(b2Local, new THREE.BoxGeometry(0.34, 1.15, 0.34), matSteelGirder);
      hanger.position.set(sBay, DATUMS.GIRDER_TOP + 0.52, zTrack);
    });
  });

  const ROOF_LEN = ST_LEN + 8.0; // 104m
  const ROOF_PLATE_W = 8.8;
  const ROOF_SLAB_T = 0.50;
  const SLIT_HALF = 0.55; // 1.10m central longitudinal light slit

  const roofNE = addArchMesh(b2RoofLocal, new THREE.BoxGeometry(ROOF_LEN, ROOF_SLAB_T, ROOF_PLATE_W), matShellRoof);
  roofNE.position.set(0, DATUMS.ROOF_LOW + ROOF_SLAB_T / 2, -(SLIT_HALF + ROOF_PLATE_W / 2));

  const roofSW = addArchMesh(b2RoofLocal, new THREE.BoxGeometry(ROOF_LEN, ROOF_SLAB_T, ROOF_PLATE_W), matShellRoof);
  roofSW.position.set(0, DATUMS.ROOF_HIGH + ROOF_SLAB_T / 2, SLIT_HALF + ROOF_PLATE_W / 2);

  PORTAL_BAYS.forEach((sBay) => {
    const spacer = addArchMesh(b2RoofLocal, new THREE.BoxGeometry(PORTAL_THICK_S, 0.50, 7.6), matPortalConcrete);
    spacer.position.set(sBay, DATUMS.ROOF_LOW + 0.25, SLIT_HALF + 4.2);
  });

  // --- VARIANT B1: CLASSIC ENCLOSED CONCRETE BOX STATION ---
  PORTAL_BAYS.forEach((sBay) => {
    [-ST_W / 2 + 0.45, ST_W / 2 - 0.45].forEach((zCol) => {
      const col = addArchMesh(b1Local, new THREE.BoxGeometry(0.85, DATUMS.ROOF_LOW, 0.85), matBoardPrimary);
      col.position.set(sBay, DATUMS.ROOF_LOW / 2, zCol);
    });
    const truss = addArchMesh(b1Local, new THREE.BoxGeometry(0.60, 0.90, ST_W), matSteelGirder);
    truss.position.set(sBay, DATUMS.GIRDER_TOP + 0.55, 0);
    [-2.2, 2.2].forEach((zTrack) => {
      const h = addArchMesh(b1Local, new THREE.BoxGeometry(0.32, 0.70, 0.32), matSteelGirder);
      h.position.set(sBay, DATUMS.GIRDER_TOP + 0.20, zTrack);
    });
  });

  [-ST_W / 2 + 0.20, ST_W / 2 - 0.20].forEach((zWall) => {
    const fascia = addArchMesh(b1Local, new THREE.BoxGeometry(ST_LEN + 2.0, 3.6, 0.30), matShellRoof);
    fascia.position.set(0, 17.2, zWall);
    const lowerWall = addArchMesh(b1Local, new THREE.BoxGeometry(ST_LEN, 1.4, 0.28), matShellRoof);
    lowerWall.position.set(0, DATUMS.F3 + 0.70, zWall);
    const glBand = addArchMesh(b1Local, new THREE.BoxGeometry(ST_LEN - 0.8, 2.4, 0.08), matGlass, { edges: false, castShadow: false });
    glBand.position.set(0, 14.2, zWall);

    for (let s = -46; s <= 46; s += 4.6) {
      if (zWall < 0 && s > 0 && s < 12) continue;
      if (zWall > 0 && s > -14 && s < -2) continue;
      const fin = addArchMesh(b1Local, new THREE.BoxGeometry(0.20, 2.4, 0.55), matShellRoof);
      fin.position.set(s, 14.2, zWall);
    }
  });
  [-4.35, 4.35].forEach((zR) => {
    const b1Roof = addArchMesh(b1Local, new THREE.BoxGeometry(ST_LEN + 3.0, 0.48, 8.1), matShellRoof);
    b1Roof.position.set(0, DATUMS.ROOF_LOW + 0.24, zR);
  });

  // =========================================================================
  // 05. SAFEGE SUSPENDED MONORAIL (304m VIADUCT + HOLLOW BOX GIRDERS + 2-CAR TRAINS)
  // =========================================================================
  const VIADUCT_LEN = 304.0;
  const TRACK_OFFSET = 2.2;

  function buildSafegeBoxGirder(length, zOffset) {
    const g = new THREE.Group();
    const w = 1.20;
    const h = 1.40;
    const t = 0.17;
    const slot = 0.38;
    const yBot = DATUMS.GIRDER_BOT;

    const topF = addArchMesh(g, new THREE.BoxGeometry(length, t, w), matSteelGirder);
    topF.position.set(0, yBot + h - t / 2, zOffset);

    [-w / 2 + t / 2, w / 2 - t / 2].forEach((dz) => {
      const web = addArchMesh(g, new THREE.BoxGeometry(length, h - 2 * t, t), matSteelGirder);
      web.position.set(0, yBot + h / 2, zOffset + dz);
    });

    const lipW = (w - slot) / 2;
    [-w / 2 + lipW / 2, w / 2 - lipW / 2].forEach((dz) => {
      const lip = addArchMesh(g, new THREE.BoxGeometry(length, t, lipW), matSteelGirder);
      lip.position.set(0, yBot + t / 2, zOffset + dz);
    });
    return g;
  }

  tracksLocal.add(buildSafegeBoxGirder(VIADUCT_LEN, -TRACK_OFFSET));
  tracksLocal.add(buildSafegeBoxGirder(VIADUCT_LEN, TRACK_OFFSET));

  [-148, -128, -106, -84, -62, 62, 84, 106, 128, 148].forEach((sPier) => {
    const pierW = 8.6;
    [-pierW / 2, pierW / 2].forEach((zLeg) => {
      const leg = addArchMesh(tracksLocal, new THREE.BoxGeometry(0.95, DATUMS.GIRDER_TOP + 0.75, 0.95), matBoardDark);
      leg.position.set(sPier, (DATUMS.GIRDER_TOP + 0.75) / 2, zLeg);
    });
    const crossHead = addArchMesh(tracksLocal, new THREE.BoxGeometry(1.0, 0.95, pierW + 1.1), matBoardDark);
    crossHead.position.set(sPier, DATUMS.GIRDER_TOP + 0.60, 0);
  });

  function buildSuspendedTrain(sCenter, zTrack) {
    const train = new THREE.Group();
    const carLen = 12.6;
    const carW = 2.45;
    const carH = 2.65;
    const gap = 0.70;

    [-carLen / 2 - gap / 2, carLen / 2 + gap / 2].forEach((dx) => {
      const car = new THREE.Group();
      car.position.set(dx, 0, 0);

      const lower = addArchMesh(car, new THREE.BoxGeometry(carLen, 1.15, carW), matTrainMaroon);
      lower.position.y = DATUMS.F3 + 0.575;

      const upper = addArchMesh(car, new THREE.BoxGeometry(carLen, 1.50, carW - 0.04), matTrainIvory);
      upper.position.y = DATUMS.F3 + 1.15 + 0.75;

      const win = new THREE.Mesh(new THREE.BoxGeometry(carLen - 0.4, 0.88, carW + 0.02), matTrainGlass);
      win.position.y = DATUMS.F3 + 1.72;
      car.add(win);

      [-3.6, 3.6].forEach((bx) => {
        const neck = addArchMesh(car, new THREE.BoxGeometry(1.15, 1.25, 0.30), matSteelGirder);
        neck.position.set(bx, DATUMS.F3 + carH + 0.55, 0);
        const bogie = addArchMesh(car, new THREE.BoxGeometry(2.2, 0.48, 0.80), matSteelGirder);
        bogie.position.set(bx, DATUMS.GIRDER_BOT + 0.36, 0);
      });

      train.add(car);
    });

    const bellows = addArchMesh(train, new THREE.BoxGeometry(gap + 0.1, 2.25, 1.98), matBoardDark);
    bellows.position.y = DATUMS.F3 + 1.25;

    train.position.set(sCenter, 0, zTrack);
    return train;
  }

  tracksLocal.add(buildSuspendedTrain(-6.0, -TRACK_OFFSET));
  tracksLocal.add(buildSuspendedTrain(74.0, TRACK_OFFSET));

  // =========================================================================
  // 06. ACOUSTIC VARIANTS (A1: FOLDED LOUVER BAFFLE vs A2: FULL TUNNEL SHELL)
  // =========================================================================
  const ACOUSTIC_SEGMENTS = [
    { start: -144, end: -50 },
    { start: 50, end: 144 },
  ];

  const yAcBase = DATUMS.F3 - 0.85; // +10.75m

  ACOUSTIC_SEGMENTS.forEach(({ start, end }) => {
    const len = end - start;
    const mid = (start + end) / 2;
    [-1, 1].forEach((side) => {
      const lowerWall = addArchMesh(a1Local, new THREE.BoxGeometry(len, 4.0, 0.28), matAcoustic);
      lowerWall.position.set(mid, yAcBase + 1.95, side * 4.65);
      lowerWall.rotation.x = side * -0.14;

      const upperFold = addArchMesh(a1Local, new THREE.BoxGeometry(len, 3.5, 0.26), matAcoustic);
      upperFold.position.set(mid, yAcBase + 5.55, side * 3.25);
      upperFold.rotation.x = side * 0.62;

      for (let s = start + 2; s <= end - 2; s += 5.5) {
        const rib = addArchMesh(a1Local, new THREE.BoxGeometry(0.20, 4.6, 0.58), matAcoustic);
        rib.position.set(s, yAcBase + 2.7, side * 4.45);
      }
    });
  });

  ACOUSTIC_SEGMENTS.forEach(({ start, end }) => {
    const len = end - start;
    const mid = (start + end) / 2;
    const tunW = 9.6;

    const topCap = addArchMesh(a2Local, new THREE.BoxGeometry(len, 0.32, tunW - 1.6), matAcoustic);
    topCap.position.set(mid, yAcBase + 6.9, 0);

    const botTray = addArchMesh(a2Local, new THREE.BoxGeometry(len, 0.26, tunW - 2.0), matAcoustic);
    botTray.position.set(mid, yAcBase, 0);

    [-1, 1].forEach((side) => {
      const chamferTop = addArchMesh(a2Local, new THREE.BoxGeometry(len, 0.28, 1.65), matAcoustic);
      chamferTop.position.set(mid, yAcBase + 6.4, side * (tunW / 2 - 0.55));
      chamferTop.rotation.x = side * 0.65;

      const upWall = addArchMesh(a2Local, new THREE.BoxGeometry(len, 2.3, 0.28), matAcoustic);
      upWall.position.set(mid, yAcBase + 4.85, side * (tunW / 2));

      const glStrip = addArchMesh(a2Local, new THREE.BoxGeometry(len - 0.4, 1.45, 0.08), matGlass, { edges: false, castShadow: false });
      glStrip.position.set(mid, yAcBase + 3.0, side * (tunW / 2 - 0.06));

      const loWall = addArchMesh(a2Local, new THREE.BoxGeometry(len, 2.15, 0.28), matAcoustic);
      loWall.position.set(mid, yAcBase + 1.2, side * (tunW / 2));

      for (let s = start + 2; s <= end - 2; s += 6.0) {
        const rib = addArchMesh(a2Local, new THREE.BoxGeometry(0.30, 6.5, 0.44), matAcoustic);
        rib.position.set(s, yAcBase + 3.4, side * (tunW / 2 + 0.14));
      }
    });
  });

  // =========================================================================
  // 07. 1.75m SCALE FIGURES
  // =========================================================================
  [
    [10, 0.34, 4], [-12, 0.34, -7], [28, 0.05, -14], [-32, 0.05, 16], [16, 0.05, -34], [-22, 0.05, -28],
    [35, 0.05, 12], [-36, 0.05, -18],
  ].forEach(([x, y, z]) => {
    const fig = createScaleFigure();
    fig.position.set(x, y, z);
    groups.figures.add(fig);
  });

  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + 0.12;
    const fig = createScaleFigure();
    fig.position.set(Math.cos(a) * (R_RING + (i % 2 ? 0.7 : -0.7)), DATUMS.F2, Math.sin(a) * (R_RING + (i % 2 ? 0.7 : -0.7)));
    groups.ring2F.add(fig);
  }

  [
    [-34, -5.8], [-22, -6.2], [-10, -5.6], [2, -6.1], [14, -5.8], [26, -6.3], [36, -5.7],
    [-30, 6.0], [-16, 5.7], [-2, 6.2], [12, 5.8], [28, 6.1],
  ].forEach(([s, z]) => {
    const fig = createScaleFigure();
    fig.position.set(s, DATUMS.F3, z);
    stationLocal.add(fig);
  });

  // =========================================================================
  // 08. HELPERS: RECALIBRATED 1:100 SLICE BOXES (30m × 30m) + SECTION + AXES
  // =========================================================================
  function createSliceBoxHelper(sCenter, uCenter, labelColor = 0x6b242b) {
    const g = new THREE.Group();
    g.rotation.y = -AXIS_RAD;
    const size = 30.0;
    const h = 22.0;

    const wireGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(size, h, size));
    const wireMat = new THREE.LineBasicMaterial({ color: labelColor, transparent: true, opacity: 0.92 });
    const boxWire = new THREE.LineSegments(wireGeo, wireMat);
    boxWire.position.set(sCenter, h / 2, -uCenter);
    g.add(boxWire);

    const basePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ color: labelColor, transparent: true, opacity: 0.10, side: THREE.DoubleSide, depthWrite: false })
    );
    basePlane.rotation.x = -Math.PI / 2;
    basePlane.position.set(sCenter, 0.08, -uCenter);
    g.add(basePlane);

    return { group: g, sCenter, uCenter, size };
  }

  const sliceS1 = createSliceBoxHelper(4.0, 6.0, 0x6b242b);
  const sliceS2 = createSliceBoxHelper(-53.0, -3.0, 0x2c5a56);
  groups.helpers.add(sliceS1.group);
  groups.helpers.add(sliceS2.group);
  sliceS1.group.visible = false;
  sliceS2.group.visible = false;

  const secIndicator = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(240, 28)),
    new THREE.LineBasicMaterial({ color: 0x6b242b, transparent: true, opacity: 0.7 })
  );
  secIndicator.visible = false;
  groups.helpers.add(secIndicator);

  const explodeAxesGroup = new THREE.Group();
  const explodeAxisMat = new THREE.LineDashedMaterial({
    color: 0x4a4e54, dashSize: 1.0, gapSize: 0.7, transparent: true, opacity: 0.55,
  });
  [
    localToWorld(6.0, 0, 16.2),
    localToWorld(-8.0, 0, -13.6),
    localToWorld(-42, 0, 0),
    localToWorld(42, 0, 0),
  ].forEach((pt) => {
    const l = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(pt.x, 0, pt.z), new THREE.Vector3(pt.x, 44, pt.z)]),
      explodeAxisMat
    );
    l.computeLineDistances();
    explodeAxesGroup.add(l);
  });
  explodeAxesGroup.visible = false;
  groups.helpers.add(explodeAxesGroup);

  // =========================================================================
  // PROGRAMMATIC ZERO-COLLISION AUDIT (Bounding Box vs All 6 Colleges)
  // =========================================================================
  function checkCollisions() {
    const corridorHalfU = 5.05;
    let minDormClearance = Infinity;
    let minPodiumClearance = Infinity;
    const collisions = [];

    for (const c of contextColliders) {
      const localPts = c.cornersWorld.map((pt) => worldToTrackLocal(pt));
      const uVals = localPts.map((p) => p.u);
      const minU = Math.min(...uVals);
      const maxU = Math.max(...uVals);

      let clearance;
      if (maxU < -corridorHalfU) {
        clearance = -corridorHalfU - maxU;
      } else if (minU > corridorHalfU) {
        clearance = minU - corridorHalfU;
      } else {
        const sVals = localPts.map((p) => p.s);
        if (Math.max(...sVals) >= -152 && Math.min(...sVals) <= 152) {
          clearance = -Math.min(corridorHalfU - minU, maxU + corridorHalfU);
        } else {
          clearance = 99;
        }
      }

      if (c.type === 'dorm7F' && clearance < minDormClearance) minDormClearance = clearance;
      if (c.type === 'podium2F' && clearance < minPodiumClearance) minPodiumClearance = clearance;
      if (clearance <= 0) {
        collisions.push({ name: c.name, type: c.type, overlapM: Number((-clearance).toFixed(2)) });
      }
    }

    return {
      collisionCount: collisions.length,
      collisions,
      minDormClearanceM: Number(minDormClearance.toFixed(2)),
      minPodiumClearanceM: Number(minPodiumClearance.toFixed(2)),
    };
  }

  // =========================================================================
  // INTERACTIVE STATE CONTROLLER
  // =========================================================================
  const state = {
    contextMode: 'ghost',
    stationVariant: 'B2',
    acousticVariant: 'A1',
    sliceMode: 'OFF',
    clipToSlice: false,
    peel: 0.0,
    explode: 0.0,
    sectionEnabled: false,
    sectionAxis: 'transverse',
    sectionPos: 0.0,
    colorMode: 'white',
  };

  function applyState() {
    groups.contextMassing.visible = state.contextMode === 'ghost';
    groups.contextFootprints.visible = state.contextMode !== 'hidden';

    const isB2 = state.stationVariant === 'B2';
    groups.stationB1.visible = !isB2;
    groups.stationB2.visible = isB2;
    groups.stationB2Roof.visible = isB2;

    groups.acousticA1.visible = state.acousticVariant === 'A1';
    groups.acousticA2.visible = state.acousticVariant === 'A2';

    if (state.colorMode === 'white') {
      matRing2F.color.setHex(0xd8d5ce);
      matStation3F.color.setHex(0xd8d5ce);
      matPortalConcrete.color.setHex(0xd4d0c8);
      matShellRoof.color.setHex(0xd8d5ce);
      matAcoustic.color.setHex(0xd5d2ca);
    } else {
      matRing2F.color.setHex(0xb8aec9);
      matStation3F.color.setHex(0xc99c94);
      matPortalConcrete.color.setHex(0xc5958d);
      matShellRoof.color.setHex(0xd4b0a8);
      matAcoustic.color.setHex(0xa8bfb0);
    }

    const ex = state.explode;
    groups.ring2F.position.y = ex * 8.0;
    groups.station3F.position.y = ex * 17.0;
    groups.stationB1.position.y = ex * 17.0;
    groups.stationB2.position.y = ex * 17.0;
    groups.safegeTracks.position.y = ex * 17.0;
    groups.acousticA1.position.y = ex * 17.0;
    groups.acousticA2.position.y = ex * 17.0;
    groups.stationB2Roof.position.y = ex * 25.0;
    explodeAxesGroup.visible = ex > 0.02;

    const p = state.peel;
    const peelLift = p * 10.5;
    const peelOpacity = Math.max(0.0, 1.0 - p * 1.15);
    groups.stationB2Roof.position.y += peelLift;
    groups.acousticA1.position.y += peelLift * 0.65;
    groups.acousticA2.position.y += peelLift * 0.65;
    matShellRoof.opacity = peelOpacity;
    matAcoustic.opacity = peelOpacity;

    if (isB2) {
      groups.stationB2Roof.visible = peelOpacity > 0.04;
    } else {
      groups.stationB1.visible = peelOpacity > 0.04;
    }
    if (state.acousticVariant === 'A1') groups.acousticA1.visible = peelOpacity > 0.04;
    if (state.acousticVariant === 'A2') groups.acousticA2.visible = peelOpacity > 0.04;

    sliceS1.group.visible = state.sliceMode === 'S1';
    sliceS2.group.visible = state.sliceMode === 'S2';

    activeClipPlanes.length = 0;

    if (state.sectionEnabled) {
      if (state.sectionAxis === 'transverse') {
        sectionPlane.normal.set(-DIR_SE.x, 0, -DIR_SE.z).normalize();
        sectionPlane.constant = state.sectionPos;
        secIndicator.position.copy(localToWorld(state.sectionPos, 13, 0));
        secIndicator.rotation.set(0, -AXIS_RAD + Math.PI / 2, 0);
      } else {
        sectionPlane.normal.set(-PERP_NE.x, 0, -PERP_NE.z).normalize();
        sectionPlane.constant = state.sectionPos;
        secIndicator.position.copy(localToWorld(0, 13, state.sectionPos));
        secIndicator.rotation.set(0, -AXIS_RAD, 0);
      }
      secIndicator.visible = true;
      activeClipPlanes.push(sectionPlane);
    } else {
      secIndicator.visible = false;
    }

    if (state.clipToSlice && state.sliceMode !== 'OFF') {
      const targetSlice = state.sliceMode === 'S1' ? sliceS1 : sliceS2;
      const half = targetSlice.size / 2;
      slicePlanes[0].normal.copy(DIR_SE);
      slicePlanes[0].constant = -(targetSlice.sCenter - half);
      slicePlanes[1].normal.copy(DIR_SE).negate();
      slicePlanes[1].constant = targetSlice.sCenter + half;
      slicePlanes[2].normal.copy(PERP_NE);
      slicePlanes[2].constant = -(targetSlice.uCenter - half);
      slicePlanes[3].normal.copy(PERP_NE).negate();
      slicePlanes[3].constant = targetSlice.uCenter + half;
      activeClipPlanes.push(...slicePlanes);
    }
  }

  applyState();

  return { root, groups, state, applyState, checkCollisions };
}
