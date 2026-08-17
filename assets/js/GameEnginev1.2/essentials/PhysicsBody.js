/**
 * PhysicsBody - per-object physics integrator driven by a PhysicsProfile.
 *
 * One instance is attached to a Character/Player when constructed with
 * `data.physics` set. Character.move() delegates to step() instead of its
 * own manual clamp code when a physicsBody is present; objects without one
 * are completely unaffected (legacy behavior, unchanged).
 *
 * Collision against solid level geometry (Barrier platforms/walls/ground) is
 * resolved here directly via a small axis-separated AABB pass — not by
 * relying on the shared GameObject.collisionChecks()/handleCollisionState()
 * system. That system only *zeroes velocity once* based on the touch state
 * from the position *before* this frame's move, then this class's own
 * accel-toward-input blending would immediately re-inject velocity back
 * toward the pressed key's direction, undoing the block and letting the
 * object creep (or on a fast-enough frame, jump) through walls. Resolving
 * position directly against real geometry after this frame's tentative move
 * is what actually stops it, every frame, regardless of what ran earlier in
 * the frame.
 */
class PhysicsBody {
    constructor(owner, profile) {
        this.owner = owner;
        this.profile = profile;
        // Whether the object is currently resting on a floor/platform. Used
        // to gate jumping and to skip gravity while resting (otherwise a
        // resting object would sink by `gravity` px every frame before the
        // next collision check catches it — a constant low-level jitter).
        this.isGrounded = false;
    }

    /**
     * Advance this object's velocity/position by one frame according to its
     * profile: input/auto-run target velocity, friction, gravity, then
     * integration and collision resolution (solids, then world bounds).
     */
    step() {
        const owner = this.owner;
        const profile = this.profile;
        const gameEnv = owner.gameEnv;
        if (!gameEnv || !owner.position || !owner.velocity) return;

        const grounded = this.isGrounded;

        // 1. Blend velocity toward the input/auto-run target. Direction
        // comes from desiredVelocity's sign, but magnitude comes from
        // profile.moveSpeed — desiredVelocity's magnitude is Character's
        // legacy xVelocity/yVelocity, which scales with gameEnv.innerWidth
        // (viewport size). That's fine for the old non-physics movement, but
        // a physics world's walking speed should not change with browser
        // window size, so it's decoupled here.
        const desired = owner.desiredVelocity || { x: 0, y: 0 };
        const targetX = profile.autoRun ? profile.runSpeed : Math.sign(desired.x || 0) * profile.moveSpeed;
        owner.velocity.x += (targetX - owner.velocity.x) * profile.acceleration;

        const hasGravity = profile.gravity > 0;
        if (!hasGravity) {
            // No gravity (Retro RPG): vertical movement is free, same treatment as horizontal.
            const targetY = Math.sign(desired.y || 0) * profile.moveSpeed;
            owner.velocity.y += (targetY - owner.velocity.y) * profile.acceleration;
        }

        // 2. Surface drag — a separate knob from acceleration above, so a
        // profile can have snappy acceleration but slippery/heavy stopping
        // (or vice versa) rather than one constant governing both.
        const friction = grounded ? profile.groundFriction : profile.airFriction;
        if (friction > 0) {
            owner.velocity.x *= (1 - friction);
            if (!hasGravity) owner.velocity.y *= (1 - friction);
        }

        // 3. Gravity. Skipped while grounded (see isGrounded comment above).
        if (hasGravity) {
            if (grounded) {
                if (owner.velocity.y > 0) owner.velocity.y = 0;
            } else {
                owner.velocity.y += profile.gravity;
                if (owner.velocity.y > profile.maxFallSpeed) {
                    owner.velocity.y = profile.maxFallSpeed;
                }
            }
        }

        // 4. Integrate and resolve one axis at a time. Doing X and Y as two
        // separate move+resolve passes (rather than moving both then
        // resolving once) avoids diagonal tunneling through corners and is
        // what actually determines isGrounded, as a side effect of resolving
        // a downward Y move into a platform/floor.
        this.isGrounded = false;
        owner.position.x += owner.velocity.x;
        this._resolveAxisCollisions('x');

        owner.position.y += owner.velocity.y;
        this._resolveAxisCollisions('y');

        // 5. World bounds (edges of the level, or death-pit for auto-run modes).
        this._resolveWorldBounds();
    }

    /**
     * Apply an upward jump impulse if grounded and the profile allows jumping.
     * No-op for profiles with jumpImpulse <= 0 (e.g. Retro RPG).
     */
    jump() {
        if (this.profile.jumpImpulse > 0 && this.isGrounded) {
            this.owner.velocity.y = -this.profile.jumpImpulse;
            this.isGrounded = false;
        }
    }

    /**
     * Instantly reset velocity/grounded state (used when swapping profiles
     * on the fly, e.g. the physics-mode demo switcher).
     */
    reset() {
        this.owner.velocity.x = 0;
        this.owner.velocity.y = 0;
        this.isGrounded = false;
    }

    /**
     * Static, non-physics collidable objects (Barrier platforms/walls/etc.) —
     * "ground" here means level geometry, not another physics-driven mover.
     */
    _getSolids() {
        const owner = this.owner;
        const gameObjects = owner.gameEnv?.gameObjects || [];
        return gameObjects.filter(
            (obj) => obj && obj !== owner && !obj.physicsBody && obj.canvas && typeof obj.getGameRect === 'function'
        );
    }

    /**
     * Resolve overlaps with solid objects along a single axis: push the
     * owner back out to the nearest edge of whatever it overlapped and zero
     * velocity on that axis. Landing on top of something (moving down into
     * it) sets isGrounded.
     * @param {'x'|'y'} axis
     */
    _resolveAxisCollisions(axis) {
        const owner = this.owner;
        if (typeof owner.getGameRect !== 'function') return;

        for (const solid of this._getSolids()) {
            const rect = owner.getGameRect();
            const other = solid.getGameRect();
            const overlapX = rect.right > other.left && rect.left < other.right;
            const overlapY = rect.bottom > other.top && rect.top < other.bottom;
            if (!overlapX || !overlapY) continue;

            if (axis === 'x') {
                if (owner.velocity.x > 0) {
                    owner.position.x = other.left - rect.width;
                } else if (owner.velocity.x < 0) {
                    owner.position.x = other.right;
                }
                owner.velocity.x = 0;
            } else {
                if (owner.velocity.y > 0) {
                    owner.position.y = other.top - rect.height;
                    this.isGrounded = true;
                } else if (owner.velocity.y < 0) {
                    owner.position.y = other.bottom;
                }
                owner.velocity.y = 0;
            }
        }
    }

    _resolveWorldBounds() {
        const owner = this.owner;
        const profile = this.profile;
        const gameEnv = owner.gameEnv;
        const bounds = gameEnv.levelBounds || { width: gameEnv.innerWidth, height: gameEnv.innerHeight };
        const width = owner.width || 0;
        const height = owner.height || 0;

        const bounce = (v) => (profile.restitution > 0 ? -v * profile.restitution : 0);

        // Left / right walls.
        if (owner.position.x < 0) {
            owner.position.x = 0;
            owner.velocity.x = bounce(owner.velocity.x);
        } else if (owner.position.x + width > bounds.width) {
            owner.position.x = bounds.width - width;
            owner.velocity.x = bounce(owner.velocity.x);
        }

        // Ceiling.
        if (owner.position.y < 0) {
            owner.position.y = 0;
            owner.velocity.y = bounce(owner.velocity.y);
        }

        // Floor (or death-pit for auto-run modes like Retro Platformer).
        if (owner.position.y + height > bounds.height) {
            if (profile.autoRun) {
                const gc = gameEnv.gameControl;
                if (gc && gc.currentLevel) {
                    gc.currentLevel.restart = true;
                }
                owner.position.y = bounds.height - height;
                owner.velocity.y = 0;
            } else {
                owner.position.y = bounds.height - height;
                owner.velocity.y = bounce(owner.velocity.y);
                this.isGrounded = true;
            }
        }
    }
}

export default PhysicsBody;
