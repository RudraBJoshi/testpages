
/**
 * Camera provides smooth-follow tracking of a target point.
 *
 * follow() takes a delta-time in milliseconds so the smoothing feels the
 * same regardless of frame rate (a fixed per-frame multiplier like the old
 * `x += speed * (target - x)` drifts at different speeds on a 30fps vs
 * 144fps display).
 */
export class Camera {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        // Fraction of the remaining distance closed per 16.67ms (~1 frame at 60fps).
        this.smoothing = 0.1;
        // Once within this many pixels of the target, snap instead of easing
        // forever asymptotically (avoids a camera that "never quite arrives").
        this.snapDistance = 0.5;
        this._shakeTime = 0;
        this._shakeMagnitude = 0;
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    /**
     * Briefly offset the camera with random jitter, e.g. on impact/explosion.
     * @param {number} magnitude - max pixel offset
     * @param {number} durationMs - how long the shake lasts
     */
    shake(magnitude = 8, durationMs = 200) {
        this._shakeMagnitude = magnitude;
        this._shakeTime = durationMs;
    }

    /**
     * Advance the camera toward its target.
     * @param {number} dtMs - milliseconds elapsed since the last call (defaults to one 60fps frame)
     */
    follow(dtMs = 16.67) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;

        if (Math.hypot(dx, dy) <= this.snapDistance) {
            this.x = this.targetX;
            this.y = this.targetY;
        } else {
            // Frame-rate independent exponential smoothing.
            const t = 1 - Math.pow(1 - this.smoothing, dtMs / 16.67);
            this.x += dx * t;
            this.y += dy * t;
        }

        if (this._shakeTime > 0) {
            this._shakeTime -= dtMs;
        }
    }

    /**
     * Current render position including any active shake offset.
     */
    getRenderPosition() {
        if (this._shakeTime <= 0) {
            return { x: this.x, y: this.y };
        }
        const falloff = this._shakeTime / 200;
        const offset = this._shakeMagnitude * falloff;
        return {
            x: this.x + (Math.random() * 2 - 1) * offset,
            y: this.y + (Math.random() * 2 - 1) * offset,
        };
    }

    /**
     * Convert a world-space point to a screen-space point: the camera's
     * current (shake-adjusted) position is treated as the point centered in
     * the viewport. Objects render at worldToScreen(position) instead of
     * position directly once gameEnv.camera is set, giving world scrolling.
     * @param {number} worldX
     * @param {number} worldY
     * @param {Object} gameEnv - needs innerWidth/innerHeight
     */
    worldToScreen(worldX, worldY, gameEnv) {
        const render = this.getRenderPosition();
        return {
            x: worldX - render.x + gameEnv.innerWidth / 2,
            y: worldY - render.y + gameEnv.innerHeight / 2,
        };
    }

    /**
     * Clamp the camera so the viewport never shows past the level edges.
     * No-op if gameEnv.levelBounds isn't set (unbounded/viewport-only world).
     * @param {Object} gameEnv - needs innerWidth/innerHeight/levelBounds
     */
    clampToBounds(gameEnv) {
        const bounds = gameEnv?.levelBounds;
        if (!bounds) return;

        const halfW = gameEnv.innerWidth / 2;
        const halfH = gameEnv.innerHeight / 2;

        // If the level is smaller than the viewport on an axis, center it
        // instead of clamping into a min > max range.
        if (bounds.width <= gameEnv.innerWidth) {
            this.x = bounds.width / 2;
        } else {
            this.x = Math.min(Math.max(this.x, halfW), bounds.width - halfW);
        }

        if (bounds.height <= gameEnv.innerHeight) {
            this.y = bounds.height / 2;
        } else {
            this.y = Math.min(Math.max(this.y, halfH), bounds.height - halfH);
        }
    }
}

export default Camera;
