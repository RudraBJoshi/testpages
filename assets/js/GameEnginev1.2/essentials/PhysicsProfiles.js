/**
 * PhysicsProfiles - named physics presets for PhysicsBody.
 *
 * Units are "per frame" (pixels/frame, pixels/frame^2), matching every other
 * velocity/position value in this engine (Character, Player, Camera all work
 * in per-frame units already — there is no delta-time plumbed through the
 * render loop, so this stays consistent rather than introducing a second
 * unit system).
 */

export const PhysicsProfiles = {
    /** Plausible gravity/friction/bounce. Not exaggerated, not floaty. */
    REALISTIC: {
        gravity: 0.55,
        maxFallSpeed: 18,
        groundFriction: 0.18,
        airFriction: 0.04,
        acceleration: 0.22,
        // Walking speed in px/frame, independent of gameEnv.innerWidth (see
        // step()'s comment — Character's legacy xVelocity/yVelocity scale
        // with viewport width, which is the wrong axis to drive a
        // physics-world walk speed off of).
        moveSpeed: 5,
        jumpImpulse: 11,
        restitution: 0.28,
        autoRun: false,
        runSpeed: 0,
    },

    /** Geometry-Dash-esque: constant auto-run, snappy jump, hazards kill. */
    RETRO_PLATFORMER: {
        gravity: 0.95,
        maxFallSpeed: 22,
        groundFriction: 0,
        airFriction: 0,
        acceleration: 1,
        moveSpeed: 0, // unused: autoRun drives horizontal speed via runSpeed instead
        jumpImpulse: 13,
        restitution: 0,
        autoRun: true,
        runSpeed: 6.5,
    },

    /** Early-Zelda-esque: no gravity, free 4/8-directional movement, solid walls. */
    RETRO_RPG: {
        gravity: 0,
        maxFallSpeed: 0,
        groundFriction: 0.35,
        airFriction: 0.35,
        acceleration: 0.35,
        moveSpeed: 4,
        jumpImpulse: 0,
        restitution: 0,
        autoRun: false,
        runSpeed: 0,
    },
};

const NAME_ALIASES = {
    realistic: 'REALISTIC',
    retroplatformer: 'RETRO_PLATFORMER',
    platformer: 'RETRO_PLATFORMER',
    retrorpg: 'RETRO_RPG',
    rpg: 'RETRO_RPG',
};

/**
 * Resolve a physics config into a concrete profile object.
 * Accepts:
 *  - a preset name (string, case/spacing-insensitive: "realistic", "Retro Platformer", ...)
 *  - a config object: { mode: "realistic", ...overrides }
 *  - a bare overrides object with no mode (defaults to REALISTIC as a base)
 * @param {string|Object} nameOrConfig
 * @returns {Object} a plain physics profile (safe to mutate per-instance)
 */
export function resolvePhysicsProfile(nameOrConfig) {
    let baseName = 'REALISTIC';
    let overrides = {};

    if (typeof nameOrConfig === 'string') {
        baseName = NAME_ALIASES[nameOrConfig.trim().toLowerCase().replace(/[\s_-]/g, '')] || baseName;
    } else if (nameOrConfig && typeof nameOrConfig === 'object') {
        if (typeof nameOrConfig.mode === 'string') {
            baseName = NAME_ALIASES[nameOrConfig.mode.trim().toLowerCase().replace(/[\s_-]/g, '')] || baseName;
        }
        overrides = nameOrConfig;
    }

    const base = PhysicsProfiles[baseName] || PhysicsProfiles.REALISTIC;
    return { ...base, ...overrides, mode: baseName };
}

export default PhysicsProfiles;
