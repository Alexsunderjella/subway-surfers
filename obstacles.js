/**
 * Subway Surfers Web - Obstacles, Trains & Collectibles Manager
 * Procedural generation, train ramps, roofs, coins, and powerups.
 */

class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.trains = [];
    this.coins = [];
    this.powerups = [];
    this.lastSpawnZ = -80; // First obstacle spawns safely at -80m

    // Shared Geometries & Materials for high performance
    this.initAssets();
    this.spawnRunwayCoins();
  }

  spawnRunwayCoins() {
    // Welcoming runway of gold coins on the center lane for the first 4 seconds
    this.createCoinLine(CONSTANTS.LANE_INDEX_CENTER, -12, 0.6, 14);
  }

  initAssets() {
    this.materials = {
      trainBody: new THREE.MeshStandardMaterial({ 
        color: CONSTANTS.COLORS.TRAIN_PRIMARY, 
        metalness: 0.35, 
        roughness: 0.45 
      }),
      trainStripe: new THREE.MeshStandardMaterial({ color: CONSTANTS.COLORS.TRAIN_STRIPE }),
      trainRoof: new THREE.MeshLambertMaterial({ color: CONSTANTS.COLORS.TRAIN_ROOF }),
      trainWindow: new THREE.MeshBasicMaterial({ color: 0x1e293b }),
      trainLight: new THREE.MeshBasicMaterial({ color: 0xfef08a }),
      rampWood: new THREE.MeshLambertMaterial({ color: 0xb45309 }),
      
      barrierOrange: new THREE.MeshLambertMaterial({ color: CONSTANTS.COLORS.BARRIER_ORANGE }),
      barrierWhite: new THREE.MeshLambertMaterial({ color: CONSTANTS.COLORS.BARRIER_WHITE }),
      barrierMetal: new THREE.MeshStandardMaterial({ color: 0x64748b }),

      coinGold: new THREE.MeshStandardMaterial({ 
        color: CONSTANTS.COLORS.COIN_GOLD, 
        metalness: 0.85, 
        roughness: 0.2, 
        emissive: 0x78350f 
      }),

      powerupMagnet: new THREE.MeshStandardMaterial({ color: CONSTANTS.POWERUPS.MAGNET.color, metalness: 0.5 }),
      powerupSneakers: new THREE.MeshStandardMaterial({ color: CONSTANTS.POWERUPS.SNEAKERS.color, metalness: 0.5 }),
      powerupJetpack: new THREE.MeshStandardMaterial({ color: CONSTANTS.POWERUPS.JETPACK.color, metalness: 0.5 }),
      powerupMultiplier: new THREE.MeshStandardMaterial({ color: CONSTANTS.POWERUPS.MULTIPLIER.color, metalness: 0.5 })
    };

    this.coinGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.12, 16);
  }

  // --- SPAWN LOGIC ---

  update(dt, playerZ, playerY, hasMagnet, playerX) {
    // 1. Move oncoming trains
    this.trains.forEach(train => {
      if (train.isMoving) {
        train.mesh.position.z += train.moveSpeed * dt;
        train.box.setFromObject(train.mesh);
      }
    });

    // 2. Rotate Coins & Check Magnet Attraction
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.mesh.rotation.y += dt * 3.5;

      // Magnet attraction
      if (hasMagnet) {
        const dx = playerX - coin.mesh.position.x;
        const dy = (playerY + 0.8) - coin.mesh.position.y;
        const dz = playerZ - coin.mesh.position.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        // Pull coins within 25 meters towards player
        if (distSq < 625 && distSq > 0.1) {
          const pullSpeed = 28 * dt;
          coin.mesh.position.x += dx * pullSpeed;
          coin.mesh.position.y += dy * pullSpeed;
          coin.mesh.position.z += dz * pullSpeed;
        }
      }
    }

    // 3. Rotate Powerups & Hover
    this.powerups.forEach(pw => {
      pw.mesh.rotation.y += dt * 2.5;
      pw.mesh.position.y = pw.baseY + Math.sin(Date.now() * 0.004) * 0.18;
    });

    // 4. Spawn new patterns ahead
    const spawnTargetZ = playerZ - CONSTANTS.SPAWN_AHEAD_DISTANCE;
    while (this.lastSpawnZ > spawnTargetZ) {
      this.spawnPattern(this.lastSpawnZ);
      this.lastSpawnZ -= 38 + Math.random() * 12; // Spacing between obstacles
    }

    // 5. Cleanup objects far behind player
    this.cleanup(playerZ);
  }

  spawnPattern(z) {
    const patternType = Math.floor(Math.random() * 6);
    const lanes = [0, 1, 2];

    switch (patternType) {
      case 0:
        // Pattern 0: Single train with ramp on one lane, low barrier on another, coin line on train
        {
          const trainLane = lanes[Math.floor(Math.random() * lanes.length)];
          this.createTrain(trainLane, z, true, false);
          this.createCoinLine(trainLane, z - 8, CONSTANTS.TRAIN_HEIGHT + 0.6, 5);

          const otherLanes = lanes.filter(l => l !== trainLane);
          const barrierLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
          this.createLowBarrier(barrierLane, z);
          this.createCoinArc(barrierLane, z);
        }
        break;

      case 1:
        // Pattern 1: High barrier (slide under) + Coin line under it + open other lanes
        {
          const barrierLane = lanes[Math.floor(Math.random() * lanes.length)];
          this.createHighBarrier(barrierLane, z);
          this.createCoinLine(barrierLane, z - 3, 0.45, 4);

          // Add a low barrier or moving train in another lane
          const remaining = lanes.filter(l => l !== barrierLane);
          const secondLane = remaining[Math.floor(Math.random() * remaining.length)];
          if (Math.random() > 0.4) {
            this.createLowBarrier(secondLane, z + 6);
          } else {
            this.createTrain(secondLane, z, false, true); // moving train
          }
        }
        break;

      case 2:
        // Pattern 2: Two trains (one with ramp), one open lane with coins or powerup
        {
          const openLane = lanes[Math.floor(Math.random() * lanes.length)];
          const trainLanes = lanes.filter(l => l !== openLane);

          this.createTrain(trainLanes[0], z, true, false); // Ramp train
          this.createTrain(trainLanes[1], z, false, false); // Solid train

          // Coins or chance of Powerup in the open lane!
          if (Math.random() < 0.35) {
            this.createPowerup(openLane, z);
          } else {
            this.createCoinLine(openLane, z - 4, 0.6, 6);
          }
        }
        break;

      case 3:
        // Pattern 3: Sequence of hurdles with at least one completely clear lane
        {
          const clearLane = lanes[Math.floor(Math.random() * lanes.length)];
          const otherLanes = lanes.filter(l => l !== clearLane);

          this.createCoinLine(clearLane, z - 4, 0.6, 6);

          this.createLowBarrier(otherLanes[0], z);
          this.createCoinArc(otherLanes[0], z);

          this.createHighBarrier(otherLanes[1], z);
          this.createCoinLine(otherLanes[1], z - 2, 0.45, 4);
        }
        break;

      case 4:
        // Pattern 4: High Altitude Jetpack Coins (only collected if player has jetpack or sneaker jump)
        {
          const centerLane = 1;
          this.createLowBarrier(centerLane, z);
          this.createCoinLine(centerLane, z - 10, CONSTANTS.JETPACK_ALTITUDE, 8);

          // Random train on left or right
          const side = Math.random() > 0.5 ? 0 : 2;
          this.createTrain(side, z, true, false);
        }
        break;

      default:
        // Pattern 5: Open run with rich coin arcs and a powerup
        {
          const luckyLane = lanes[Math.floor(Math.random() * lanes.length)];
          this.createPowerup(luckyLane, z);
          lanes.filter(l => l !== luckyLane).forEach(l => {
            this.createCoinLine(l, z - 4, 0.6, 5);
          });
        }
        break;
    }
  }

  // --- OBSTACLE FACTORY METHODS ---

  createTrain(laneIndex, z, hasRamp = false, isMoving = false) {
    const x = CONSTANTS.LANES[laneIndex];
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Train Body
    const bodyGeo = new THREE.BoxGeometry(CONSTANTS.TRAIN_WIDTH, CONSTANTS.TRAIN_HEIGHT, CONSTANTS.TRAIN_LENGTH);
    const body = new THREE.Mesh(bodyGeo, this.materials.trainBody);
    body.position.y = CONSTANTS.TRAIN_HEIGHT / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Hazard warning stripe along the bottom
    const stripeGeo = new THREE.BoxGeometry(CONSTANTS.TRAIN_WIDTH + 0.05, 0.35, CONSTANTS.TRAIN_LENGTH);
    const stripe = new THREE.Mesh(stripeGeo, this.materials.trainStripe);
    stripe.position.y = 0.5;
    group.add(stripe);

    // Train Roof Walkway (flat running surface)
    const roofGeo = new THREE.BoxGeometry(CONSTANTS.TRAIN_WIDTH - 0.2, 0.15, CONSTANTS.TRAIN_LENGTH);
    const roof = new THREE.Mesh(roofGeo, this.materials.trainRoof);
    roof.position.y = CONSTANTS.TRAIN_HEIGHT + 0.08;
    roof.receiveShadow = true;
    group.add(roof);

    // Front Windshield & Headlights (facing player at positive Z side of train)
    const frontZ = CONSTANTS.TRAIN_LENGTH / 2;
    const windowGeo = new THREE.BoxGeometry(CONSTANTS.TRAIN_WIDTH * 0.75, 0.85, 0.1);
    const frontWindow = new THREE.Mesh(windowGeo, this.materials.trainWindow);
    frontWindow.position.set(0, CONSTANTS.TRAIN_HEIGHT * 0.68, frontZ + 0.02);
    group.add(frontWindow);

    // Twin Headlights
    const lightGeo = new THREE.CircleGeometry(0.18, 12);
    const leftLight = new THREE.Mesh(lightGeo, this.materials.trainLight);
    leftLight.position.set(-0.6, 1.1, frontZ + 0.04);
    group.add(leftLight);

    const rightLight = new THREE.Mesh(lightGeo, this.materials.trainLight);
    rightLight.position.set(0.6, 1.1, frontZ + 0.04);
    group.add(rightLight);

    // Ramp at front of train
    let rampBox = null;
    if (hasRamp) {
      const rampLength = 5.5;
      const rampGeo = new THREE.BoxGeometry(CONSTANTS.TRAIN_WIDTH - 0.1, 0.2, rampLength);
      const ramp = new THREE.Mesh(rampGeo, this.materials.rampWood);
      // Slope up to roof
      ramp.position.set(0, CONSTANTS.TRAIN_HEIGHT / 2, frontZ + rampLength / 2 - 0.2);
      ramp.rotation.x = -Math.atan2(CONSTANTS.TRAIN_HEIGHT, rampLength);
      ramp.castShadow = true;
      ramp.receiveShadow = true;
      group.add(ramp);
    }

    this.scene.add(group);

    const trainObj = {
      type: 'TRAIN',
      lane: laneIndex,
      mesh: group,
      hasRamp: hasRamp,
      isMoving: isMoving,
      moveSpeed: isMoving ? 14 : 0,
      width: CONSTANTS.TRAIN_WIDTH,
      height: CONSTANTS.TRAIN_HEIGHT,
      length: CONSTANTS.TRAIN_LENGTH,
      box: new THREE.Box3()
    };
    trainObj.box.setFromObject(group);

    this.trains.push(trainObj);
    return trainObj;
  }

  createLowBarrier(laneIndex, z) {
    const x = CONSTANTS.LANES[laneIndex];
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Hurdle Legs
    const legGeo = new THREE.BoxGeometry(0.16, CONSTANTS.LOW_BARRIER_HEIGHT, 0.16);
    const legL = new THREE.Mesh(legGeo, this.materials.barrierMetal);
    legL.position.set(-1.0, CONSTANTS.LOW_BARRIER_HEIGHT / 2, 0);
    legL.castShadow = true;
    group.add(legL);

    const legR = new THREE.Mesh(legGeo, this.materials.barrierMetal);
    legR.position.set(1.0, CONSTANTS.LOW_BARRIER_HEIGHT / 2, 0);
    legR.castShadow = true;
    group.add(legR);

    // Cross planks (striped orange and white)
    const plankGeo = new THREE.BoxGeometry(2.35, 0.28, 0.1);
    const plank1 = new THREE.Mesh(plankGeo, this.materials.barrierOrange);
    plank1.position.y = CONSTANTS.LOW_BARRIER_HEIGHT - 0.15;
    plank1.castShadow = true;
    group.add(plank1);

    const plank2 = new THREE.Mesh(plankGeo, this.materials.barrierWhite);
    plank2.position.y = CONSTANTS.LOW_BARRIER_HEIGHT - 0.55;
    plank2.castShadow = true;
    group.add(plank2);

    this.scene.add(group);

    const obstacleObj = {
      type: 'LOW_BARRIER',
      lane: laneIndex,
      mesh: group,
      height: CONSTANTS.LOW_BARRIER_HEIGHT,
      box: new THREE.Box3().setFromObject(group)
    };

    this.obstacles.push(obstacleObj);
    return obstacleObj;
  }

  createHighBarrier(laneIndex, z) {
    const x = CONSTANTS.LANES[laneIndex];
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Tall vertical poles
    const poleHeight = CONSTANTS.HIGH_BARRIER_TOP;
    const poleGeo = new THREE.BoxGeometry(0.18, poleHeight, 0.18);
    const poleL = new THREE.Mesh(poleGeo, this.materials.barrierMetal);
    poleL.position.set(-1.05, poleHeight / 2, 0);
    poleL.castShadow = true;
    group.add(poleL);

    const poleR = new THREE.Mesh(poleGeo, this.materials.barrierMetal);
    poleR.position.set(1.05, poleHeight / 2, 0);
    poleR.castShadow = true;
    group.add(poleR);

    // High Clearance Sign Bar (Suspended between height 1.35 and 2.5)
    // Rolling under clears this easily!
    const boardH = CONSTANTS.HIGH_BARRIER_TOP - CONSTANTS.HIGH_BARRIER_BOTTOM;
    const boardGeo = new THREE.BoxGeometry(2.35, boardH, 0.14);
    const signBoard = new THREE.Mesh(boardGeo, this.materials.barrierOrange);
    signBoard.position.y = CONSTANTS.HIGH_BARRIER_BOTTOM + boardH / 2;
    signBoard.castShadow = true;
    group.add(signBoard);

    // Hazard warning stripes
    const stripeGeo = new THREE.BoxGeometry(2.36, 0.2, 0.16);
    const stripe = new THREE.Mesh(stripeGeo, this.materials.barrierWhite);
    stripe.position.y = signBoard.position.y;
    group.add(stripe);

    this.scene.add(group);

    const obstacleObj = {
      type: 'HIGH_BARRIER',
      lane: laneIndex,
      mesh: group,
      clearanceBottom: CONSTANTS.HIGH_BARRIER_BOTTOM,
      box: new THREE.Box3().setFromObject(group)
    };

    this.obstacles.push(obstacleObj);
    return obstacleObj;
  }

  createCoinLine(laneIndex, startZ, y = 0.6, count = 5) {
    const x = CONSTANTS.LANES[laneIndex];
    for (let i = 0; i < count; i++) {
      const z = startZ - i * 2.8;
      const coinMesh = new THREE.Mesh(this.coinGeometry, this.materials.coinGold);
      coinMesh.rotation.z = Math.PI / 2;
      coinMesh.position.set(x, y, z);
      coinMesh.castShadow = true;
      this.scene.add(coinMesh);

      this.coins.push({
        mesh: coinMesh,
        collected: false
      });
    }
  }

  createCoinArc(laneIndex, centerZ) {
    const x = CONSTANTS.LANES[laneIndex];
    const count = 7;
    const radius = 3.6;

    for (let i = 0; i < count; i++) {
      const angle = (i / (count - 1)) * Math.PI;
      const arcZ = centerZ + Math.cos(angle) * radius;
      const arcY = 0.6 + Math.sin(angle) * 2.2;

      const coinMesh = new THREE.Mesh(this.coinGeometry, this.materials.coinGold);
      coinMesh.rotation.z = Math.PI / 2;
      coinMesh.position.set(x, arcY, arcZ);
      coinMesh.castShadow = true;
      this.scene.add(coinMesh);

      this.coins.push({
        mesh: coinMesh,
        collected: false
      });
    }
  }

  createPowerup(laneIndex, z) {
    const x = CONSTANTS.LANES[laneIndex];
    const powerupKeys = Object.keys(CONSTANTS.POWERUPS);
    const selectedKey = powerupKeys[Math.floor(Math.random() * powerupKeys.length)];
    const config = CONSTANTS.POWERUPS[selectedKey];

    const group = new THREE.Group();
    const baseY = 1.25;
    group.position.set(x, baseY, z);

    let tokenMesh;
    if (config.id === 'magnet') {
      tokenMesh = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.12, 8, 16, Math.PI), this.materials.powerupMagnet);
      tokenMesh.rotation.z = Math.PI;
    } else if (config.id === 'sneakers') {
      tokenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.7), this.materials.powerupSneakers);
    } else if (config.id === 'jetpack') {
      tokenMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.75, 10), this.materials.powerupJetpack);
    } else {
      // Multiplier (Star token)
      tokenMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.42), this.materials.powerupMultiplier);
    }

    tokenMesh.castShadow = true;
    group.add(tokenMesh);

    // Glowing subtle outer halo
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 12, 12),
      new THREE.MeshBasicMaterial({ color: config.color, wireframe: true, transparent: true, opacity: 0.35 })
    );
    group.add(halo);

    this.scene.add(group);

    this.powerups.push({
      id: config.id,
      name: config.name,
      duration: config.duration,
      mesh: group,
      baseY: baseY,
      collected: false
    });
  }

  // --- COLLISION & QUERY CHECKS ---

  // Check if player is on top of any train roof
  getRoofYAt(playerX, playerZ, playerY) {
    for (const train of this.trains) {
      const halfW = train.width / 2 + 0.3;
      const halfL = train.length / 2 + 0.3;
      const tx = train.mesh.position.x;
      const tz = train.mesh.position.z;

      // Inside train X and Z footprint
      if (Math.abs(playerX - tx) < halfW) {
        // Check ramp slope entrance
        if (train.hasRamp) {
          const frontZ = tz + halfL;
          const rampStart = frontZ + 5.2;
          if (playerZ <= rampStart && playerZ >= frontZ) {
            // Player is running on the ramp! Calculate ramp height
            const progress = (rampStart - playerZ) / 5.2; // 0 to 1
            return progress * train.height;
          }
        }

        // On roof of train
        if (playerZ >= tz - halfL && playerZ <= tz + halfL) {
          // If player is at roof height or jumping onto it
          if (playerY >= train.height - 0.4) {
            return train.height;
          }
        }
      }
    }
    return 0; // Ground level
  }

  // Check collisions with obstacles & trains
  checkObstacleCollision(player) {
    const pBox = player.getBounds();

    // 1. Check Trains
    for (const train of this.trains) {
      train.box.setFromObject(train.mesh);

      // If intersecting train bounding box
      if (pBox.intersectsBox(train.box)) {
        // If player is running on ramp or safely on top of roof, no crash
        if (train.hasRamp) {
          const frontZ = train.mesh.position.z + train.length / 2;
          const rampStart = frontZ + 5.5;
          if (player.z <= rampStart + 0.5 && player.z >= frontZ - 1.2) {
            continue; // Safely climbing ramp
          }
        }
        if (player.y >= train.height - 0.35) {
          continue; // Safely running on roof
        }

        // Crashed into train!
        return true;
      }
    }

    // 2. Check Static Obstacles
    for (const obs of this.obstacles) {
      obs.box.setFromObject(obs.mesh);

      if (pBox.intersectsBox(obs.box)) {
        if (obs.type === 'LOW_BARRIER') {
          // Low hurdle: If jumping high enough, safe!
          if (player.y > obs.height - 0.2) {
            continue;
          }
          return true; // Hit low hurdle
        } else if (obs.type === 'HIGH_BARRIER') {
          // High barrier: If sliding, safe!
          if (player.isSliding && player.y < 0.35) {
            continue;
          }
          return true; // Hit high sign
        }
      }
    }

    return false;
  }

  // Check pickup of coins
  checkCoinPickups(player, onCollect) {
    const pPos = player.group.position;
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      if (coin.collected) continue;

      const cPos = coin.mesh.position;
      const dx = pPos.x - cPos.x;
      const dy = (pPos.y + 0.8) - cPos.y;
      const dz = pPos.z - cPos.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < 1.6) {
        coin.collected = true;
        this.scene.remove(coin.mesh);
        this.coins.splice(i, 1);
        onCollect();
      }
    }
  }

  // Check pickup of powerups
  checkPowerupPickups(player, onCollect) {
    const pPos = player.group.position;
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pw = this.powerups[i];
      if (pw.collected) continue;

      const pwPos = pw.mesh.position;
      const dx = pPos.x - pwPos.x;
      const dy = (pPos.y + 0.8) - pwPos.y;
      const dz = pPos.z - pwPos.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < 2.0) {
        pw.collected = true;
        this.scene.remove(pw.mesh);
        this.powerups.splice(i, 1);
        onCollect(pw);
      }
    }
  }

  cleanup(playerZ) {
    const despawnZ = playerZ + CONSTANTS.DESPAWN_DISTANCE;

    // Trains
    for (let i = this.trains.length - 1; i >= 0; i--) {
      const train = this.trains[i];
      if (train.mesh.position.z > despawnZ + train.length / 2) {
        this.scene.remove(train.mesh);
        this.trains.splice(i, 1);
      }
    }

    // Barriers
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (obs.mesh.position.z > despawnZ) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // Coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      if (coin.mesh.position.z > despawnZ) {
        this.scene.remove(coin.mesh);
        this.coins.splice(i, 1);
      }
    }

    // Powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pw = this.powerups[i];
      if (pw.mesh.position.z > despawnZ) {
        this.scene.remove(pw.mesh);
        this.powerups.splice(i, 1);
      }
    }
  }

  reset() {
    this.trains.forEach(t => this.scene.remove(t.mesh));
    this.obstacles.forEach(o => this.scene.remove(o.mesh));
    this.coins.forEach(c => this.scene.remove(c.mesh));
    this.powerups.forEach(p => this.scene.remove(p.mesh));

    this.trains = [];
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.lastSpawnZ = -80;
    this.spawnRunwayCoins();
  }
}

