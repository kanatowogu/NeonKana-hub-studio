import * as THREE from 'three';

/**
 * BNBU Phase II Residential College Cluster — Option A Suspended Monorail Hub (Rev 2)
 * Parametric Architectural White-Model Builder (Three.js v0.170.0)
 * Follows SKILL.md Tadao Ando White-Model Standard & GEOMETRY_SPEC.md (Rev 2)
 * Includes realistic 6 U-shaped Phase II College Massing (Ghost / Wireframe / Hidden)
 * and programmatic zero-collision clearance verification.
 */

export const AXIS_DEG = 45; // Exact NW (-135°) to SE (+45°) in XZ plane (+X=East, +Z=South)
export const AXIS_RAD = THREE.MathUtils.degToRad(AXIS_DEG);
export const DIR_SE = new THREE.Vector3(Math.cos(AXIS_RAD), 0, Math.sin(AXIS_RAD));
export const PERP_NE = new THREE.Vector3(Math.sin(AXIS_RAD), 0, -Math.cos(AXIS_RAD));

export const DATUMS = {
  F1: 0.0,
  F2: 4.8,
  F3: 9.6,
  GIRDER_BOT: 13.1,
  GIRDER_TOP: 14.45,
  ROOF_BOT: 15.8,
  ROOF_TOP: 16.25,
};

// 6 U-shaped colleges positioned so NW (-135°) & SE (+45°) gaps align cleanly with the monorail canyon
export const COLLEGE_ANGLES_DEG = [-105, -45, 15, 75, 135, -165];

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
  root.name = 'BNBU_OptionA_Hub_Root';

  // --- Shared Clipping Planes (Section Cut + 1:100 Slice Box) ---
  const sectionPlane = new THREE.Plane(new THREE.Vector3(-PERP_NE.x, 0, -PERP_NE.z), 999);
  const slicePlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), 999),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), 999),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 999),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), 999),
  ];
  const activeClipPlanes = [];

  // --- Materials (SKILL.md Clay/White-Model Standard) ---
  function regMat(mat) {
    mat.clippingPlanes = activeClipPlanes;
    mat.clipShadows = true;
    return mat;
  }

  const matBoardPrimary = regMat(new THREE.MeshStandardMaterial({
    color: 0xd8d5ce,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.DoubleSide,
  }));

  const matBoardWarm = regMat(new THREE.MeshStandardMaterial({
    color: 0xd2cfc7,
    roughness: 0.88,
    metalness: 0.0,
    side: THREE.DoubleSide,
  }));

  const matBoardDark = regMat(new THREE.MeshStandardMaterial({
    color: 0xc2beb5,
    roughness: 0.86,
    metalness: 0.0,
    side: THREE.DoubleSide,
  }));

  const matRing2F = regMat(new THREE.MeshStandardMaterial({
    color: 0xd8d5ce,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.DoubleSide,
  }));

  const matStation3F = regMat(new THREE.MeshStandardMaterial({
    color: 0xd8d5ce,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.DoubleSide,
  }));

  const matAcoustic = regMat(new THREE.MeshStandardMaterial({
    color: 0xd5d2ca,
    roughness: 0.86,
    metalness: 0.0,
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide,
  }));

  const matShellRoof = regMat(new THREE.MeshStandardMaterial({
    color: 0xd8d5ce,
    roughness: 0.85,
    metalness: 0.0,
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide,
  }));

  const matSteelGirder = regMat(new THREE.MeshStandardMaterial({
    color: 0xbcb9b1,
    roughness: 0.72,
    metalness: 0.12,
    side: THREE.DoubleSide,
  }));

  const matGlass = regMat(new THREE.MeshStandardMaterial({
    color: 0x9bb0bc,
    roughness: 0.22,
    metalness: 0.05,
    transparent: true,
    opacity: 0.30,
    depthWrite: false,
    side: THREE.DoubleSide,
  }));

  // Context Existing Phase II Colleges — Translucent Ghost Massing (default)
  const matContextGhost = regMat(new THREE.MeshStandardMaterial({
    color: 0xe3e0d9,
    roughness: 0.90,
    metalness: 0.0,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    side: THREE.DoubleSide,
  }));

  const matContextPodium = regMat(new THREE.MeshStandardMaterial({
    color: 0xd6d2c9,
    roughness: 0.90,
    metalness: 0.0,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    side: THREE.DoubleSide,
  }));

  const matContextEdge = new THREE.LineBasicMaterial({
    color: 0x454a50,
    transparent: true,
    opacity: 0.22,
    clippingPlanes: activeClipPlanes,
  });

  const matTrainMaroon = regMat(new THREE.MeshStandardMaterial({
    color: 0x6b242b,
    roughness: 0.55,
    metalness: 0.08,
  }));

  const matTrainIvory = regMat(new THREE.MeshStandardMaterial({
    color: 0xe6e2da,
    roughness: 0.60,
    metalness: 0.05,
  }));

  const matTrainGlass = regMat(new THREE.MeshStandardMaterial({
    color: 0x3b4854,
    roughness: 0.25,
    metalness: 0.15,
  }));

  const matFigure = regMat(new THREE.MeshStandardMaterial({
    color: 0x3e4247,
    roughness: 0.9,
    metalness: 0.0,
  }));

  const matEdge = new THREE.LineBasicMaterial({
    color: 0x2a2e33,
    transparent: true,
    opacity: 0.17,
    clippingPlanes: activeClipPlanes,
  });

  const matLineMajor = new THREE.LineBasicMaterial({
    color: 0x4b4f54,
    transparent: true,
    opacity: 0.65,
  });

  const matLineMinor = new THREE.LineBasicMaterial({
    color: 0x7b7e82,
    transparent: true,
    opacity: 0.40,
  });

  const matLineAccent = new THREE.LineBasicMaterial({
    color: 0x6b242b,
    transparent: true,
    opacity: 0.55,
  });

  function addArchMesh(parent, geo, mat, { castShadow = true, receiveShadow = true, edges = true, edgeAngle = 22, edgeMat = matEdge } = {}) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    parent.add(mesh);
    if (edges) {
      const eg = new THREE.EdgesGeometry(geo, edgeAngle);
      const line = new THREE.LineSegments(eg, edgeMat);
      mesh.add(line);
    }
    return mesh;
  }

  function createScaleFigure() {
    const g = new THREE.Group();
    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.85, 8), matFigure);
    legs.position.y = 0.425;
    legs.castShadow = true;
    g.add(legs);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.62, 8), matFigure);
    torso.position.y = 1.16;
    torso.castShadow = true;
    g.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), matFigure);
    head.position.y = 1.63;
    head.castShadow = true;
    g.add(head);
    return g;
  }

  // --- Strict Scene Hierarchy ---
  const groups = {
    siteBase: new THREE.Group(),          // 01_Site_Base_Plinth
    contextFootprints: new THREE.Group(), // 01a_Context_Colleges_Footprints
    contextMassing: new THREE.Group(),    // 01b_Context_Colleges_Massing (Ghost / Hidden)
    ring2F: new THREE.Group(),            // 02_Ring2F_Bridges
    cores: new THREE.Group(),             // 03_Vertical_Cores
    station3F: new THREE.Group(),         // 04_Station3F_Structure
    stationShell: new THREE.Group(),      // 04b_Station3F_RoofShell (peelable)
    safegeTracks: new THREE.Group(),      // 05_SAFEGE_Tracks_Trains
    acousticA1: new THREE.Group(),        // 06a_Acoustic_A1_Baffles
    acousticA2: new THREE.Group(),        // 06b_Acoustic_A2_Tunnel
    figures: new THREE.Group(),           // 07_Scale_Figures
    helpers: new THREE.Group(),           // 08_SliceBox_SectionPlane_Axes
  };

  Object.entries(groups).forEach(([k, g]) => {
    g.name = k;
    root.add(g);
  });

  function makeTrackAlignedGroup(name) {
    const g = new THREE.Group();
    g.name = name;
    g.rotation.y = -AXIS_RAD;
    return g;
  }

  const stationLocal = makeTrackAlignedGroup('Station_Local');
  const shellLocal = makeTrackAlignedGroup('Shell_Local');
  const tracksLocal = makeTrackAlignedGroup('Tracks_Local');
  const a1Local = makeTrackAlignedGroup('A1_Local');
  const a2Local = makeTrackAlignedGroup('A2_Local');
  const coresLocal = makeTrackAlignedGroup('Cores_Local');

  groups.station3F.add(stationLocal);
  groups.stationShell.add(shellLocal);
  groups.safegeTracks.add(tracksLocal);
  groups.acousticA1.add(a1Local);
  groups.acousticA2.add(a2Local);
  groups.cores.add(coresLocal);

  // Store college OBBs for programmatic zero-collision verification
  const contextColliders = [];

  // =========================================================================
  // 01. SITE BASE PLINTH + 6 REALISTIC U-SHAPED PHASE II COLLEGES
  // =========================================================================
  const groundBoard = new THREE.Mesh(
    new THREE.CylinderGeometry(126, 128, 1.2, 96),
    new THREE.MeshStandardMaterial({ color: 0xe6e3dc, roughness: 0.94, metalness: 0.0 })
  );
  groundBoard.position.y = -0.62;
  groundBoard.receiveShadow = true;
  groups.siteBase.add(groundBoard);

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

  const yLine = 0.03;
  // Courtyard lawn & 1F inner walkway boundaries + outer vehicular ring
  addCircleLine(groups.siteBase, 26.0, yLine, matLineMinor, 96);
  addCircleLine(groups.contextFootprints, 34.8, yLine, matLineMajor, 128);
  addCircleLine(groups.contextFootprints, 37.2, yLine, matLineMinor, 128);
  addCircleLine(groups.contextFootprints, 89.5, yLine, matLineMinor, 128);
  addCircleLine(groups.contextFootprints, 95.5, yLine, matLineMinor, 128);

  // Existing NE Courtyard Circular Pavilion footprint outline (at s=+2, u=+11.6)
  const pavCenter = localToWorld(2.0, yLine, 11.6);
  const pavRing = addCircleLine(groups.siteBase, 7.6, 0, matLineAccent, 64);
  pavRing.position.copy(pavCenter);

  // Subtle ground footprint of Lakefront Spiral Student Center (W-NW landmark) & SE Entrance Plaza
  const spiralCenter = localToWorld(-74, yLine, -46);
  [18, 12, 6].forEach((r) => {
    const c = addCircleLine(groups.contextFootprints, r, 0, matLineMinor, 48);
    c.position.copy(spiralCenter);
  });
  const plazaCenter = localToWorld(74, yLine, 34);
  const plazaC = addCircleLine(groups.contextFootprints, 14, 0, matLineMinor, 48);
  plazaC.position.copy(plazaCenter);

  // Track ground centerline projection
  const axisLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([localToWorld(-106, yLine, 0), localToWorld(106, yLine, 0)]),
    new THREE.LineDashedMaterial({ color: 0x6b242b, dashSize: 2.5, gapSize: 1.5, transparent: true, opacity: 0.45 })
  );
  axisLine.computeLineDistances();
  groups.siteBase.add(axisLine);

  // Build each of the 6 U-Shaped Colleges (strictly matching p15_aedas_cluster.jpeg & p15_aedas_aerial.jpeg)
  // Parallel twin 7-story dormitory wings + outer 3-story U-bar + inner 2-story activity podium + 1F colonnade
  const WING_R0 = 43.5;
  const WING_LEN = 39.0;  // R = 43.5 to 82.5
  const WING_W = 9.0;
  const WING_H = 23.5;    // 7 stories (white concrete facade)
  const HALF_COURT = 6.0; // Internal courtyard = 12.0m wide; wing outer edge = ±15.0m

  COLLEGE_ANGLES_DEG.forEach((deg, idx) => {
    const rad = THREE.MathUtils.degToRad(deg);
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    // Helper converting college-local (r, y, t) -> world (x, y, z)
    // where r = radial outward, t = tangential right
    function c2w(r, y, t) {
      return new THREE.Vector3(r * cosA - t * sinA, y, r * sinA + t * cosA);
    }

    const fpGroup = new THREE.Group();
    fpGroup.rotation.y = -rad;
    const massGroup = new THREE.Group();
    massGroup.rotation.y = -rad;

    // 1. Twin Parallel 7-Story Dormitory Wings (Left & Right)
    [-1, 1].forEach((side) => {
      const tInner = side * HALF_COURT;
      const tOuter = side * (HALF_COURT + WING_W);
      const tMid = (tInner + tOuter) / 2;
      const rMid = WING_R0 + WING_LEN / 2;

      // Ground footprint outline
      addPolyline(fpGroup, [
        new THREE.Vector3(WING_R0, yLine, tInner),
        new THREE.Vector3(WING_R0 + WING_LEN, yLine, tInner),
        new THREE.Vector3(WING_R0 + WING_LEN, yLine, tOuter),
        new THREE.Vector3(WING_R0, yLine, tOuter),
        new THREE.Vector3(WING_R0, yLine, tInner),
      ], matLineMajor);

      // 7-Story Ghost Massing
      const wingMesh = addArchMesh(
        massGroup,
        new THREE.BoxGeometry(WING_LEN, WING_H, WING_W),
        matContextGhost,
        { castShadow: false, receiveShadow: false, edgeMat: matContextEdge }
      );
      wingMesh.position.set(rMid, WING_H / 2, tMid);

      // Subtle floor slab band lines (every 3.35m) to convey real 7-story dormitory scale
      for (let fl = 1; fl <= 6; fl++) {
        const fy = fl * 3.35;
        const band = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(WING_R0, fy, tInner),
            new THREE.Vector3(WING_R0 + WING_LEN, fy, tInner),
            new THREE.Vector3(WING_R0 + WING_LEN, fy, tOuter),
            new THREE.Vector3(WING_R0, fy, tOuter),
            new THREE.Vector3(WING_R0, fy, tInner),
          ]),
          matContextEdge
        );
        massGroup.add(band);
      }

      // Register 4 corners + height for exact collision verification
      contextColliders.push({
        name: `College_${idx + 1}_Wing_${side < 0 ? 'L' : 'R'}`,
        type: 'dorm7F',
        yMin: 0,
        yMax: WING_H,
        cornersWorld: [
          c2w(WING_R0, 0, tInner),
          c2w(WING_R0 + WING_LEN, 0, tInner),
          c2w(WING_R0 + WING_LEN, 0, tOuter),
          c2w(WING_R0, 0, tOuter),
        ],
      });
    });

    // 2. Outer 3-Story U-Connecting Podium Bar (closing the outer courtyard with roof garden)
    const barR0 = 73.5;
    const barLen = 9.0;
    const barW = HALF_COURT * 2;
    const barH = 11.0;
    addPolyline(fpGroup, [
      new THREE.Vector3(barR0, yLine, -HALF_COURT),
      new THREE.Vector3(barR0 + barLen, yLine, -HALF_COURT),
      new THREE.Vector3(barR0 + barLen, yLine, HALF_COURT),
      new THREE.Vector3(barR0, yLine, HALF_COURT),
      new THREE.Vector3(barR0, yLine, -HALF_COURT),
    ], matLineMinor);

    const barMesh = addArchMesh(
      massGroup,
      new THREE.BoxGeometry(barLen, barH, barW),
      matContextPodium,
      { castShadow: false, receiveShadow: false, edgeMat: matContextEdge }
    );
    barMesh.position.set(barR0 + barLen / 2, barH / 2, 0);

    // 3. Inner 2-Story Activity-Room Podium (facing central courtyard, clear of NW/SE monorail gaps!)
    const podR0 = 37.2;
    const podDepth = 5.8; // R = 37.2 to 43.0
    const podHalfW = 12.2; // Total width 24.4m -> half-angle at R=37.2 is 18.1°, leaving >23° clear canyon!
    const podH = 8.0;
    addPolyline(fpGroup, [
      new THREE.Vector3(podR0, yLine, -podHalfW),
      new THREE.Vector3(podR0 + podDepth, yLine, -podHalfW),
      new THREE.Vector3(podR0 + podDepth, yLine, podHalfW),
      new THREE.Vector3(podR0, yLine, podHalfW),
      new THREE.Vector3(podR0, yLine, -podHalfW),
    ], matLineMajor);

    const podMesh = addArchMesh(
      massGroup,
      new THREE.BoxGeometry(podDepth, podH, podHalfW * 2),
      matContextPodium,
      { castShadow: false, receiveShadow: false, edgeMat: matContextEdge }
    );
    podMesh.position.set(podR0 + podDepth / 2, podH / 2, 0);

    // 1F Covered Colonnade Canopy along inner face of each college (R = 34.8 to 37.2, h = 4.2m)
    const colCanopy = addArchMesh(
      massGroup,
      new THREE.BoxGeometry(2.4, 0.35, podHalfW * 2),
      matContextPodium,
      { castShadow: false, receiveShadow: false, edgeMat: matContextEdge }
    );
    colCanopy.position.set(36.0, 4.2, 0);

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

    groups.contextFootprints.add(fpGroup);
    groups.contextMassing.add(massGroup);
  });

  // =========================================================================
  // 02. PURPLE 2F CLOSED RING CORRIDOR + 6 RADIAL BRIDGES + INTERFACE NODES
  // =========================================================================
  const R_RING = 30.0;
  const RING_W = 4.6;
  const RING_INNER = R_RING - RING_W / 2; // 27.7
  const RING_OUTER = R_RING + RING_W / 2; // 32.3
  const SLAB_2F_H = 0.45;

  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, RING_OUTER, 0, Math.PI * 2, false);
  const ringHole = new THREE.Path();
  ringHole.absarc(0, 0, RING_INNER, 0, Math.PI * 2, true);
  ringShape.holes.push(ringHole);

  const ringGeo = new THREE.ExtrudeGeometry(ringShape, {
    depth: SLAB_2F_H,
    bevelEnabled: false,
    curveSegments: 96,
  });
  ringGeo.rotateX(Math.PI / 2);
  const ringMesh = addArchMesh(groups.ring2F, ringGeo, matRing2F);
  ringMesh.position.y = DATUMS.F2;

  function addRingParapet(r1, r2, yTop, h, mat, edges = true) {
    const s = new THREE.Shape();
    s.absarc(0, 0, r2, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, r1, 0, Math.PI * 2, true);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 96 });
    g.rotateX(Math.PI / 2);
    const m = addArchMesh(groups.ring2F, g, mat, { edges, castShadow: mat !== matGlass });
    m.position.y = yTop;
    return m;
  }

  addRingParapet(RING_INNER, RING_INNER + 0.22, DATUMS.F2 + 0.35, 0.35, matRing2F);
  addRingParapet(RING_INNER + 0.08, RING_INNER + 0.14, DATUMS.F2 + 1.10, 0.75, matGlass, false);
  addRingParapet(RING_OUTER - 0.22, RING_OUTER, DATUMS.F2 + 0.35, 0.35, matRing2F);
  addRingParapet(RING_OUTER - 0.14, RING_OUTER - 0.08, DATUMS.F2 + 1.10, 0.75, matGlass, false);

  const colGeo = new THREE.CylinderGeometry(0.28, 0.28, DATUMS.F2 - SLAB_2F_H, 16);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + THREE.MathUtils.degToRad(5);
    const col = addArchMesh(groups.ring2F, colGeo, matBoardDark, { edgeAngle: 35 });
    col.position.set(Math.cos(a) * R_RING, (DATUMS.F2 - SLAB_2F_H) / 2, Math.sin(a) * R_RING);
  }

  // 6 Short Radial Bridges connecting 2F Ring (R=32.1) cleanly into each College's 2F Podium (R=37.2)
  COLLEGE_ANGLES_DEG.forEach((deg) => {
    const rad = THREE.MathUtils.degToRad(deg);
    const bg = new THREE.Group();
    bg.rotation.y = -rad;

    const bridgeLen = 5.4; // R = 32.0 to 37.4
    const bridgeW = 4.2;
    const bridgeDeck = addArchMesh(bg, new THREE.BoxGeometry(bridgeLen, SLAB_2F_H, bridgeW), matRing2F);
    bridgeDeck.position.set(34.7, DATUMS.F2 - SLAB_2F_H / 2, 0);

    [-bridgeW / 2 + 0.12, bridgeW / 2 - 0.12].forEach((zOff) => {
      const curb = addArchMesh(bg, new THREE.BoxGeometry(bridgeLen, 0.42, 0.22), matRing2F);
      curb.position.set(34.7, DATUMS.F2 + 0.21, zOff);
      const gl = addArchMesh(bg, new THREE.BoxGeometry(bridgeLen, 0.65, 0.06), matGlass, { edges: false, castShadow: false });
      gl.position.set(34.7, DATUMS.F2 + 0.75, zOff);
    });

    // College 2F Interface Threshold Pad (flush with inner 2F podium face at R=37.2)
    const nodeSlab = addArchMesh(bg, new THREE.BoxGeometry(3.2, SLAB_2F_H + 0.08, 10.6), matRing2F);
    nodeSlab.position.set(38.6, DATUMS.F2 - SLAB_2F_H / 2, 0);

    const portalTop = addArchMesh(bg, new THREE.BoxGeometry(0.95, 0.42, 10.6), matBoardPrimary);
    portalTop.position.set(37.4, DATUMS.F2 + 3.2, 0);
    [-4.9, 4.9].forEach((zP) => {
      const pier = addArchMesh(bg, new THREE.BoxGeometry(0.95, 3.2, 0.50), matBoardPrimary);
      pier.position.set(37.4, DATUMS.F2 + 1.6, zP);
    });

    groups.ring2F.add(bg);
  });

  // 2F Concourse Transfer Bridge tying SW Box Core cleanly to 2F Ring
  const swTransfer = new THREE.Group();
  swTransfer.rotation.y = -AXIS_RAD;
  const swDeck = addArchMesh(swTransfer, new THREE.BoxGeometry(6.0, SLAB_2F_H, 16.5), matRing2F);
  swDeck.position.set(3.5, DATUMS.F2 - SLAB_2F_H / 2, 19.5);
  groups.ring2F.add(swTransfer);

  // =========================================================================
  // 03. VERTICAL CORES (ANDO CYLINDER NE + RECTANGULAR BOX SW)
  // =========================================================================
  const CORE_H = DATUMS.ROOF_TOP - 0.15;

  // --- 3A. NE Cylindrical Vertical Core ---
  const cylGroup = new THREE.Group();
  cylGroup.position.set(2.0, 0, -11.6);

  const CYL_R_OUT = 6.4;
  const CYL_R_IN = 5.85;
  const slitRad = 0.06;
  [
    [slitRad, Math.PI - slitRad],
    [Math.PI + slitRad, Math.PI * 2 - slitRad],
  ].forEach(([a0, a1]) => {
    const s = new THREE.Shape();
    s.absarc(0, 0, CYL_R_OUT, a0, a1, false);
    s.absarc(0, 0, CYL_R_IN, a1, a0, true);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: CORE_H, bevelEnabled: false, curveSegments: 40 });
    g.rotateX(-Math.PI / 2);
    addArchMesh(cylGroup, g, matStation3F);
  });

  const oculusShape = new THREE.Shape();
  oculusShape.absarc(0, 0, CYL_R_OUT + 0.25, 0, Math.PI * 2, false);
  const oculusHole = new THREE.Path();
  oculusHole.absarc(0, 0, 3.6, 0, Math.PI * 2, true);
  oculusShape.holes.push(oculusHole);
  const oculusGeo = new THREE.ExtrudeGeometry(oculusShape, { depth: 0.45, bevelEnabled: false, curveSegments: 48 });
  oculusGeo.rotateX(Math.PI / 2);
  const oculusMesh = addArchMesh(cylGroup, oculusGeo, matStation3F);
  oculusMesh.position.y = CORE_H;

  [DATUMS.F2, DATUMS.F3].forEach((yLvl) => {
    const ls = new THREE.Shape();
    ls.absarc(0, 0, CYL_R_IN - 0.05, 0, Math.PI * 2, false);
    const lh = new THREE.Path();
    lh.absarc(0, 0, 2.3, 0, Math.PI * 2, true);
    ls.holes.push(lh);
    const lg = new THREE.ExtrudeGeometry(ls, { depth: 0.35, bevelEnabled: false, curveSegments: 36 });
    lg.rotateX(Math.PI / 2);
    const lm = addArchMesh(cylGroup, lg, matBoardWarm);
    lm.position.y = yLvl;
  });

  const liftCyl = addArchMesh(cylGroup, new THREE.CylinderGeometry(1.55, 1.55, CORE_H - 0.6, 20), matGlass, { edges: false, castShadow: false });
  liftCyl.position.y = (CORE_H - 0.6) / 2;

  const neBridge3F = addArchMesh(cylGroup, new THREE.BoxGeometry(7.2, 0.50, 4.6), matStation3F);
  neBridge3F.position.set(0, DATUMS.F3 - 0.25, 5.2);
  const neBridge2F = addArchMesh(cylGroup, new THREE.BoxGeometry(5.6, 0.45, 18.0), matRing2F);
  neBridge2F.position.set(0, DATUMS.F2 - 0.225, -10.0);

  coresLocal.add(cylGroup);

  // --- 3B. SW Rectangular Concrete Box Core ---
  const boxGroup = new THREE.Group();
  boxGroup.position.set(3.5, 0, 10.8);

  const BX = 10.0;
  const BZ = 6.8;
  const WT = 0.42;

  const wallN = addArchMesh(boxGroup, new THREE.BoxGeometry(BX - 0.8, CORE_H, WT), matStation3F);
  wallN.position.set(0, CORE_H / 2, -BZ / 2 + WT / 2);
  const wallS = addArchMesh(boxGroup, new THREE.BoxGeometry(BX - 0.8, CORE_H, WT), matStation3F);
  wallS.position.set(0, CORE_H / 2, BZ / 2 - WT / 2);
  const wallW = addArchMesh(boxGroup, new THREE.BoxGeometry(WT, CORE_H, BZ - 1.2), matStation3F);
  wallW.position.set(-BX / 2 + WT / 2, CORE_H / 2, 0);
  const wallE = addArchMesh(boxGroup, new THREE.BoxGeometry(WT, CORE_H, BZ - 1.2), matStation3F);
  wallE.position.set(BX / 2 - WT / 2, CORE_H / 2, 0);

  const boxRoof = addArchMesh(boxGroup, new THREE.BoxGeometry(BX + 0.4, 0.42, BZ + 0.4), matStation3F);
  boxRoof.position.set(0, CORE_H + 0.35, 0);

  const swLift = addArchMesh(boxGroup, new THREE.BoxGeometry(2.6, CORE_H - 0.4, 2.6), matGlass, { edges: false, castShadow: false });
  swLift.position.set(-2.4, (CORE_H - 0.4) / 2, 0);

  for (let f = 0; f < 2; f++) {
    const y0 = f === 0 ? 0 : DATUMS.F2;
    const stair = addArchMesh(boxGroup, new THREE.BoxGeometry(4.8, 0.32, 1.8), matBoardWarm);
    stair.position.set(1.6, y0 + 2.4, f === 0 ? -1.2 : 1.2);
    stair.rotation.z = f === 0 ? 0.52 : -0.52;
  }

  const swBridge3F = addArchMesh(boxGroup, new THREE.BoxGeometry(7.2, 0.50, 3.6), matStation3F);
  swBridge3F.position.set(0, DATUMS.F3 - 0.25, -4.4);

  coresLocal.add(boxGroup);

  // =========================================================================
  // 04. RED 3F MAIN STATION (STATION) — SIDE PLATFORMS + PORTAL TRUSSES
  // =========================================================================
  const ST_LEN = 56.0;
  const ST_W = 14.8;
  const PLAT_W = 3.6;
  const SLAB_3F_H = 0.55;

  [-5.6, 5.6].forEach((zPlat) => {
    const plat = addArchMesh(stationLocal, new THREE.BoxGeometry(ST_LEN, SLAB_3F_H, PLAT_W), matStation3F);
    plat.position.set(0, DATUMS.F3 - SLAB_3F_H / 2, zPlat);

    const innerZ = zPlat > 0 ? zPlat - PLAT_W / 2 + 0.14 : zPlat + PLAT_W / 2 - 0.14;
    const curb = addArchMesh(stationLocal, new THREE.BoxGeometry(ST_LEN - 1.2, 0.32, 0.18), matBoardDark);
    curb.position.set(0, DATUMS.F3 + 0.16, innerZ);
    const screen = addArchMesh(stationLocal, new THREE.BoxGeometry(ST_LEN - 1.2, 1.10, 0.06), matGlass, { edges: false, castShadow: false });
    screen.position.set(0, DATUMS.F3 + 0.87, innerZ);
  });

  for (let s = -26; s <= 26; s += 13) {
    const tieBeam = addArchMesh(stationLocal, new THREE.BoxGeometry(0.65, 0.65, ST_W - 0.4), matBoardDark);
    tieBeam.position.set(s, DATUMS.F3 - SLAB_3F_H - 0.32, 0);
  }

  [-24, -12, 0, 12, 24].forEach((sBay) => {
    [-ST_W / 2 + 0.45, ST_W / 2 - 0.45].forEach((zCol) => {
      const col = addArchMesh(stationLocal, new THREE.BoxGeometry(0.75, DATUMS.ROOF_BOT, 0.75), matBoardPrimary);
      col.position.set(sBay, DATUMS.ROOF_BOT / 2, zCol);
    });
    const trussTop = addArchMesh(stationLocal, new THREE.BoxGeometry(0.55, 0.85, ST_W), matSteelGirder);
    trussTop.position.set(sBay, DATUMS.GIRDER_TOP + 0.50, 0);

    [-2.1, 2.1].forEach((zTrack) => {
      const hanger = addArchMesh(stationLocal, new THREE.BoxGeometry(0.32, 0.65, 0.32), matSteelGirder);
      hanger.position.set(sBay, DATUMS.GIRDER_TOP + 0.15, zTrack);
    });
  });

  // --- 04b. PEELABLE 3F STATION ROOF CANOPY & OUTER SHELL ---
  const roofHalfW = ST_W / 2 - 0.25;
  [-roofHalfW / 2 - 0.25, roofHalfW / 2 + 0.25].forEach((zR) => {
    const roofPlate = addArchMesh(shellLocal, new THREE.BoxGeometry(ST_LEN + 3.0, 0.45, roofHalfW), matShellRoof);
    roofPlate.position.set(0, DATUMS.ROOF_BOT + 0.225, zR);
  });

  [-ST_W / 2 + 0.18, ST_W / 2 - 0.18].forEach((zWall) => {
    const fascia = addArchMesh(shellLocal, new THREE.BoxGeometry(ST_LEN + 1.6, 2.55, 0.28), matShellRoof);
    fascia.position.set(0, 14.12, zWall);

    const lowerWall = addArchMesh(shellLocal, new THREE.BoxGeometry(ST_LEN, 1.25, 0.26), matShellRoof);
    lowerWall.position.set(0, DATUMS.F3 + 0.625, zWall);

    const glassBand = addArchMesh(shellLocal, new THREE.BoxGeometry(ST_LEN - 0.8, 1.95, 0.08), matGlass, { edges: false, castShadow: false });
    glassBand.position.set(0, 11.82, zWall);

    for (let s = -26; s <= 26; s += 4.0) {
      if (zWall < 0 && s > -3 && s < 7) continue;
      if (zWall > 0 && s > -1 && s < 8) continue;
      const fin = addArchMesh(shellLocal, new THREE.BoxGeometry(0.18, 2.0, 0.48), matShellRoof);
      fin.position.set(s, 11.82, zWall);
    }
  });

  // =========================================================================
  // 05. SAFEGE SUSPENDED MONORAIL — HOLLOW SLOTTED BOX GIRDERS + 2-CAR TRAINS
  // =========================================================================
  const VIADUCT_LEN = 196.0;
  const TRACK_OFFSET = 2.1;

  function buildSafegeBoxGirder(length, zOffset) {
    const g = new THREE.Group();
    const w = 1.15;
    const h = 1.35;
    const t = 0.16;
    const slot = 0.36;
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

  [-92, -74, -56, -40, 40, 56, 74, 92].forEach((sPier) => {
    const pierW = 8.4;
    [-pierW / 2, pierW / 2].forEach((zLeg) => {
      const leg = addArchMesh(tracksLocal, new THREE.BoxGeometry(0.85, DATUMS.GIRDER_TOP + 0.65, 0.85), matBoardDark);
      leg.position.set(sPier, (DATUMS.GIRDER_TOP + 0.65) / 2, zLeg);
    });
    const crossHead = addArchMesh(tracksLocal, new THREE.BoxGeometry(0.90, 0.85, pierW + 1.0), matBoardDark);
    crossHead.position.set(sPier, DATUMS.GIRDER_TOP + 0.55, 0);
  });

  function buildSuspendedTrain(sCenter, zTrack) {
    const train = new THREE.Group();
    const carLen = 12.0;
    const carW = 2.40;
    const carH = 2.65;
    const gap = 0.65;

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

      [-3.4, 3.4].forEach((bx) => {
        const neck = addArchMesh(car, new THREE.BoxGeometry(1.1, 1.05, 0.28), matSteelGirder);
        neck.position.set(bx, DATUMS.F3 + carH + 0.45, 0);
        const bogieHousing = addArchMesh(car, new THREE.BoxGeometry(2.1, 0.45, 0.78), matSteelGirder);
        bogieHousing.position.set(bx, DATUMS.GIRDER_BOT + 0.35, 0);
      });

      train.add(car);
    });

    const bellows = addArchMesh(train, new THREE.BoxGeometry(gap + 0.1, 2.25, 1.95), matBoardDark);
    bellows.position.y = DATUMS.F3 + 1.25;

    train.position.set(sCenter, 0, zTrack);
    return train;
  }

  tracksLocal.add(buildSuspendedTrain(-3.0, -TRACK_OFFSET));
  tracksLocal.add(buildSuspendedTrain(48.0, TRACK_OFFSET));

  // =========================================================================
  // 06. ACOUSTIC VARIANTS (A1: FOLDED LOUVER BAFFLE vs A2: FULL TUNNEL SHELL)
  // =========================================================================
  const ACOUSTIC_SEGMENTS = [
    { start: -95, end: -29 },
    { start: 29, end: 95 },
  ];

  ACOUSTIC_SEGMENTS.forEach(({ start, end }) => {
    const len = end - start;
    const mid = (start + end) / 2;

    [-1, 1].forEach((side) => {
      const lowerWall = addArchMesh(a1Local, new THREE.BoxGeometry(len, 3.8, 0.26), matAcoustic);
      lowerWall.position.set(mid, 10.65, side * 4.55);
      lowerWall.rotation.x = side * -0.14;

      const upperFold = addArchMesh(a1Local, new THREE.BoxGeometry(len, 3.3, 0.24), matAcoustic);
      upperFold.position.set(mid, 14.05, side * 3.15);
      upperFold.rotation.x = side * 0.62;

      for (let s = start + 2; s <= end - 2; s += 4.5) {
        const rib = addArchMesh(a1Local, new THREE.BoxGeometry(0.18, 4.4, 0.55), matAcoustic);
        rib.position.set(s, 11.4, side * 4.35);
      }
    });
  });

  ACOUSTIC_SEGMENTS.forEach(({ start, end }) => {
    const len = end - start;
    const mid = (start + end) / 2;
    const tunW = 9.4;

    const topCap = addArchMesh(a2Local, new THREE.BoxGeometry(len, 0.30, tunW - 1.6), matAcoustic);
    topCap.position.set(mid, 15.35, 0);

    const botTray = addArchMesh(a2Local, new THREE.BoxGeometry(len, 0.24, tunW - 2.0), matAcoustic);
    botTray.position.set(mid, 8.75, 0);

    [-1, 1].forEach((side) => {
      const chamferTop = addArchMesh(a2Local, new THREE.BoxGeometry(len, 0.26, 1.65), matAcoustic);
      chamferTop.position.set(mid, 14.85, side * (tunW / 2 - 0.55));
      chamferTop.rotation.x = side * 0.65;

      const upWall = addArchMesh(a2Local, new THREE.BoxGeometry(len, 2.2, 0.26), matAcoustic);
      upWall.position.set(mid, 13.35, side * (tunW / 2));

      const glStrip = addArchMesh(a2Local, new THREE.BoxGeometry(len - 0.4, 1.35, 0.08), matGlass, { edges: false, castShadow: false });
      glStrip.position.set(mid, 11.55, side * (tunW / 2 - 0.06));

      const loWall = addArchMesh(a2Local, new THREE.BoxGeometry(len, 2.05, 0.26), matAcoustic);
      loWall.position.set(mid, 9.85, side * (tunW / 2));

      for (let s = start + 1.5; s <= end - 1.5; s += 5.0) {
        const rib = addArchMesh(a2Local, new THREE.BoxGeometry(0.28, 6.2, 0.42), matAcoustic);
        rib.position.set(s, 11.9, side * (tunW / 2 + 0.14));
      }
    });
  });

  // =========================================================================
  // 07. 1.75m SCALE FIGURES
  // =========================================================================
  [
    [12, 0, 8], [14, 0, 9.2], [-14, 0, -10], [-18, 0, 14], [20, 0, -16], [4, 0, 22], [-8, 0, -21],
  ].forEach(([x, y, z]) => {
    const fig = createScaleFigure();
    fig.position.set(x, y, z);
    groups.figures.add(fig);
  });

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.18;
    const fig = createScaleFigure();
    fig.position.set(Math.cos(a) * (R_RING + (i % 2 ? 0.6 : -0.6)), DATUMS.F2, Math.sin(a) * (R_RING + (i % 2 ? 0.6 : -0.6)));
    groups.ring2F.add(fig);
  }

  [
    [-16, -5.4], [-10, -5.8], [-4, -5.1], [2, -5.6], [10, -5.3], [18, -5.7],
    [-14, 5.5], [-6, 5.2], [4, 5.8], [14, 5.4],
  ].forEach(([s, z]) => {
    const fig = createScaleFigure();
    fig.position.set(s, DATUMS.F3, z);
    stationLocal.add(fig);
  });

  // =========================================================================
  // 08. HELPERS: 1:100 SLICE BOXES + SECTION PLANE + EXPLODE AXES
  // =========================================================================
  function createSliceBoxHelper(sCenter, uCenter, labelColor = 0x6b242b) {
    const g = new THREE.Group();
    g.rotation.y = -AXIS_RAD;
    const size = 30.0;
    const h = 18.5;

    const wireGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(size, h, size));
    const wireMat = new THREE.LineBasicMaterial({ color: labelColor, transparent: true, opacity: 0.9 });
    const boxWire = new THREE.LineSegments(wireGeo, wireMat);
    boxWire.position.set(sCenter, h / 2, -uCenter);
    g.add(boxWire);

    const basePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ color: labelColor, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false })
    );
    basePlane.rotation.x = -Math.PI / 2;
    basePlane.position.set(sCenter, 0.07, -uCenter);
    g.add(basePlane);

    return { group: g, sCenter, uCenter, size };
  }

  const sliceS1 = createSliceBoxHelper(2.0, 1.0, 0x6b242b);
  const sliceS2 = createSliceBoxHelper(-33.0, -3.0, 0x2c5a56);
  groups.helpers.add(sliceS1.group);
  groups.helpers.add(sliceS2.group);
  sliceS1.group.visible = false;
  sliceS2.group.visible = false;

  const secIndicator = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(140, 24)),
    new THREE.LineBasicMaterial({ color: 0x6b242b, transparent: true, opacity: 0.7 })
  );
  secIndicator.visible = false;
  groups.helpers.add(secIndicator);

  const explodeAxesGroup = new THREE.Group();
  const explodeAxisMat = new THREE.LineDashedMaterial({
    color: 0x4a4e54, dashSize: 0.8, gapSize: 0.6, transparent: true, opacity: 0.55,
  });
  [
    localToWorld(2.0, 0, 11.6),
    localToWorld(3.5, 0, -10.8),
    localToWorld(-26, 0, 0),
    localToWorld(26, 0, 0),
  ].forEach((pt) => {
    const l = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(pt.x, 0, pt.z), new THREE.Vector3(pt.x, 38, pt.z)]),
      explodeAxisMat
    );
    l.computeLineDistances();
    explodeAxesGroup.add(l);
  });
  explodeAxesGroup.visible = false;
  groups.helpers.add(explodeAxesGroup);

  // =========================================================================
  // PROGRAMMATIC ZERO-COLLISION VERIFIER (Track/Acoustic Envelope vs Colleges)
  // =========================================================================
  function checkCollisions() {
    // Track & acoustic corridor half-width = 4.90m (A2 tunnel outer rib = 4.84m)
    const corridorHalfU = 4.90;
    let minDormClearance = Infinity;
    let minPodiumClearance = Infinity;
    const collisions = [];

    for (const c of contextColliders) {
      // Project all 4 polygon corners into track-local (s, u)
      const localPts = c.cornersWorld.map((pt) => worldToTrackLocal(pt));
      const uVals = localPts.map((p) => p.u);
      const minU = Math.min(...uVals);
      const maxU = Math.max(...uVals);

      // Lateral distance from the corridor strip u ∈ [-corridorHalfU, +corridorHalfU]
      let clearance;
      if (maxU < -corridorHalfU) {
        clearance = -corridorHalfU - maxU;
      } else if (minU > corridorHalfU) {
        clearance = minU - corridorHalfU;
      } else {
        // Polygon crosses corridor band — check if it also overlaps s ∈ [-96, 96]
        const sVals = localPts.map((p) => p.s);
        const minS = Math.min(...sVals);
        const maxS = Math.max(...sVals);
        if (maxS >= -96 && minS <= 96) {
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
  // INTERACTIVE STATE CONTROLLER API
  // =========================================================================
  const state = {
    contextMode: 'ghost',      // 'ghost' | 'wireframe' | 'hidden'
    acousticVariant: 'A1',     // 'A1' | 'A2'
    sliceMode: 'OFF',          // 'OFF' | 'S1' | 'S2'
    clipToSlice: false,
    peel: 0.0,
    explode: 0.0,
    sectionEnabled: false,
    sectionAxis: 'transverse',
    sectionPos: 0.0,
    colorMode: 'white',
  };

  function applyState() {
    // 0. Existing Phase II Colleges Display Mode
    groups.contextMassing.visible = state.contextMode === 'ghost';
    groups.contextFootprints.visible = state.contextMode !== 'hidden';

    // 1. Acoustic Variant Toggle
    groups.acousticA1.visible = state.acousticVariant === 'A1';
    groups.acousticA2.visible = state.acousticVariant === 'A2';

    // 2. Color Mode
    if (state.colorMode === 'white') {
      matRing2F.color.setHex(0xd8d5ce);
      matStation3F.color.setHex(0xd8d5ce);
      matShellRoof.color.setHex(0xd8d5ce);
      matAcoustic.color.setHex(0xd5d2ca);
    } else {
      matRing2F.color.setHex(0xb8aec9);
      matStation3F.color.setHex(0xc99c94);
      matShellRoof.color.setHex(0xd4b0a8);
      matAcoustic.color.setHex(0xa8bfb0);
    }

    // 3. Vertical Explode
    const ex = state.explode;
    groups.ring2F.position.y = ex * 6.0;
    groups.station3F.position.y = ex * 13.5;
    groups.safegeTracks.position.y = ex * 13.5;
    groups.acousticA1.position.y = ex * 13.5;
    groups.acousticA2.position.y = ex * 13.5;
    groups.stationShell.position.y = ex * 19.5;
    explodeAxesGroup.visible = ex > 0.02;

    // 4. Shell / Acoustic Peel
    const p = state.peel;
    const peelLift = p * 9.0;
    const peelOpacity = Math.max(0.0, 1.0 - p * 1.15);
    groups.stationShell.position.y += peelLift;
    groups.acousticA1.position.y += peelLift * 0.65;
    groups.acousticA2.position.y += peelLift * 0.65;
    matShellRoof.opacity = peelOpacity;
    matAcoustic.opacity = peelOpacity;
    groups.stationShell.visible = peelOpacity > 0.04;
    if (state.acousticVariant === 'A1') groups.acousticA1.visible = peelOpacity > 0.04;
    if (state.acousticVariant === 'A2') groups.acousticA2.visible = peelOpacity > 0.04;

    // 5. 1:100 Slice Box & Clipping
    sliceS1.group.visible = state.sliceMode === 'S1';
    sliceS2.group.visible = state.sliceMode === 'S2';

    activeClipPlanes.length = 0;

    if (state.sectionEnabled) {
      if (state.sectionAxis === 'transverse') {
        sectionPlane.normal.set(-DIR_SE.x, 0, -DIR_SE.z).normalize();
        sectionPlane.constant = state.sectionPos;
        secIndicator.position.copy(localToWorld(state.sectionPos, 11, 0));
        secIndicator.rotation.set(0, -AXIS_RAD + Math.PI / 2, 0);
      } else {
        sectionPlane.normal.set(-PERP_NE.x, 0, -PERP_NE.z).normalize();
        sectionPlane.constant = state.sectionPos;
        secIndicator.position.copy(localToWorld(0, 11, state.sectionPos));
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

  return {
    root,
    groups,
    state,
    applyState,
    checkCollisions,
  };
}
