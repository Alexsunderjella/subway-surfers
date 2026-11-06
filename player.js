/**
 * Subway Surfers Web - Player Character & Animation System
 * Stylized 3D Jake-style character with full procedural animations & physics.
 */

class Player {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    // Position & State
    this.lane = CONSTANTS.LANE_INDEX_CENTER;
    this.targetX = CONSTANTS.LANES[this.lane];
    this.x = this.targetX;
    this.y = 0;
    this.z = 0;
    this.yVelocity = 0;

    this.isGrounded = true;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.hasSuperSneakers = false;
    this.hasJetpack = false;
    this.isDead = false;

    // Animation & Visual Helpers
    this.runCycle = 0;
    this.leanAngle = 0;
    this.groundY = 0; // Can be 0 or train roof height

    // Bounding Box
    this.box = new THREE.Box3();

    // Particle thrusters for Jetpack
    this.jetpackParticles = [];

    this.buildMesh();
    this.scene.add(this.group);
  }

  buildMesh() {
    this.character = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffd1b3 });
    const hoodieMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 }); // Vibrant Cyan Blue Hoodie
    const hoodieTrimMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1e293b }); // Dark Denim Jeans
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0xef4444 }); // Red kicks
    const shoeSoleMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const capMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 }); // Red Snapback
    const capBrimMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
    const glassesMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });

    // --- 1. Torso & Hoodie ---
    this.torso = new THREE.Group();
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, 0.5), hoodieMat);
    bodyMesh.castShadow = true;
    this.torso.add(bodyMesh);

    // Hoodie pocket & zipper
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.08), hoodieTrimMat);
    pocket.position.set(0, -0.22, 0.23);
    this.torso.add(pocket);

    // --- 2. Head & Cap ---
    this.head = new THREE.Group();
    this.head.position.y = 0.72;

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.55, 0.52), skinMat);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Hair
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 0.56), hairMat);
    hair.position.y = 0.22;
    this.head.add(hair);

    // Backwards Baseball Cap
    const capDome = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.24, 0.58), capMat);
    capDome.position.y = 0.3;
    this.head.add(capDome);

    const capBrim = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.07, 0.36), capBrimMat);
    capBrim.position.set(0, 0.2, -0.38); // Brim facing backwards
    this.head.add(capBrim);

    // Sunglasses
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 0.1), glassesMat);
    glasses.position.set(0, 0.05, 0.25);
    this.head.add(glasses);

    this.torso.add(this.head);

    // --- 3. Arms ---
    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.55, 0.35, 0);
    const armGeo = new THREE.BoxGeometry(0.24, 0.75, 0.24);
    const lArmMesh = new THREE.Mesh(armGeo, hoodieMat);
    lArmMesh.position.y = -0.3;
    lArmMesh.castShadow = true;
    this.leftArm.add(lArmMesh);
    const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), skinMat);
    lHand.position.y = -0.68;
    this.leftArm.add(lHand);
    this.torso.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.55, 0.35, 0);
    const rArmMesh = new THREE.Mesh(armGeo, hoodieMat);
    rArmMesh.position.y = -0.3;
    rArmMesh.castShadow = true;
    this.rightArm.add(rArmMesh);
    const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), skinMat);
    rHand.position.y = -0.68;
    this.rightArm.add(rHand);
    this.torso.add(this.rightArm);

    // --- 4. Legs ---
    const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.32);

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.25, 0.8, 0);
    const lLegMesh = new THREE.Mesh(legGeo, pantsMat);
    lLegMesh.position.y = -0.35;
    lLegMesh.castShadow = true;
    this.leftLeg.add(lLegMesh);

    // Left Shoe
    this.leftShoe = new THREE.Group();
    this.leftShoe.position.set(0, -0.72, 0.06);
    const lShoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.52), shoeMat);
    const lShoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.56), shoeSoleMat);
    lShoeSole.position.y = -0.11;
    this.leftShoe.add(lShoeUpper);
    this.leftShoe.add(lShoeSole);
    this.leftLeg.add(this.leftShoe);
    this.character.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.25, 0.8, 0);
    const rLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rLegMesh.position.y = -0.35;
    rLegMesh.castShadow = true;
    this.rightLeg.add(rLegMesh);

    // Right Shoe
    this.rightShoe = new THREE.Group();
    this.rightShoe.position.set(0, -0.72, 0.06);
    const rShoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.52), shoeMat);
    const rShoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.56), shoeSoleMat);
    rShoeSole.position.y = -0.11;
    this.rightShoe.add(rShoeUpper);
    this.rightShoe.add(rShoeSole);
    this.rightLeg.add(this.rightShoe);
    this.character.add(this.rightLeg);

    // Position Torso at proper pivot height
    this.torso.position.y = 1.25;
    this.character.add(this.torso);

    // --- 5. Jetpack Attachment (Initially Hidden) ---
    this.jetpackMesh = this.buildJetpackMesh();
    this.jetpackMesh.position.set(0, 0, -0.35);
    this.jetpackMesh.visible = false;
    this.torso.add(this.jetpackMesh);

    // --- 6. Super Sneakers Visual Glow Rings (Initially Hidden) ---
    this.sneakerRings = this.buildSneakerRings();
    this.character.add(this.sneakerRings);
    this.sneakerRings.visible = false;

    // --- 7. Blob Shadow on ground ---
    const shadowGeo = new THREE.CircleGeometry(0.65, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ 
      color: 0x000000, 
      transparent: true, 
      opacity: 0.45,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);

    this.group.add(this.character);
  }

  buildJetpackMesh() {
    const jetpack = new THREE.Group();
    const tankMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.3 });
    const nozMat = new THREE.MeshLambertMaterial({ color: 0x334155 });

    // Left Cylinder Tank
    const tankGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.75, 12);
    const leftTank = new THREE.Mesh(tankGeo, tankMat);
    leftTank.position.x = -0.22;
    jetpack.add(leftTank);

    // Right Cylinder Tank
    const rightTank = new THREE.Mesh(tankGeo, tankMat);
    rightTank.position.x = 0.22;
    jetpack.add(rightTank);

    // Cross plate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.08), tankMat);
    jetpack.add(plate);

    // Exhaust Nozzles
    const nozGeo = new THREE.ConeGeometry(0.13, 0.2, 8);
    const nozL = new THREE.Mesh(nozGeo, nozMat);
    nozL.rotation.x = Math.PI;
    nozL.position.set(-0.22, -0.44, 0);
    jetpack.add(nozL);

    const nozR = new THREE.Mesh(nozGeo, nozMat);
    nozR.rotation.x = Math.PI;
    nozR.position.set(0.22, -0.44, 0);
    jetpack.add(nozR);

    return jetpack;
  }

  buildSneakerRings() {
    const group = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(0.28, 0.05, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    this.ringL = new THREE.Mesh(ringGeo, ringMat);
    this.ringL.rotation.x = Math.PI / 2;
    this.ringL.position.set(-0.25, 0.1, 0);
    group.add(this.ringL);

    this.ringR = new THREE.Mesh(ringGeo, ringMat);
    this.ringR.rotation.x = Math.PI / 2;
    this.ringR.position.set(0.25, 0.1, 0);
    group.add(this.ringR);

    return group;
  }

  // --- CONTROLS / ACTIONS ---

  moveLeft() {
    if (this.isDead) return;
    if (this.lane > CONSTANTS.LANE_INDEX_LEFT) {
      this.lane--;
      this.targetX = CONSTANTS.LANES[this.lane];
      this.leanAngle = 0.28;
      window.soundEngine.playLaneChange();
    }
  }

  moveRight() {
    if (this.isDead) return;
    if (this.lane < CONSTANTS.LANE_INDEX_RIGHT) {
      this.lane++;
      this.targetX = CONSTANTS.LANES[this.lane];
      this.leanAngle = -0.28;
      window.soundEngine.playLaneChange();
    }
  }

  jump() {
    if (this.isDead || this.hasJetpack) return;

    // Can jump if grounded or jumping off a train roof
    if (this.isGrounded) {
      const v = this.hasSuperSneakers ? CONSTANTS.SUPER_JUMP_VELOCITY : CONSTANTS.JUMP_VELOCITY;
      this.yVelocity = v;
      this.isGrounded = false;
      this.isJumping = true;
      this.isSliding = false; // Cancel slide when jumping
      window.soundEngine.playJump(this.hasSuperSneakers);
    }
  }

  slide() {
    if (this.isDead || this.hasJetpack) return;

    // If airborne, dive down fast! (Subway Surfers signature mechanic)
    if (!this.isGrounded) {
      this.yVelocity = CONSTANTS.FAST_DROP_VELOCITY;
    }

    this.isSliding = true;
    this.slideTimer = CONSTANTS.SLIDE_DURATION;
    window.soundEngine.playSlide();
  }

  setSuperSneakers(active) {
    this.hasSuperSneakers = active;
    this.sneakerRings.visible = active;
  }

  setJetpack(active) {
    this.hasJetpack = active;
    this.jetpackMesh.visible = active;
    if (active) {
      this.isSliding = false;
      this.isGrounded = false;
      window.soundEngine.startJetpackSound();
    } else {
      window.soundEngine.stopJetpackSound();
    }
  }

  crash() {
    this.isDead = true;
    this.setJetpack(false);
    window.soundEngine.playCrash();
  }

  reset() {
    this.lane = CONSTANTS.LANE_INDEX_CENTER;
    this.targetX = CONSTANTS.LANES[this.lane];
    this.x = this.targetX;
    this.y = 0;
    this.z = 0;
    this.yVelocity = 0;
    this.groundY = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.hasSuperSneakers = false;
    this.hasJetpack = false;
    this.isDead = false;
    this.leanAngle = 0;
    this.runCycle = 0;

    this.jetpackMesh.visible = false;
    this.sneakerRings.visible = false;

    // Reset transforms
    this.character.rotation.set(0, 0, 0);
    this.character.position.set(0, 0, 0);
    this.torso.rotation.set(0, 0, 0);
    this.torso.position.set(0, 1.25, 0);
    this.leftLeg.rotation.set(0, 0, 0);
    this.rightLeg.rotation.set(0, 0, 0);
    this.leftArm.rotation.set(0, 0, 0);
    this.rightArm.rotation.set(0, 0, 0);
    this.group.position.set(this.x, 0, this.z);
  }

  // --- UPDATE LOOP ---

  update(dt, currentSpeed, currentRoofY = 0) {
    if (this.isDead) {
      // Dramatic crash tumble backwards
      this.character.rotation.x = THREE.MathUtils.lerp(this.character.rotation.x, -Math.PI / 2.2, dt * 10);
      this.character.rotation.z = THREE.MathUtils.lerp(this.character.rotation.z, 0.4, dt * 8);
      this.group.position.z += currentSpeed * 0.2 * dt;
      return;
    }

    // 1. Advance Z Position (running forward into -Z)
    this.z -= currentSpeed * dt;

    // 2. Smooth Lane X interpolation
    this.x = THREE.MathUtils.lerp(this.x, this.targetX, dt * CONSTANTS.LANE_CHANGE_SPEED);

    // Recover lean angle smoothly
    this.leanAngle = THREE.MathUtils.lerp(this.leanAngle, 0, dt * 12);
    this.character.rotation.z = this.leanAngle;

    // 3. Vertical Physics (Y)
    this.groundY = currentRoofY; // 0 or roof of a train below player

    if (this.hasJetpack) {
      // Smoothly ascend / fly at jetpack altitude
      this.y = THREE.MathUtils.lerp(this.y, CONSTANTS.JETPACK_ALTITUDE, dt * 4.5);
      this.isGrounded = false;
      this.yVelocity = 0;
    } else {
      // Normal Gravity Physics
      this.yVelocity += CONSTANTS.GRAVITY * dt;
      this.y += this.yVelocity * dt;

      // Landing check on ground or train roof
      if (this.y <= this.groundY) {
        this.y = this.groundY;
        this.yVelocity = 0;
        this.isGrounded = true;
        this.isJumping = false;
      } else {
        this.isGrounded = false;
      }
    }

    // 4. Slide Timer
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 5. Update World Position of Group
    this.group.position.set(this.x, this.y, this.z);

    // Shadow position follows ground/roof directly beneath
    this.shadowMesh.position.y = (this.groundY - this.y) + 0.03;
    const shadowScale = Math.max(0.2, 1 - (this.y - this.groundY) * 0.12);
    this.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);

    // 6. Procedural Animations
    this.animate(dt, currentSpeed);
  }

  animate(dt, currentSpeed) {
    if (this.hasJetpack) {
      // Floating flight pose
      this.torso.rotation.x = 0.22;
      this.head.rotation.x = -0.18;
      this.leftLeg.rotation.x = THREE.MathUtils.degToRad(25);
      this.rightLeg.rotation.x = THREE.MathUtils.degToRad(35);
      this.leftArm.rotation.x = THREE.MathUtils.degToRad(-30);
      this.rightArm.rotation.x = THREE.MathUtils.degToRad(-30);
      return;
    }

    if (this.isSliding) {
      // Tucked forward slide animation
      this.character.position.y = -0.55;
      this.torso.rotation.x = THREE.MathUtils.degToRad(72);
      this.head.rotation.x = THREE.MathUtils.degToRad(-35);
      this.leftLeg.rotation.x = THREE.MathUtils.degToRad(-60);
      this.rightLeg.rotation.x = THREE.MathUtils.degToRad(-45);
      this.leftArm.rotation.x = THREE.MathUtils.degToRad(60);
      this.rightArm.rotation.x = THREE.MathUtils.degToRad(60);
      return;
    }

    // Return from slide
    this.character.position.y = 0;
    this.torso.rotation.x = 0;
    this.head.rotation.x = 0;

    if (this.isJumping) {
      // Jumping pose: legs tucked slightly, arms up for balance
      this.leftLeg.rotation.x = THREE.MathUtils.degToRad(35);
      this.rightLeg.rotation.x = THREE.MathUtils.degToRad(20);
      this.leftArm.rotation.x = THREE.MathUtils.degToRad(-55);
      this.rightArm.rotation.x = THREE.MathUtils.degToRad(-55);
      return;
    }

    // Running cycle on ground
    const runFreq = currentSpeed * 0.45;
    this.runCycle += dt * runFreq;

    const legAngle = Math.sin(this.runCycle) * 0.85;
    this.leftLeg.rotation.x = legAngle;
    this.rightLeg.rotation.x = -legAngle;

    this.leftArm.rotation.x = -legAngle * 0.8;
    this.rightArm.rotation.x = legAngle * 0.8;

    // Torso bobbing
    this.torso.position.y = 1.25 + Math.abs(Math.sin(this.runCycle * 2)) * 0.08;

    // Super sneakers ring rotation
    if (this.hasSuperSneakers) {
      this.ringL.rotation.z += dt * 6;
      this.ringR.rotation.z += dt * 6;
      this.sneakerRings.position.y = this.leftLeg.position.y - 0.7;
    }
  }

  // Calculate current 3D collision bounds
  getBounds() {
    const halfWidth = 0.42;
    const halfDepth = 0.42;
    const height = this.isSliding ? CONSTANTS.PLAYER_HEIGHT_SLIDE : CONSTANTS.PLAYER_HEIGHT_STAND;

    this.box.min.set(
      this.x - halfWidth,
      this.y,
      this.z - halfDepth
    );
    this.box.max.set(
      this.x + halfWidth,
      this.y + height,
      this.z + halfDepth
    );

    return this.box;
  }
}

