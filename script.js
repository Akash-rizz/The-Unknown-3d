import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


/* =========================================================
   THE UNKNOWN
   3D SCIENCE OBSERVATORY
   Main Three.js Engine
   ========================================================= */


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (id) =>
  document.getElementById(id);


/* =========================================================
   DOM REFERENCES
   ========================================================= */

const sceneHost =
  $("scene");

const boot =
  $("boot");

const app =
  $("app");

const bootStatus =
  $("bootStatus");

const bootRetry =
  $("bootRetry");


/* =========================================================
   THREE.JS VARIABLES
   ========================================================= */

let renderer = null;

let scene = null;

let camera = null;

let controls = null;

let raycaster = null;


/* =========================================================
   STATE
   ========================================================= */

let currentView =
  "home";

let currentRoot =
  null;

let starfield =
  null;

let interactive =
  [];

let pointer =
  new THREE.Vector2();

let clock =
  new THREE.Clock();

let elapsed =
  0;

let autoOrbit =
  false;

let quality =
  "AUTO";

let soundOn =
  false;

let audioContext =
  null;


/* =========================================================
   FPS
   ========================================================= */

let fpsFrames =
  0;

let fpsLast =
  performance.now();


/* =========================================================
   VIEW INFORMATION
   ========================================================= */

const views = {

  home: {
    title:
      "THE UNKNOWN",

    text:
      "A real-time 3D observatory for space, life, quantum ideas and intelligence.",

    mode:
      "OBSERVATORY"
  },

  solar: {
    title:
      "SOLAR SYSTEM",

    text:
      "A compressed interactive model of our planetary neighborhood. Drag, zoom and inspect.",

    mode:
      "ORBITAL MECHANICS"
  },

  blackhole: {
    title:
      "BLACK HOLE",

    text:
      "A visual model of an extreme gravitational environment — inspired by real physics, simplified for exploration.",

    mode:
      "GRAVITY WELL"
  },

  dna: {
    title:
      "DNA / LIFE",

    text:
      "A molecular-inspired journey through the geometry of biological information.",

    mode:
      "LIFE ENGINE"
  },

  quantum: {
    title:
      "QUANTUM",

    text:
      "A visual playground for probability, superposition-inspired motion and quantum concepts.",

    mode:
      "QUANTUM LAB"
  },

  ai: {
    title:
      "AI CORE",

    text:
      "A living network inspired by layered neural computation and information flow.",

    mode:
      "INTELLIGENCE"
  }

};


/* =========================================================
   BASIC UI FUNCTIONS
   ========================================================= */

function setText(
  id,
  value
) {

  const element =
    $(id);

  if (element) {
    element.textContent =
      value;
  }

}


function updateSceneInfo(
  view
) {

  const data =
    views[view];

  if (!data) {
    return;
  }

  setText(
    "sceneTitle",
    data.title
  );

  setText(
    "sceneText",
    data.text
  );

  setText(
    "mode",
    data.mode
  );

}


function updateObjectCount() {

  setText(
    "objects",
    String(
      interactive.length
    ).padStart(2, "0")
  );

}


/* =========================================================
   INSPECTABLE OBJECTS
   ========================================================= */

function addInspectable(
  object,
  name,
  text,
  fact,
  tag = "OBJECT"
) {

  object.userData.info = {

    name,

    text,

    fact,

    tag

  };

  object.userData.inspectable =
    true;

  interactive.push(
    object
  );

}


/* =========================================================
   MATERIAL HELPER
   ========================================================= */

function createMaterial(
  color,
  emissive = 0x000000,
  intensity = 0,
  roughness = 0.55,
  metalness = 0.05
) {

  return new THREE.MeshStandardMaterial({

    color,

    emissive,

    emissiveIntensity:
      intensity,

    roughness,

    metalness

  });

}


/* =========================================================
   LINE HELPER
   ========================================================= */

function createLine(
  points,
  color = 0x6876a5,
  opacity = 0.35
) {

  const geometry =
    new THREE.BufferGeometry()
      .setFromPoints(
        points
      );

  const material =
    new THREE.LineBasicMaterial({

      color,

      transparent:
        true,

      opacity

    });

  return new THREE.Line(
    geometry,
    material
  );

}


/* =========================================================
   DISPOSE OBJECT
   ========================================================= */

function disposeObject(
  root
) {

  if (!root) {
    return;
  }

  root.traverse(
    object => {

      if (
        object.geometry
      ) {

        object.geometry.dispose();

      }

      if (
        object.material
      ) {

        const materials =
          Array.isArray(
            object.material
          )
            ? object.material
            : [
                object.material
              ];

        materials.forEach(
          material => {

            if (
              material.map
            ) {

              material.map.dispose();

            }

            if (
              material.emissiveMap
            ) {

              material.emissiveMap.dispose();

            }

            material.dispose();

          }
        );

      }

    }
  );

}


/* =========================================================
   CLEAR CURRENT SCIENCE SCENE
   ========================================================= */

function clearCurrentScene() {

  interactive =
    [];

  if (
    currentRoot
  ) {

    scene.remove(
      currentRoot
    );

    disposeObject(
      currentRoot
    );

    currentRoot =
      null;

  }

  updateObjectCount();

}


/* =========================================================
   INITIALIZE RENDERER
   ========================================================= */

function initRenderer() {

  renderer =
    new THREE.WebGLRenderer({

      antialias:
        true,

      powerPreference:
        "high-performance",

      alpha:
        false

    });


  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      2
    )
  );


  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    false
  );


  renderer.outputColorSpace =
    THREE.SRGBColorSpace;


  renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


  renderer.toneMappingExposure =
    1.1;


  renderer.setClearColor(
    0x02040b,
    1
  );


  sceneHost.appendChild(
    renderer.domElement
  );


  /* SCENE */

  scene =
    new THREE.Scene();


  scene.fog =
    new THREE.FogExp2(
      0x02040b,
      0.00075
    );


  /* CAMERA */

  camera =
    new THREE.PerspectiveCamera(

      52,

      window.innerWidth /
        window.innerHeight,

      0.1,

      5000

    );


  camera.position.set(
    0,
    28,
    72
  );


  /* CONTROLS */

  controls =
    new OrbitControls(
      camera,
      renderer.domElement
    );


  controls.enableDamping =
    true;

  controls.dampingFactor =
    0.055;

  controls.enablePan =
    true;

  controls.enableZoom =
    true;

  controls.enableRotate =
    true;

  controls.minDistance =
    2.5;

  controls.maxDistance =
    900;

  controls.target.set(
    0,
    0,
    0
  );

  controls.update();


  /* LIGHTING */

  const hemisphere =
    new THREE.HemisphereLight(
      0x9fb4ff,
      0x050609,
      0.42
    );

  scene.add(
    hemisphere
  );


  const keyLight =
    new THREE.DirectionalLight(
      0xffffff,
      1.25
    );

  keyLight.position.set(
    50,
    80,
    40
  );

  scene.add(
    keyLight
  );


  /* RAYCASTER */

  raycaster =
    new THREE.Raycaster();


  /* STARS */

  createStarfield();

}


/* =========================================================
   STARFIELD
   ========================================================= */

function createStarfield() {

  const count =
    quality === "LOW"
      ? 1800
      : quality === "HIGH"
        ? 9000
        : 4500;


  const positions =
    new Float32Array(
      count * 3
    );


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const radius =
      450 +
      Math.random() *
        1500;


    const u =
      Math.random() *
        2 -
      1;


    const angle =
      Math.random() *
      Math.PI *
      2;


    const horizontal =
      Math.sqrt(
        1 -
        u * u
      );


    positions[
      i * 3
    ] =
      radius *
      horizontal *
      Math.cos(
        angle
      );


    positions[
      i * 3 + 1
    ] =
      radius *
      u;


    positions[
      i * 3 + 2
    ] =
      radius *
      horizontal *
      Math.sin(
        angle
      );

  }


  const geometry =
    new THREE.BufferGeometry();


  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );


  const material =
    new THREE.PointsMaterial({

      color:
        0xe8edff,

      size:
        1.25,

      sizeAttenuation:
        true,

      transparent:
        true,

      opacity:
        0.9

    });


  starfield =
    new THREE.Points(
      geometry,
      material
    );


  scene.add(
    starfield
  );

}


/* =========================================================
   CAMERA RESET
   ========================================================= */

function resetCamera(
  position = [0, 28, 72],
  target = [0, 0, 0]
) {

  camera.position.set(
    position[0],
    position[1],
    position[2]
  );

  controls.target.set(
    target[0],
    target[1],
    target[2]
  );

  controls.update();

}


/* =========================================================
   HOME / NEXUS
   ========================================================= */

function createHome() {

  clearCurrentScene();


  const root =
    new THREE.Group();

  currentRoot =
    root;

  scene.add(
    root
  );


  /* CENTRAL CORE */

  const core =
    new THREE.Mesh(

      new THREE.IcosahedronGeometry(
        7,
        2
      ),

      new THREE.MeshStandardMaterial({

        color:
          0x6575ff,

        emissive:
          0x243cff,

        emissiveIntensity:
          1.8,

        wireframe:
          true,

        transparent:
          true,

        opacity:
          0.82

      })

    );


  root.add(
    core
  );


  addInspectable(

    core,

    "THE NEXUS CORE",

    "The central gateway of the observatory — a visual metaphor for the boundary between what we know and what remains unknown.",

    "The model is an artistic interface, not a physical object.",

    "NEXUS"

  );


  /* ORBITING RINGS */

  for (
    let i = 0;
    i < 5;
    i++
  ) {

    const radius =
      10 +
      i * 4.5;


    const ring =
      new THREE.Mesh(

        new THREE.TorusGeometry(
          radius,
          0.055,
          8,
          180
        ),

        new THREE.MeshBasicMaterial({

          color:
            i % 2
              ? 0xff79d4
              : 0x7aa5ff,

          transparent:
            true,

          opacity:
            0.5

        })

      );


    ring.rotation.x =
      Math.PI / 2 +
      i * 0.17;


    ring.rotation.z =
      i * 0.3;


    root.add(
      ring
    );

  }


  /* CORE GLOW */

  const glow =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        2.7,
        32,
        32
      ),

      new THREE.MeshBasicMaterial({

        color:
          0xffffff,

        transparent:
          true,

        opacity:
          0.22

      })

    );


  root.add(
    glow
  );


  resetCamera(
    [0, 30, 78],
    [0, 0, 0]
  );

}


/* =========================================================
   PLANET CREATOR
   ========================================================= */

function createPlanet(
  name,
  radius,
  distance,
  color,
  speed
) {

  const orbit =
    new THREE.Group();


  orbit.userData.angle =
    Math.random() *
    Math.PI *
    2;


  orbit.userData.speed =
    speed;


  orbit.userData.distance =
    distance;


  const planet =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        radius,
        40,
        40
      ),

      createMaterial(
        color,
        0x000000,
        0,
        0.8,
        0.03
      )

    );


  planet.position.x =
    distance;


  planet.userData.spin =
    0.003 +
    Math.random() *
      0.006;


  orbit.add(
    planet
  );


  /* ORBIT PATH */

  const curve =
    new THREE.EllipseCurve(
      0,
      0,
      distance,
      distance
    );


  const points =
    curve
      .getPoints(160)
      .map(
        point =>
          new THREE.Vector3(
            point.x,
            0,
            point.y
          )
      );


  const orbitLine =
    createLine(
      points,
      0x64709a,
      0.24
    );


  currentRoot.add(
    orbitLine
  );


  addInspectable(

    planet,

    name,

    `${name} is represented as a 3D exploration model. Distances and sizes are intentionally compressed so the whole system can be explored on a phone.`,

    "Orbital speed and scale here are visualized rather than physically to scale.",

    "PLANET"

  );


  currentRoot.add(
    orbit
  );


  return {
    orbit,
    planet
  };

}


/* =========================================================
   SOLAR SYSTEM
   ========================================================= */

function createSolar() {

  clearCurrentScene();


  const root =
    new THREE.Group();

  currentRoot =
    root;

  scene.add(
    root
  );


  /* SUN */

  const sun =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        7,
        64,
        64
      ),

      createMaterial(
        0xffc14f,
        0xff6b00,
        2.8,
        0.48,
        0.02
      )

    );


  root.add(
    sun
  );


  addInspectable(

    sun,

    "THE SUN",

    "The star at the center of our Solar System. Its gravity dominates planetary motion.",

    "The Sun contains more than 99% of the total mass of the Solar System.",

    "STAR"

  );


  const sunLight =
    new THREE.PointLight(
      0xffd18a,
      480,
      800,
      1.8
    );


  root.add(
    sunLight
  );


  const corona =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        8.5,
        48,
        48
      ),

      new THREE.MeshBasicMaterial({

        color:
          0xffb24b,

        transparent:
          true,

        opacity:
          0.08,

        side:
          THREE.BackSide

      })

    );


  root.add(
    corona
  );


  /* PLANETS */

  const data = [

    [
      "MERCURY",
      0.75,
      13,
      0x8d8275,
      0.9
    ],

    [
      "VENUS",
      1.25,
      18,
      0xd7aa72,
      0.72
    ],

    [
      "EARTH",
      1.5,
      24,
      0x397bc1,
      0.58
    ],

    [
      "MARS",
      1.15,
      30,
      0xb9543e,
      0.47
    ],

    [
      "JUPITER",
      3.9,
      42,
      0xc59a78,
      0.30
    ],

    [
      "SATURN",
      3.2,
      56,
      0xd0b57c,
      0.23
    ],

    [
      "URANUS",
      2.25,
      69,
      0x73cbd2,
      0.18
    ],

    [
      "NEPTUNE",
      2.2,
      82,
      0x416dd4,
      0.14
    ]

  ];


  const planets = {};


  data.forEach(
    planetData => {

      planets[
        planetData[0]
      ] =
        createPlanet(
          ...planetData
        );

    }
  );


  /* =======================================================
     EARTH
     ======================================================= */

  const earth =
    planets.EARTH.planet;


  /* MOON */

  const moonOrbit =
    new THREE.Group();


  earth.add(
    moonOrbit
  );


  moonOrbit.userData.speed =
    1.35;


  const moon =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        0.42,
        24,
        24
      ),

      createMaterial(
        0xa7a7a7,
        0,
        0,
        0.95,
        0
      )

    );


  moon.position.x =
    3.4;


  moonOrbit.add(
    moon
  );


  addInspectable(

    moon,

    "THE MOON",

    "Earth's natural satellite, shown orbiting Earth.",

    "The Moon's sidereal orbital period is about 27.3 days.",

    "SATELLITE"

  );


  /* ARTIFICIAL SATELLITE */

  const satelliteOrbit =
    new THREE.Group();


  earth.add(
    satelliteOrbit
  );


  satelliteOrbit.userData.speed =
    2.1;


  const satellite =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        0.18,
        0.18,
        0.52
      ),

      createMaterial(
        0xe8e8e8,
        0x202020,
        0,
        0.3,
        0.8
      )

    );


  satellite.position.x =
    4.7;


  satelliteOrbit.add(
    satellite
  );


  addInspectable(

    satellite,

    "ARTIFICIAL SATELLITE",

    "A conceptual spacecraft orbiting Earth.",

    "Satellites support communications, navigation, Earth observation and scientific research.",

    "SPACECRAFT"

  );


  /* SATELLITE ORBIT RING */

  const satelliteRing =
    new THREE.Mesh(

      new THREE.TorusGeometry(
        4.6,
        0.035,
        8,
        96
      ),

      new THREE.MeshBasicMaterial({

        color:
          0x9ab6ff,

        transparent:
          true,

        opacity:
          0.3

      })

    );


  satelliteRing.rotation.x =
    Math.PI / 2;


  earth.add(
    satelliteRing
  );


  /* =======================================================
     SATURN RINGS
     ======================================================= */

  const saturn =
    planets.SATURN.planet;


  const rings =
    new THREE.Mesh(

      new THREE.RingGeometry(
        4.1,
        6.6,
        96
      ),

      new THREE.MeshBasicMaterial({

        color:
          0xcab88f,

        side:
          THREE.DoubleSide,

        transparent:
          true,

        opacity:
          0.7

      })

    );


  rings.rotation.x =
    Math.PI / 2.25;


  saturn.add(
    rings
  );


  /* =======================================================
     ASTEROID BELT
     ======================================================= */

  const belt =
    new THREE.Group();


  root.add(
    belt
  );


  const asteroidCount =
    quality === "LOW"
      ? 180
      : quality === "HIGH"
        ? 700
        : 450;


  for (
    let i = 0;
    i < asteroidCount;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI *
      2;


    const radius =
      34 +
      Math.random() *
        4;


    const y =
      (Math.random() - 0.5) *
      1.4;


    const asteroid =
      new THREE.Mesh(

        new THREE.IcosahedronGeometry(
          0.05 +
          Math.random() *
            0.13,

          0
        ),

        createMaterial(
          0x737373,
          0,
          0,
          1,
          0
        )

      );


    asteroid.position.set(

      Math.cos(angle) *
        radius,

      y,

      Math.sin(angle) *
        radius

    );


    asteroid.rotation.set(

      Math.random(),

      Math.random(),

      Math.random()

    );


    belt.add(
      asteroid
    );

  }


  addInspectable(

    belt,

    "ASTEROID BELT",

    "A conceptual dense band of rocky bodies between Mars and Jupiter.",

    "The real asteroid belt contains millions of objects, most of them very small.",

    "REGION"

  );


  resetCamera(
    [0, 45, 112],
    [0, 0, 0]
  );

}


/* =========================================================
   BLACK HOLE
   ========================================================= */

function createBlackHole() {

  clearCurrentScene();


  const root =
    new THREE.Group();

  currentRoot =
    root;

  scene.add(
    root
  );


  /* BLACK CORE */

  const core =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        8,
        64,
        64
      ),

      new THREE.MeshBasicMaterial({
        color:
          0x000000
      })

    );


  root.add(
    core
  );


  addInspectable(

    core,

    "BLACK HOLE",

    "A conceptual black-hole core. The black region represents an object from which light cannot escape once inside the event horizon.",

    "The visible glowing structure around a black hole would come from matter and radiation outside the horizon.",

    "BLACK HOLE"

  );


  /* LENSING RING */

  const lens =
    new THREE.Mesh(

      new THREE.TorusGeometry(
        10,
        0.18,
        16,
        180
      ),

      new THREE.MeshBasicMaterial({

        color:
          0xb7c7ff,

        transparent:
          true,

        opacity:
          0.65

      })

    );


  root.add(
    lens
  );


  /* ACCRETION DISK */

  const disk =
    new THREE.Mesh(

      new THREE.RingGeometry(
        10,
        29,
        192
      ),

      new THREE.MeshBasicMaterial({

        color:
          0xff6a2a,

        side:
          THREE.DoubleSide,

        transparent:
          true,

        opacity:
          0.55

      })

    );


  disk.rotation.x =
    Math.PI / 2;


  root.add(
    disk
  );


  const disk2 =
    new THREE.Mesh(

      new THREE.RingGeometry(
        13,
        25,
        192
      ),

      new THREE.MeshBasicMaterial({

        color:
          0xffc85a,

        side:
          THREE.DoubleSide,

        transparent:
          true,

        opacity:
          0.22

      })

    );


  disk2.rotation.x =
    Math.PI / 2;

  disk2.rotation.z =
    0.08;


  root.add(
    disk2
  );


  /* PARTICLES */

  const count =
    quality === "LOW"
      ? 700
      : 1600;


  const positions =
    new Float32Array(
      count * 3
    );


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const radius =
      11 +
      Math.random() *
        23;


    const angle =
      Math.random() *
      Math.PI *
      2;


    positions[
      i * 3
    ] =
      Math.cos(angle) *
      radius;


    positions[
      i * 3 + 1
    ] =
      (Math.random() - 0.5) *
      1.3;


    positions[
      i * 3 + 2
    ] =
      Math.sin(angle) *
      radius;

  }


  const particleGeometry =
    new THREE.BufferGeometry();


  particleGeometry.setAttribute(

    "position",

    new THREE.BufferAttribute(
      positions,
      3
    )

  );


  const particles =
    new THREE.Points(

      particleGeometry,

      new THREE.PointsMaterial({

        color:
          0xffb05b,

        size:
          0.14,

        transparent:
          true,

        opacity:
          0.9

      })

    );


  root.add(
    particles
  );


  /* EXTRA RINGS */

  for (
    let i = 0;
    i < 4;
    i++
  ) {

    const arc =
      new THREE.Mesh(

        new THREE.TorusGeometry(
          13 + i * 4,
          0.045,
          8,
          180
        ),

        new THREE.MeshBasicMaterial({

          color:
            i % 2
              ? 0xff7540
              : 0x8aa6ff,

          transparent:
            true,

          opacity:
            0.25

        })

      );


    arc.rotation.x =
      Math.PI / 2;


    root.add(
      arc
    );

  }


  resetCamera(
    [0, 28, 68],
    [0, 0, 0]
  );

}


/* =========================================================
   DNA
   ========================================================= */

function createDNA() {

  clearCurrentScene();


  const root =
    new THREE.Group();

  currentRoot =
    root;

  scene.add(
    root
  );


  const radius =
    7;

  const height =
    40;

  const turns =
    4;

  const steps =
    190;


  for (
    let i = 0;
    i < steps;
    i++
  ) {

    const t =
      i /
      (steps - 1);


    const y =
      -height / 2 +
      t * height;


    const angle =
      t *
      Math.PI *
      2 *
      turns;


    const pointA =
      new THREE.Vector3(

        Math.cos(angle) *
          radius,

        y,

        Math.sin(angle) *
          radius

      );


    const pointB =
      new THREE.Vector3(

        Math.cos(
          angle + Math.PI
        ) *
          radius,

        y,

        Math.sin(
          angle + Math.PI
        ) *
          radius

      );


    const nodeA =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          0.28,
          16,
          16
        ),

        createMaterial(
          0x6aa8ff,
          0x2348aa,
          0.7,
          0.45,
          0.1
        )

      );


    nodeA.position.copy(
      pointA
    );


    root.add(
      nodeA
    );


    const nodeB =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          0.28,
          16,
          16
        ),

        createMaterial(
          0xff6fae,
          0x9c235d,
          0.7,
          0.45,
          0.1
        )

      );


    nodeB.position.copy(
      pointB
    );


    root.add(
      nodeB
    );


    if (
      i % 6 === 0
    ) {

      root.add(

        createLine(
          [
            pointA,
            pointB
          ],
          0xbac7ff,
          0.5
        )

      );

    }

  }


  addInspectable(

    root,

    "DNA DOUBLE HELIX",

    "A stylized 3D molecular visualization of the double-helix architecture associated with DNA.",

    "DNA stores biological information through sequences of nucleotide bases.",

    "BIOLOGY"

  );


  resetCamera(
    [0, 6, 68],
    [0, 0, 0]
  );

}


/* =========================================================
   QUANTUM
   ========================================================= */

function createQuantum() {

  clearCurrentScene();


  const root =
    new THREE.Group();

  currentRoot =
    root;

  scene.add(
    root
  );


  /* CENTRAL CORE */

  const core =
    new THREE.Mesh(

      new THREE.IcosahedronGeometry(
        6,
        3
      ),

      new THREE.MeshStandardMaterial({

        color:
          0x7586ff,

        emissive:
          0x334cff,

        emissiveIntensity:
          1.7,

        wireframe:
          true,

        transparent:
          true,

        opacity:
          0.85

      })

    );


  root.add(
    core
  );


  addInspectable(

    core,

    "QUANTUM CORE",

    "An artistic model for probability and quantum-state ideas.",

    "Quantum theory describes physical systems using states and probabilities; this scene is not a physical simulation.",

    "QUANTUM"

  );


  /* QUANTUM RINGS */

  for (
    let i = 0;
    i < 8;
    i++
  ) {

    const ring =
      new THREE.Mesh(

        new THREE.TorusGeometry(
          10 + i * 3.2,
          0.055,
          8,
          180
        ),

        new THREE.MeshBasicMaterial({

          color:
            i % 2
              ? 0xff75d9
              : 0x6ac9ff,

          transparent:
            true,

          opacity:
            0.45

        })

      );


    ring.rotation.set(

      Math.random() * 2,

      Math.random() * 2,

      Math.random() * 2

    );


    root.add(
      ring
    );

  }


  /* PARTICLES */

  const points = [];


  for (
    let i = 0;
    i < 500;
    i++
  ) {

    const radius =
      12 +
      Math.random() *
        28;


    const angle =
      Math.random() *
      Math.PI *
      2;


    points.push(

      new THREE.Vector3(

        Math.cos(angle) *
          radius,

        (Math.random() - 0.5) *
          20,

        Math.sin(angle) *
          radius

      )

    );

  }


  const geometry =
    new THREE.BufferGeometry()
      .setFromPoints(
        points
      );


  const particles =
    new THREE.Points(

      geometry,

      new THREE.PointsMaterial({

        color:
          0xb6c8ff,

        size:
          0.11,

        transparent:
          true,

        opacity:
          0.8

      })

    );


  root.add(
    particles
  );


  resetCamera(
    [0, 18, 72],
    [0, 0, 0]
  );

}


/* =========================================================
   AI CORE
   ========================================================= */

function createAI() {

  clearCurrentScene();


  const root =
    new THREE.Group();

  currentRoot =
    root;

  scene.add(
    root
  );


  const layers = [
    5,
    8,
    11,
    8,
    5
  ];


  const nodes = [];


  /* NODES */

  layers.forEach(
    (
      count,
      layerIndex
    ) => {

      const layer = [];


      for (
        let i = 0;
        i < count;
        i++
      ) {

        const node =
          new THREE.Mesh(

            new THREE.SphereGeometry(
              0.58,
              24,
              24
            ),

            createMaterial(

              layerIndex % 2
                ? 0xff76d5
                : 0x72aaff,

              layerIndex % 2
                ? 0x70224f
                : 0x203e9a,

              1.1,

              0.4,

              0.15

            )

          );


        node.position.set(

          (
            layerIndex -
            2
          ) * 13,

          (
            i -
            (count - 1) / 2
          ) * 4,

          0

        );


        root.add(
          node
        );


        layer.push(
          node
        );

      }


      nodes.push(
        layer
      );

    }
  );


  /* CONNECTIONS */

  for (
    let layer = 0;
    layer <
      nodes.length - 1;
    layer++
  ) {

    for (
      const nodeA of
      nodes[layer]
    ) {

      for (
        const nodeB of
        nodes[layer + 1]
      ) {

        root.add(

          createLine(

            [
              nodeA.position,
              nodeB.position
            ],

            0x6280c5,

            0.14

          )

        );

      }

    }

  }


  addInspectable(

    root,

    "AI NEURAL CORE",

    "A stylized layered network inspired by the organization of artificial neural networks.",

    "Neural networks use mathematical transformations arranged in connected layers; this scene visualizes the idea rather than training a real model.",

    "AI"

  );


  resetCamera(
    [0, 10, 76],
    [0, 0, 0]
  );

}


/* =========================================================
   CHANGE VIEW
   ========================================================= */

function showView(
  view
) {

  if (
    !views[view]
  ) {

    view =
      "home";

  }


  currentView =
    view;


  updateSceneInfo(
    view
  );


  /* NAV ACTIVE */

  document
    .querySelectorAll(
      "#nav [data-view]"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.view ===
            view
        );

      }
    );


  /* HOME OVERLAY */

  $("homeOverlay")
    .classList.toggle(
      "hidden",
      view !== "home"
    );


  /* INFO STRIP */

  $("infoStrip")
    .classList.toggle(
      "hidden",
      view === "home"
    );


  /* CREATE SCENE */

  if (
    view === "home"
  ) {

    createHome();

  } else if (
    view === "solar"
  ) {

    createSolar();

  } else if (
    view === "blackhole"
  ) {

    createBlackHole();

  } else if (
    view === "dna"
  ) {

    createDNA();

  } else if (
    view === "quantum"
  ) {

    createQuantum();

  } else if (
    view === "ai"
  ) {

    createAI();

  }


  setText(
    "infoScene",
    views[view].title
  );


  updateObjectCount();

}


/* =========================================================
   OBJECT INSPECTION
   ========================================================= */

function inspectObject(
  object
) {

  if (
    !object ||
    !object.userData ||
    !object.userData.info
  ) {

    return;

  }


  const info =
    object.userData.info;


  setText(
    "inspectTag",
    info.tag
  );

  setText(
    "inspectName",
    info.name
  );

  setText(
    "inspectText",
    info.text
  );

  setText(
    "inspectFact",
    info.fact
  );


  $("inspect")
    .classList.remove(
      "hidden"
    );

}


/* =========================================================
   UI SETUP
   ========================================================= */

function setupUI() {

  /* NAVIGATION */

  document
    .querySelectorAll(
      "[data-view]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            showView(
              button.dataset.view
            );

            $("mobileMenu")
              .classList.add(
                "hidden"
              );

            $("menu")
              .setAttribute(
                "aria-expanded",
                "false"
              );

          }
        );

      }
    );


  /* MOBILE MENU */

  $("menu")
    .addEventListener(
      "click",
      () => {

        const menu =
          $("mobileMenu");

        const hidden =
          menu.classList.toggle(
            "hidden"
          );


        $("menu")
          .setAttribute(
            "aria-expanded",
            String(
              !hidden
            )
          );

      }
    );


  /* INSPECT CLOSE */

  $("closeInspect")
    .addEventListener(
      "click",
      () => {

        $("inspect")
          .classList.add(
            "hidden"
          );

      }
    );


  /* AUTO ORBIT */

  $("auto")
    .addEventListener(
      "click",
      () => {

        autoOrbit =
          !autoOrbit;


        controls.autoRotate =
          autoOrbit;


        controls.autoRotateSpeed =
          0.8;


        const button =
          $("auto");


        button.querySelector(
          "b"
        ).textContent =
          autoOrbit
            ? "ON"
            : "OFF";

      }
    );


  /* RESET */

  $("reset")
    .addEventListener(
      "click",
      () => {

        if (
          currentView ===
          "solar"
        ) {

          resetCamera(
            [0,45,112]
          );

        } else if (
          currentView ===
          "blackhole"
        ) {

          resetCamera(
            [0,28,68]
          );

        } else if (
          currentView ===
          "dna"
        ) {

          resetCamera(
            [0,6,68]
          );

        } else if (
          currentView ===
          "quantum"
        ) {

          resetCamera(
            [0,18,72]
          );

        } else if (
          currentView ===
          "ai"
        ) {

          resetCamera(
            [0,10,76]
          );

        } else {

          resetCamera(
            [0,30,78]
          );

        }

      }
    );


  /* QUALITY */

  $("quality")
    .addEventListener(
      "click",
      () => {

        if (
          quality ===
          "AUTO"
        ) {

          quality =
            "HIGH";

        } else if (
          quality ===
          "HIGH"
        ) {

          quality =
            "LOW";

        } else {

          quality =
            "AUTO";

        }


        $("quality")
          .querySelector(
            "b"
          )
          .textContent =
          quality;


        renderer.setPixelRatio(

          quality === "LOW"

            ? 1

            : quality === "HIGH"

              ? Math.min(
                  window.devicePixelRatio || 1,
                  2
                )

              : Math.min(
                  window.devicePixelRatio || 1,
                  1.5
                )

        );

      }
    );


  /* SOUND */

  $("sound")
    .addEventListener(
      "click",
      () => {

        soundOn =
          !soundOn;


        $("sound")
          .querySelector(
            "b"
          )
          .textContent =
          soundOn
            ? "ON"
            : "OFF";


        $("sound")
          .setAttribute(
            "aria-pressed",
            String(
              soundOn
            )
          );


        if (
          soundOn
        ) {

          try {

            const AudioContext =
              window.AudioContext ||
              window.webkitAudioContext;


            if (
              !AudioContext
            ) {

              throw new Error(
                "Audio API unavailable."
              );

            }


            audioContext =
              audioContext ||
              new AudioContext();


            const oscillator =
              audioContext
                .createOscillator();


            const gain =
              audioContext
                .createGain();


            oscillator.type =
              "sine";


            oscillator.frequency.value =
              54;


            gain.gain.value =
              0.018;


            oscillator.connect(
              gain
            );


            gain.connect(
              audioContext.destination
            );


            oscillator.start();


            oscillator.stop(
              audioContext.currentTime +
                1.5
            );

          } catch (
            error
          ) {

            console.warn(
              "Ambient audio unavailable:",
              error
            );

          }

        }

      }
    );


  /* =======================================================
     RAYCAST / TAP / CLICK
     ======================================================= */

  renderer.domElement
    .addEventListener(
      "pointerdown",
      event => {

        const rect =
          renderer.domElement
            .getBoundingClientRect();


        pointer.x =
          (
            (
              event.clientX -
              rect.left
            ) /
            rect.width
          ) *
            2 -
          1;


        pointer.y =
          -(
            (
              event.clientY -
              rect.top
            ) /
            rect.height
          ) *
            2 +
          1;


        raycaster.setFromCamera(
          pointer,
          camera
        );


        const hits =
          raycaster.intersectObjects(
            interactive,
            true
          );


        if (
          hits.length
        ) {

          let object =
            hits[0].object;


          while (
            object &&
            !object.userData.info
          ) {

            object =
              object.parent;

          }


          if (
            object
          ) {

            inspectObject(
              object
            );


            setText(
              "infoObject",
              object.userData.info.name
            );


            setText(
              "infoType",
              object.userData.info.tag
            );

          }

        }

      }
    );

}


/* =========================================================
   ANIMATION
   ========================================================= */

function animate() {

  requestAnimationFrame(
    animate
  );


  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );


  elapsed +=
    delta;


  /* CONTROLS */

  if (
    controls
  ) {

    controls.update();

  }


  /* STARS */

  if (
    starfield
  ) {

    starfield.rotation.y +=
      delta *
      0.003;

  }


  /* CURRENT SCENE */

  if (
    currentRoot
  ) {

    /* HOME */

    if (
      currentView ===
      "home"
    ) {

      currentRoot.rotation.y +=
        delta *
        0.12;


      currentRoot.rotation.x =
        Math.sin(
          elapsed *
          0.25
        ) *
        0.04;

    }


    /* SOLAR SYSTEM */

    if (
      currentView ===
      "solar"
    ) {

      currentRoot.rotation.y +=
        delta *
        0.018;


      currentRoot.traverse(
        object => {

          if (
            object.isMesh &&
            object.userData &&
            object.userData.spin
          ) {

            object.rotation.y +=
              object.userData.spin;

          }

        }
      );


      currentRoot.traverse(
        object => {

          if (
            object.userData &&
            object.userData.speed &&
            object.userData.distance
          ) {

            object.userData.angle +=
              object.userData.speed *
              delta *
              0.09;


            const x =
              object.userData.distance *
              Math.cos(
                object.userData.angle
              );


            const z =
              object.userData.distance *
              Math.sin(
                object.userData.angle
              );


            const planet =
              object.children.find(
                child =>
                  child.isMesh
              );


            if (
              planet
            ) {

              planet.position.x =
                x;

              planet.position.z =
                z;

            }

          }

        }
      );


      currentRoot.traverse(
        object => {

          if (
            object.userData &&
            object.userData.speed &&
            !object.userData.distance
          ) {

            object.rotation.y +=
              object.userData.speed *
              delta *
              0.7;

          }

        }
      );

    }


    /* BLACK HOLE */

    if (
      currentView ===
      "blackhole"
    ) {

      currentRoot.rotation.y +=
        delta *
        0.16;

    }


    /* DNA */

    if (
      currentView ===
      "dna"
    ) {

      currentRoot.rotation.y +=
        delta *
        0.42;

    }


    /* QUANTUM */

    if (
      currentView ===
      "quantum"
    ) {

      currentRoot.rotation.y +=
        delta *
        0.22;


      currentRoot.rotation.x =
        Math.sin(
          elapsed *
          0.5
        ) *
        0.16;

    }


    /* AI */

    if (
      currentView ===
      "ai"
    ) {

      currentRoot.rotation.y =
        Math.sin(
          elapsed *
          0.35
        ) *
        0.12;


      currentRoot.position.y =
        Math.sin(
          elapsed *
          0.8
        ) *
        0.5;

    }

  }


  /* RENDER */

  if (
    renderer &&
    scene &&
    camera
  ) {

    renderer.render(
      scene,
      camera
    );

  }


  /* FPS */

  fpsFrames++;


  const now =
    performance.now();


  if (
    now -
      fpsLast >
    1000
  ) {

    const fps =
      Math.round(
        fpsFrames *
        1000 /
        (
          now -
          fpsLast
        )
      );


    setText(
      "fps",
      `${fps} FPS`
    );


    fpsFrames =
      0;

    fpsLast =
      now;

  }

}


/* =========================================================
   RESIZE
   ========================================================= */

function handleResize() {

  if (
    !camera ||
    !renderer
  ) {

    return;

  }


  camera.aspect =
    window.innerWidth /
    window.innerHeight;


  camera.updateProjectionMatrix();


  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    false
  );

}


window.addEventListener(
  "resize",
  handleResize
);


/* =========================================================
   BOOT FAILURE
   ========================================================= */

function bootFailure(
  error
) {

  console.error(
    "THE UNKNOWN boot failure:",
    error
  );


  bootStatus.textContent =
    "3D ENGINE FAILED TO START";


  bootRetry.classList.remove(
    "hidden"
  );


  bootRetry.onclick =
    () => {

      window.location.reload();

    };

}


/* =========================================================
   START APPLICATION
   ========================================================= */

async function start() {

  try {

    bootStatus.textContent =
      "LOADING THREE.JS ENGINE...";


    /*
      Don't rely only on the existence of
      WebGLRenderingContext. Let Three.js itself
      attempt to create the renderer.
    */

    initRenderer();


    bootStatus.textContent =
      "BUILDING STARFIELD...";


    setupUI();


    bootStatus.textContent =
      "BUILDING OBSERVATORY...";


    showView(
      "home"
    );


    animate();


    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          800
        )
    );


    bootStatus.textContent =
      "OBSERVATORY ONLINE";


    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          500
        )
    );


    boot.classList.add(
      "hidden"
    );


    app.classList.remove(
      "hidden-app"
    );


  } catch (
    error
  ) {

    bootFailure(
      error
    );

  }

}


/* =========================================================
   START
   ========================================================= */

start();
