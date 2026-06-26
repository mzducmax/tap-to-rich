/**
 * Key [P] — golden pig bank descends, money piles up, +$1000 reward.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const PIG_BANK_REWARD = 1000;
export const PIG_BANK_REWARD_LABEL = `+$${PIG_BANK_REWARD.toLocaleString('en-US')}`;
export const PIG_BANK_SPAWN_COOLDOWN_MS = 3200;
export const PIG_BANK_MAX_CONCURRENT = 1;

/** Pig PNG display size (px). */
export const PIG_SPRITE_WIDTH = 600;
export const PIG_SPRITE_HEIGHT = 640;

/** Pig descends from above the viewport. */
export const PIG_DESCEND_MS = 2400;

/** Money rain starts after pig nearly lands. */
export const PIG_RAIN_START_DELAY_MS = 1800;

/**
 * Money-rain video overlay (replaces the live physics pile). The heavy money
 * downpour + dense pile is a pre-baked transparent WebM played in the DOM.
 */
// When the video starts playing, measured from the moment the pig spawns
// (during the descent, as the pig nears its landing spot).
export const MONEY_VIDEO_START_DELAY_MS = PIG_RAIN_START_DELAY_MS;
// How long the "rain" phase lasts before the reward fires — long enough for the
// downpour to fill the screen and the pile to settle.
export const MONEY_VIDEO_FILL_MS = 3800;
// Fraction of the layer height the video covers (anchored to the bottom).
export const MONEY_VIDEO_COVER_RATIO = 0.62;

/** Stop spawning when pile surface reaches this fraction of screen height. */
export const PILE_FILL_RATIO = 0.92;
export const PILE_SETTLE_HOLD_MS = 900;

/**
 * The GPU sprite layer + spatial-grid broad-phase let us simulate many more
 * bills, so the pile reads as a thick, dense heap rather than a thin scatter.
 */
export const MONEY_STACK_POOL = 460;
export const MONEY_STACK_SPAWN_INTERVAL_MS = 70;
/** Bills released per spawn tick — money falls in bulk, not one-by-one. */
export const MONEY_STACK_SPAWN_BURST = 4;
export const MONEY_STACK_WIDTH = 74;

/** 2D rigid-body simulation. */
export const MONEY_PHYSICS_GRAVITY = 1620;
export const MONEY_PHYSICS_AIR_DRAG = 0.78;
export const MONEY_PHYSICS_ANGULAR_DRAG = 1.25;
// Low restitution + higher friction → bills barely bounce and grip each other,
// so they settle into a dense pile instead of scattering.
export const MONEY_PHYSICS_RESTITUTION = 0.12;
export const MONEY_PHYSICS_FRICTION = 0.66;
export const MONEY_PHYSICS_SUBSTEPS = 5;
export const MONEY_PHYSICS_SLEEP_SPEED = 16;
export const MONEY_PHYSICS_SLEEP_ANGULAR = 0.4;
export const MONEY_PHYSICS_SLEEP_FRAMES = 9;

// Matches the money video's CSS fade (.pig-bank-money-video) so the pig and
// the money vanish together before the reward lands on the house.
export const PIG_BANK_FADE_MS = 640;
export const PIG_BANK_REWARD_HOLD_MS = 720;

export const PIG_BANK_RENDER_DPR = 1.5;
export const PIG_BANK_BG_KEY_THRESHOLD = 28;

/**
 * GPU money downpour — every bill is a particle in a single ParticleContainer
 * sharing one texture, so the whole dense rain is one batched draw call.
 * Only position + rotation are marked dynamic; scale/color/uv stay static to
 * keep the per-frame GPU buffer upload minimal.
 */
// Bill count scales with viewport area (1 bill per this many CSS px²) so the
// screen stays evenly dense on any size, capped to keep the buffer bounded.
export const MONEY_RAIN_AREA_PER_BILL = 7200;
export const MONEY_RAIN_MIN_COUNT = 140;
export const MONEY_RAIN_MAX_COUNT = 520;
/** Bill on-screen width range (px) — varied sizes read as depth. */
export const MONEY_RAIN_BILL_MIN_W = 38;
export const MONEY_RAIN_BILL_MAX_W = 78;
/** Fall speed range (px/sec). */
export const MONEY_RAIN_FALL_MIN = 420;
export const MONEY_RAIN_FALL_MAX = 920;
/** Horizontal sway (px) + spin (rad/sec) for fluttering bills. */
export const MONEY_RAIN_SWAY_MIN = 10;
export const MONEY_RAIN_SWAY_MAX = 44;
export const MONEY_RAIN_SPIN_MAX = 3.2;
/** Game-screen shake amplitude (px) while the downpour is active. */
export const MONEY_RAIN_SHAKE_PX = 9;
