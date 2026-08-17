import Character from './Character.js';
import TouchControls from './TouchControls.js';

// Define non-mutable constants as defaults
const SCALE_FACTOR = 25; // 1/nth of the height of the canvas
const STEP_FACTOR = 100; // 1/nth, or N steps up and across the canvas
const ANIMATION_RATE = 1; // 1/nth of the frame rate
const INIT_POSITION = { x: 0, y: 0 };


class Player extends Character {
    // Static counter for unique player IDs (uninitialized)
    static playerCount;
    /**
     * The constructor method is called when a new Player object is created.
     * 
     * @param {Object|null} data - The sprite data for the object. If null, a default red square is used.
     */
    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);
        // Increment static player counter and assign unique id
        Player.playerCount = (Player.playerCount || 0) + 1;
        this.id = data?.id ? data.id.toLowerCase() : `player${Player.playerCount}`;
        // interact: 69 ('e') matches the default touchOptions.interactLabel below,
        // so the on-screen interact button has a keyCode to dispatch out of the box.
        this.keypress = data?.keypress || {up: 87, left: 65, down: 83, right: 68, interact: 69};
        this.touchOptions = data?.touchOptions || {interactLabel: "e", position: "left"};
        this.touchOptions.id = `touch-controls-${this.id}`;
        this.touchOptions.mapping = this.keypress;
        this.pressedKeys = {}; // active keys array
        // Store bound handlers for add/remove
        this._boundHandleKeyDown = this.handleKeyDown.bind(this);
        this._boundHandleKeyUp = this.handleKeyUp.bind(this);
        this.bindMovementKeyListners();
        this.gravity = data.GRAVITY || false;
        this.acceleration = 0.001;
        this.time = 0;
        this.moved = false;
        // Key-driven velocity target. update() eases this.velocity toward it
        // each frame instead of snapping instantly, so starting/stopping feels
        // like acceleration rather than teleporting to full speed.
        this.desiredVelocity = { x: 0, y: 0 };
        // Fraction of the remaining velocity gap closed per frame (~60fps
        // reference). Higher = snappier, lower = floatier; 0.35 reaches ~95%
        // of target speed in about 7 frames (~120ms) — responsive but not abrupt.
        this.moveEase = data?.moveEase ?? 0.35;
        // Terminal fall speed so unbounded gravity accumulation can't build up
        // into a jarring high-speed snap/tunnel on the next collision.
        this.maxFallSpeed = data?.maxFallSpeed ?? 20;
        // Initialize touch controls for mobile devices
        this.touchControls = new TouchControls(gameEnv, this.touchOptions);
    }

    /**
     * Binds key event listeners to handle object movement.
     * 
     * This method binds keydown and keyup event listeners to handle object movement.
     * The .bind(this) method ensures that 'this' refers to the object object.
     */
    bindMovementKeyListners() {
        // Use stored bound handlers for add/remove
        window.addEventListener('keydown', this._boundHandleKeyDown);
        window.addEventListener('keyup', this._boundHandleKeyUp);
    }

    handleKeyDown({ keyCode }) {
        // capture the pressed key in the active keys array
        this.pressedKeys[keyCode] = true;
        // set the velocity and direction based on the newly pressed key
        this.updateVelocity();
        this.updateDirection();
        // "Up" doubles as jump under physics profiles that support it
        // (jump() itself no-ops for profiles with jumpImpulse <= 0, e.g.
        // Retro RPG, so this is harmless when jumping isn't applicable).
        if (this.physicsBody && keyCode === this.keypress.up) {
            this.physicsBody.jump();
        }
    }

    /**
     * Handles key up events to stop the player's velocity.
     * 
     * This method stops the player's velocity based on the key released.
     * 
     * @param {Object} event - The keyup event object.
     */
    handleKeyUp({ keyCode }) {
        // remove the lifted key from the active keys array
        if (keyCode in this.pressedKeys) {
            delete this.pressedKeys[keyCode];
        }
        // adjust the velocity and direction based on the remaining keys
        this.updateVelocity();
        this.updateDirection();
    }

    /**
     * Update the player's velocity and direction based on the pressed keys.
     */

    updateVelocity() {
        this.desiredVelocity.x = 0;
        this.desiredVelocity.y = 0;

        this.moved = false;

        if (this.pressedKeys[this.keypress.right] || this.pressedKeys[this.keypress.left]) {
            this.moved = true;

            if (this.pressedKeys[this.keypress.right]) {
                this.desiredVelocity.x += this.xVelocity;
            }

            else if (this.pressedKeys[this.keypress.left]) {
                this.desiredVelocity.x -= this.xVelocity;
            }
        }

        if (this.pressedKeys[this.keypress.up] || this.pressedKeys[this.keypress.down]) {
            this.moved = true;

            if (this.pressedKeys[this.keypress.up]) {
                this.desiredVelocity.y -= this.yVelocity;
            }

            else if (this.pressedKeys[this.keypress.down]) {
                this.desiredVelocity.y += this.yVelocity;
            }
        }
    }

    updateDirection() {       
        // Single-key movement
        if (this.pressedKeys[this.keypress.up]) {
            this.direction = "up";
        } else if (this.pressedKeys[this.keypress.down]) {
            this.direction = "down";
        } else if (this.pressedKeys[this.keypress.right]) {
            this.direction = "right";
        } else if (this.pressedKeys[this.keypress.left]) {
            this.direction = "left";
        }

        // Multi-key movement
        if (this.pressedKeys[this.keypress.left] && this.pressedKeys[this.keypress.up]) {
            this.direction = "upLeft";
        } else if (this.pressedKeys[this.keypress.left] && this.pressedKeys[this.keypress.down]) {
            this.direction = "downLeft";
        } else if (this.pressedKeys[this.keypress.right] && this.pressedKeys[this.keypress.up]) {
            this.direction = "upRight";
        } else if (this.pressedKeys[this.keypress.right] && this.pressedKeys[this.keypress.down]) {
            this.direction = "downRight";
        }
    }

    update() {
        // Drive the camera off this player's position, if the level opted
        // into scrolling. No-op (gameEnv.camera is null) for every level
        // that hasn't set one up.
        if (this.gameEnv.camera) {
            this.gameEnv.camera.setTarget(this.position.x, this.position.y);
        }

        if (this.physicsBody) {
            // Fully owned by the physics engine: PhysicsBody.step() (invoked
            // from Character.move(), called by super.update() below) handles
            // gravity, friction, and world-bounds response using
            // desiredVelocity (still produced by updateVelocity() above) as
            // input intent. The manual easing/gravity blocks below are the
            // legacy, non-physics path and would double-apply if both ran.
            super.update();
            return;
        }

        // Ease actual velocity toward the key-driven target instead of
        // snapping instantly (the old behavior: 0 -> full speed the instant
        // a key is pressed, full speed -> 0 the instant it's released).
        // Vertical velocity is left alone in gravity mode so this doesn't
        // fight the fall-acceleration below.
        this.velocity.x += (this.desiredVelocity.x - this.velocity.x) * this.moveEase;
        if (Math.abs(this.velocity.x) < 0.05) this.velocity.x = 0;

        if (!this.gravity) {
            this.velocity.y += (this.desiredVelocity.y - this.velocity.y) * this.moveEase;
            if (Math.abs(this.velocity.y) < 0.05) this.velocity.y = 0;
        }

        super.update();
        if(!this.moved){
            if (this.gravity) {
                    this.time += 1;
                    this.velocity.y += 0.5 + this.acceleration * this.time;
                    if (this.velocity.y > this.maxFallSpeed) {
                        this.velocity.y = this.maxFallSpeed;
                    }
                }
            }
        else{
            this.time = 0;
        }
        }
        
    /**
     * Overrides the reaction to the collision to handle
     *  - clearing the pressed keys array
     *  - stopping the player's velocity
     *  - updating the player's direction   
     * @param {*} other - The object that the player is colliding with
     */
    handleCollisionReaction(other) {
        // `other` here is the touchPoints descriptor ({id, greet, ...}), not
        // the actual GameObject — look the real instance up by id the same
        // way GameObject.handleCollisionReaction() does below, so its
        // spriteData (and any data.hazard flag) is reachable.
        const hitObject = other?.id
            ? this.gameEnv?.gameObjects?.find((obj) => obj.spriteData && obj.spriteData.id === other.id)
            : null;

        // Any object flagged data.hazard = true ends the run on touch,
        // regardless of physics mode (spikes/pits in a platformer, a trap in
        // an RPG room, etc.) — reuses the restart flag GameLevel.update()
        // already watches for (same mechanism Enemy/Shark/Goldfish/Pufferfish use).
        if (hitObject?.spriteData?.hazard && this.gameEnv?.gameControl?.currentLevel) {
            this.gameEnv.gameControl.currentLevel.restart = true;
        }

        // Do NOT clear pressed keys; keep walking animation active
        // Halt movement by zeroing velocity along collision axis

        // Avoid DOM-based push-out; rely on velocity zeroing only
            // Do NOT clear pressed keys; keep walking animation active
            // Halt movement by zeroing velocity along the touched axes; avoid DOM-based push-out
            try {
                const touchPoints = this.collisionData?.touchPoints?.this;
                if (touchPoints) {
                    // Horizontal block
                    if (touchPoints.left || touchPoints.right) {
                        this.velocity.x = 0;
                    }
                    // Vertical block
                    if (touchPoints.top || touchPoints.bottom) {
                        this.velocity.y = 0;
                    }
                }
            } catch (_) {}

        super.handleCollisionReaction(other);
    }

    /**
     * Toggle touch controls visibility (useful for debugging or user preference)
     */
    toggleTouchControls() {
        if (this.touchControls) {
            this.touchControls.toggle();
        }
    }

    /**
     * Show touch controls explicitly
     */
    showTouchControls() {
        if (this.touchControls) {
            this.touchControls.show();
        }
    }

    /**
     * Hide touch controls explicitly  
     */
    hideTouchControls() {
        if (this.touchControls) {
            this.touchControls.hide();
        }
    }

    /**
     * Show the interact button when near an NPC
     */
    showInteractButton() {
        if (this.touchControls) {
            this.touchControls.showInteractButton();
        }
    }

    /**
     * Hide the interact button when not near an NPC
     */
    hideInteractButton() {
        if (this.touchControls) {
            this.touchControls.hideInteractButton();
        }
    }

    /**
     * Check if interact button is currently visible
     */
    isInteractButtonVisible() {
        return this.touchControls ? this.touchControls.isInteractButtonVisible() : false;
    }

    /**
     * Clean up resources when player is destroyed
     */
    destroy() {
        // Remove key event listeners
        window.removeEventListener('keydown', this._boundHandleKeyDown);
        window.removeEventListener('keyup', this._boundHandleKeyUp);
        if (this.touchControls) {
            this.touchControls.destroy();
        }
        super.destroy?.();
    }


}

export default Player;