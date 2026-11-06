/**
 * Subway Surfers Web - World & Environment Manager
 * Handles tracks, procedural city skyline, overhead arches, rails, and chunk recycling.
 */

class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.chunks = [];
    this.chunkLength = CONSTANTS.CHUNK_LENGTH;
    this.totalChunks = CONSTANTS.VISIBLE_CHUNKS;
    this.nextChunkZ = 0;

    // Shared Materials for optimal performance
    this.materials = {
      ground: new THREE.MeshLambertMaterial({ color: CONSTANTS.COLORS.GROUND }),
      ballast: new THREE.MeshLambertMaterial({ color: CONSTANTS.COLORS.RAIL_BED }),
      rail: new THREE.MeshStandardMaterial({ 
        color: CONSTANTS.COLORS.RAIL_METAL, 
        metalness: 0.85, 
        roughness: 0.25 
      }),
      sleeper: new THREE.MeshLambertMaterial({ color: CONSTANTS.COLORS.SLEEPER_WOOD }),
      wall: new THREE.MeshLambertMaterial({ color: CONSTANTS.COLORS.WALL_BRICK }),
      wallTrim: new THREE.MeshLambertMaterial({ color: 0x334155 }),
      archMetal: new THREE.MeshLambertMaterial({ color: 0x475569 }),
      wire: new THREE.MeshBasicMaterial({ color: 0x1e293b }),
      lampLight: new THREE.MeshBasicMaterial({ color: 0xfef08a }),
      buildingColors: [
        new THREE.MeshLambertMaterial({ color: 0x3b82f6 }),
        new THREE.MeshLambertMaterial({ color: 0x10b981 }),
        new THREE.MeshLambertMaterial({ color: 0xf59e0b }),
        new THREE.MeshLambertMaterial({ color: 0x8b5cf6 }),
        new THREE.MeshLambertMaterial({ color: 0xec4899 }),
        new THREE.MeshLambertMaterial({ color: 0x64748b })
      ],
      windowGlass: new THREE.MeshBasicMaterial({ color: 0xfef9c3 })
    };

    // Shared Geometries
    this.geometries = {
      rail: new THREE.BoxGeometry(0.12, 0.16, this.chunkLength),
      sleeper: new THREE.BoxGeometry(2.2, 0.12, 0.4),
      ground: new THREE.PlaneGeometry(36, this.chunkLength),
      ballast: new THREE.BoxGeometry(9.6, 0.2, this.chunkLength),
      wall: new THREE.BoxGeometry(1.2, 7.5, this.chunkLength),
      wallTop: new THREE.BoxGeometry(1.6, 0.4, this.chunkLength)
    };

    this.init();
  }

  init() {
    // Setup Scene Lighting
    this.setupLighting();

    // Create Initial Chunks
    for (let i = 0; i < this.totalChunks; i++) {
      const z = -i * this.chunkLength;
      const chunk = this.createChunk(z);
      this.chunks.push(chunk);
      this.scene.add(chunk.group);
      this.nextChunkZ = z - this.chunkLength;
    }
  }

  setupLighting() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    this.scene.add(ambientLight);

    // Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 0.85);
    sunLight.position.set(25, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 160;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    this.scene.add(sunLight);
    this.sunLight = sunLight;

    // Atmospheric Fog
    this.scene.fog = new THREE.FogExp2(CONSTANTS.COLORS.FOG_DAY, 0.009);
    this.scene.background = new THREE.Color(CONSTANTS.COLORS.SKY_DAY);
  }

  createChunk(z) {
    const group = new THREE.Group();
    group.position.z = z;

    // 1. Ground Plane
    const ground = new THREE.Mesh(this.geometries.ground, this.materials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    group.add(ground);

    // 2. Ballast (Gravel bed under tracks)
    const ballast = new THREE.Mesh(this.geometries.ballast, this.materials.ballast);
    ballast.position.y = -0.05;
    ballast.receiveShadow = true;
    group.add(ballast);

    // 3. Rails & Sleepers for each of the 3 lanes
    const laneX = CONSTANTS.LANES;
    laneX.forEach(lx => {
      // Left and right rails
      const railL = new THREE.Mesh(this.geometries.rail, this.materials.rail);
      railL.position.set(lx - 0.75, 0.1, 0);
      railL.castShadow = true;
      group.add(railL);

      const railR = new THREE.Mesh(this.geometries.rail, this.materials.rail);
      railR.position.set(lx + 0.75, 0.1, 0);
      railR.castShadow = true;
      group.add(railR);

      // Sleepers (spaced every 2.4 meters)
      const sleeperCount = Math.floor(this.chunkLength / 2.4);
      for (let s = 0; s < sleeperCount; s++) {
        const sleeper = new THREE.Mesh(this.geometries.sleeper, this.materials.sleeper);
        const sz = -this.chunkLength / 2 + s * 2.4 + 1.2;
        sleeper.position.set(lx, 0.04, sz);
        sleeper.receiveShadow = true;
        group.add(sleeper);
      }
    });

    // 4. Side Boundary Walls
    const leftWall = new THREE.Mesh(this.geometries.wall, this.materials.wall);
    leftWall.position.set(-6.2, 3.6, 0);
    group.add(leftWall);

    const leftWallTop = new THREE.Mesh(this.geometries.wallTop, this.materials.wallTrim);
    leftWallTop.position.set(-6.2, 7.45, 0);
    group.add(leftWallTop);

    const rightWall = new THREE.Mesh(this.geometries.wall, this.materials.wall);
    rightWall.position.set(6.2, 3.6, 0);
    group.add(rightWall);

    const rightWallTop = new THREE.Mesh(this.geometries.wallTop, this.materials.wallTrim);
    rightWallTop.position.set(6.2, 7.45, 0);
    group.add(rightWallTop);

    // 5. Overhead Railway Arch Gantry (one per chunk)
    const archGroup = this.createArchGantry();
    archGroup.position.set(0, 0, 0);
    group.add(archGroup);

    // 6. City Skyline Background Buildings (outside walls)
    this.addBackgroundBuildings(group);

    return { group, z };
  }

  createArchGantry() {
    const gantry = new THREE.Group();

    // Two vertical posts
    const postGeo = new THREE.BoxGeometry(0.35, 7.5, 0.35);
    const postL = new THREE.Mesh(postGeo, this.materials.archMetal);
    postL.position.set(-5.2, 3.75, 0);
    gantry.add(postL);

    const postR = new THREE.Mesh(postGeo, this.materials.archMetal);
    postR.position.set(5.2, 3.75, 0);
    gantry.add(postR);

    // Cross beam
    const beamGeo = new THREE.BoxGeometry(10.8, 0.4, 0.4);
    const beam = new THREE.Mesh(beamGeo, this.materials.archMetal);
    beam.position.set(0, 7.2, 0);
    gantry.add(beam);

    // Overhead catenary wire insulators & traffic signals
    CONSTANTS.LANES.forEach(lx => {
      const signalHousing = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.9, 0.3),
        new THREE.MeshLambertMaterial({ color: 0x18181b })
      );
      signalHousing.position.set(lx, 6.4, 0);
      gantry.add(signalHousing);

      // Green signal light
      const greenLight = new THREE.Mesh(
        new THREE.CircleGeometry(0.14, 16),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      greenLight.position.set(lx, 6.3, 0.16);
      gantry.add(greenLight);
    });

    return gantry;
  }

  addBackgroundBuildings(chunkGroup) {
    // Generate 3-5 colorful city buildings on each side
    const buildingCount = 4;
    const spacing = this.chunkLength / buildingCount;

    for (let i = 0; i < buildingCount; i++) {
      const zOffset = -this.chunkLength / 2 + i * spacing + spacing / 2;

      // Left building
      const hL = 14 + Math.random() * 18;
      const wL = 7 + Math.random() * 5;
      const dL = 8 + Math.random() * 5;
      const matL = this.materials.buildingColors[Math.floor(Math.random() * this.materials.buildingColors.length)];

      const bL = new THREE.Mesh(new THREE.BoxGeometry(wL, hL, dL), matL);
      bL.position.set(-6.2 - wL / 2 - 1.5, hL / 2 - 0.5, zOffset);
      chunkGroup.add(bL);

      // Right building
      const hR = 14 + Math.random() * 18;
      const wR = 7 + Math.random() * 5;
      const dR = 8 + Math.random() * 5;
      const matR = this.materials.buildingColors[Math.floor(Math.random() * this.materials.buildingColors.length)];

      const bR = new THREE.Mesh(new THREE.BoxGeometry(wR, hR, dR), matR);
      bR.position.set(6.2 + wR / 2 + 1.5, hR / 2 - 0.5, zOffset);
      chunkGroup.add(bR);
    }
  }

  update(playerZ) {
    // Move sunlight along with player so shadows stay crisp
    if (this.sunLight) {
      this.sunLight.position.z = playerZ + 20;
      this.sunLight.target.position.z = playerZ - 20;
      this.sunLight.target.updateMatrixWorld();
    }

    // Check if oldest chunk has been passed by player
    const oldestChunk = this.chunks[0];
    if (playerZ < oldestChunk.z - this.chunkLength / 2 - 10) {
      // Recycle to the front
      oldestChunk.z = this.nextChunkZ;
      oldestChunk.group.position.z = this.nextChunkZ;
      this.nextChunkZ -= this.chunkLength;

      // Rotate array
      this.chunks.push(this.chunks.shift());
    }
  }

  reset() {
    this.nextChunkZ = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      const z = -i * this.chunkLength;
      this.chunks[i].z = z;
      this.chunks[i].group.position.z = z;
      this.nextChunkZ = z - this.chunkLength;
    }
  }
}

