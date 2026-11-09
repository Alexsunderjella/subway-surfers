/**
 * Subway Surfers Web - Game Constants & Configuration
 */

const CONSTANTS = {
  // Lane Configuration
  LANE_WIDTH: 2.6,
  LANES: [-2.6, 0, 2.6], // Left (-1), Middle (0), Right (1)
  LANE_INDEX_LEFT: 0,
  LANE_INDEX_CENTER: 1,
  LANE_INDEX_RIGHT: 2,

  // Speed & Progression
  INITIAL_SPEED: 22,
  MAX_SPEED: 58,
  SPEED_INCREMENT: 0.35, // Speed added per 100 meters
  LANE_CHANGE_SPEED: 18, // Lerp speed for switching lanes

  // Physics
  GRAVITY: -46,
  JUMP_VELOCITY: 15.5,
  SUPER_JUMP_VELOCITY: 22.5,
  FAST_DROP_VELOCITY: -35,
  SLIDE_DURATION: 0.65, // Seconds

  // Dimensions & Heights
  PLAYER_HEIGHT_STAND: 1.8,
  PLAYER_HEIGHT_SLIDE: 0.8,
  TRAIN_HEIGHT: 3.1,
  TRAIN_WIDTH: 2.1,
  TRAIN_LENGTH: 15.0,
  LOW_BARRIER_HEIGHT: 1.15,
  HIGH_BARRIER_BOTTOM: 1.25, // Height from ground to bottom bar (slide under)
  HIGH_BARRIER_TOP: 2.5,
  JETPACK_ALTITUDE: 8.8,

  // Track & Chunks
  CHUNK_LENGTH: 80,
  VISIBLE_CHUNKS: 5,
  SPAWN_AHEAD_DISTANCE: 260,
  DESPAWN_DISTANCE: 40,

  // Powerups (durations in seconds)
  POWERUPS: {
    MAGNET: { id: 'magnet', duration: 11, color: 0xef4444, icon: '🧲', name: 'Coin Magnet' },
    SNEAKERS: { id: 'sneakers', duration: 13, color: 0x3b82f6, icon: '👟', name: 'Super Sneakers' },
    JETPACK: { id: 'jetpack', duration: 8.5, color: 0xf59e0b, icon: '🚀', name: 'Jetpack' },
    MULTIPLIER: { id: 'multiplier', duration: 14, color: 0x10b981, icon: '2X', name: '2x Multiplier' }
  },

  // Audio frequencies & configurations
  AUDIO: {
    MASTER_VOLUME: 0.4
  },

  // Color Palette
  COLORS: {
    GROUND: 0x242426,
    RAIL_BED: 0x3a3a3c,
    RAIL_METAL: 0xa1a1aa,
    SLEEPER_WOOD: 0x45281a,
    WALL_BRICK: 0x8b5a3e,
    SKY_DAY: 0x60a5fa,
    FOG_DAY: 0x7eb6fc,
    TRAIN_PRIMARY: 0x2563eb,
    TRAIN_STRIPE: 0xf59e0b,
    TRAIN_ROOF: 0x475569,
    COIN_GOLD: 0xffd700,
    BARRIER_ORANGE: 0xf97316,
    BARRIER_WHITE: 0xf8fafc
  }
};

