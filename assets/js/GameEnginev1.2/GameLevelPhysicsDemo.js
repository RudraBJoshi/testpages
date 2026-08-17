// GameLevelPhysicsDemo - one scrolling world, one Player, 3 live-switchable
// physics profiles (Realistic / Retro Platformer / Retro RPG). See
// essentials/PhysicsProfiles.js and essentials/PhysicsBody.js for the engine
// itself; this file is just a level built to show it off.
import GameEnvBackground from './essentials/GameEnvBackground.js';
import BackgroundParallax from './essentials/BackgroundParallax.js';
import Player from './essentials/Player.js';
import Barrier from './essentials/Barrier.js';
import Camera from './essentials/Camera.js';
import PhysicsBody from './essentials/PhysicsBody.js';
import { resolvePhysicsProfile } from './essentials/PhysicsProfiles.js';

const WORLD_WIDTH = 3200;
const WORLD_HEIGHT = 900;
const GROUND_Y = 800;
const GROUND_HEIGHT = 100;

const MODE_LABELS = {
    realistic: 'Realistic',
    retroPlatformer: 'Retro Platformer',
    retroRpg: 'Retro RPG',
};

// Mode-specific spawn points (world space) — Platformer/Realistic spawn over
// the ground to fall onto it; RPG spawns mid-world since it has no gravity.
const SPAWN_POINTS = {
    realistic: { x: 100, y: 600 },
    retroPlatformer: { x: 100, y: 600 },
    retroRpg: { x: 1600, y: 400 },
};

// Persisted at module scope (not on the level instance) so that a hazard- or
// pit-triggered restart — which tears down and reconstructs this whole level
// via GameControl.transitionToLevel() — respawns in the same mode the user
// had selected, instead of silently resetting to Realistic every death.
let lastSelectedMode = 'realistic';

class GameLevelPhysicsDemo {
    constructor(gameEnv) {
        this.gameEnv = gameEnv;
        this.currentMode = lastSelectedMode;
        const path = gameEnv.path;

        // Ground with two gaps (pits) to jump over in Realistic/Platformer.
        const groundSegments = [
            { x: 0, width: 850 },
            { x: 950, width: 900 },   // gap: 850-950
            { x: 2000, width: WORLD_WIDTH - 2000 }, // gap: 1850-2000
        ];
        const groundClasses = groundSegments.map(seg => ({
            class: Barrier,
            data: { x: seg.x, y: GROUND_Y, width: seg.width, height: GROUND_HEIGHT, color: 'rgba(92, 64, 44, 0.9)' },
        }));

        // Raised platforms — jump targets in Realistic/Platformer, just
        // walls to route around in RPG (no gravity means no "landing on").
        const platformClasses = [
            { x: 1150, y: 620, width: 220 },
            { x: 2250, y: 560, width: 220 },
            { x: 2650, y: 430, width: 220 },
        ].map(p => ({
            class: Barrier,
            data: { x: p.x, y: p.y, width: p.width, height: 28, color: 'rgba(70, 120, 80, 0.9)' },
        }));

        // Hazards — data.hazard triggers Player.handleCollisionReaction's
        // generic restart-on-touch path, in any mode.
        const hazardClasses = [1400, 2450].map((x, i) => ({
            class: Barrier,
            // Explicit id matters here: Player.handleCollisionReaction looks
            // up the collided object by spriteData.id, which Barrier only
            // gets from data.id (falls back to a random per-instance id
            // otherwise, which would never match the lookup).
            data: { id: `hazard-${i}`, x, y: GROUND_Y - 26, width: 50, height: 26, color: 'rgba(210, 40, 40, 0.9)', hazard: true },
        }));

        // Thin ceiling so the world reads as an enclosed space (matters most
        // for Retro RPG, which has no gravity to keep the player "down").
        const ceilingClass = {
            class: Barrier,
            data: { x: 0, y: 0, width: WORLD_WIDTH, height: 24, color: 'rgba(40, 40, 60, 0.5)' },
        };

        this.classes = [
            { class: GameEnvBackground, data: {} },
            { class: BackgroundParallax, data: {
                src: `${path}/images/platformer/backgrounds/mountains.jpg`,
                opacity: '0.55',
                parallaxFactor: 0.3,
                scaleToFit: 'height',
                velocity: { x: 0, y: 0 },
            } },
            ...groundClasses,
            ...platformClasses,
            ...hazardClasses,
            ceilingClass,
            { class: Player, data: this._playerData(this.currentMode) },
        ];
    }

    _playerData(mode) {
        const spawn = SPAWN_POINTS[mode];
        return {
            id: 'physicsDemoPlayer',
            INIT_POSITION: { x: spawn.x, y: spawn.y },
            physics: mode,
            fillStyle: '#f5a623',
            keypress: { up: 87, left: 65, down: 83, right: 68, interact: 69 },
        };
    }

    initialize() {
        this.gameEnv.levelBounds = { width: WORLD_WIDTH, height: WORLD_HEIGHT };
        const spawn = SPAWN_POINTS[this.currentMode];
        this.gameEnv.camera = new Camera(spawn.x, spawn.y, spawn.x, spawn.y);

        this.player = this.gameEnv.gameObjects.find((o) => o instanceof Player) || null;

        this._buildModeSwitcherUI();
    }

    /**
     * Swap the live physics profile without reloading the level: rebuild the
     * player's PhysicsBody, reset it to that mode's spawn point, and clear
     * any pending restart so a leftover hazard/pit trigger from the previous
     * mode doesn't immediately fire.
     */
    setMode(mode) {
        if (!this.player || !SPAWN_POINTS[mode] || mode === this.currentMode) return;
        this.currentMode = mode;
        lastSelectedMode = mode;

        this.player.physicsBody = new PhysicsBody(this.player, resolvePhysicsProfile(mode));

        const spawn = SPAWN_POINTS[mode];
        this.player.position.x = spawn.x;
        this.player.position.y = spawn.y;
        this.player.velocity.x = 0;
        this.player.velocity.y = 0;

        if (this.gameEnv.gameControl && this.gameEnv.gameControl.currentLevel) {
            this.gameEnv.gameControl.currentLevel.restart = false;
        }

        if (this.gameEnv.camera) {
            this.gameEnv.camera.x = spawn.x;
            this.gameEnv.camera.y = spawn.y;
            this.gameEnv.camera.setTarget(spawn.x, spawn.y);
        }

        this._highlightActiveButton();
    }

    _buildModeSwitcherUI() {
        const container = document.createElement('div');
        container.id = 'physicsDemoModeSwitcher';
        container.innerHTML = `
            <style>
                #physicsDemoModeSwitcher {
                    position: fixed;
                    top: 12px;
                    right: 12px;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    align-items: flex-end;
                    font-family: sans-serif;
                }
                #physicsDemoModeSwitcher .physics-mode-btn {
                    padding: 8px 14px;
                    border-radius: 6px;
                    border: 2px solid rgba(255,255,255,0.25);
                    background: rgba(20, 20, 30, 0.75);
                    color: #fff;
                    font-size: 13px;
                    font-weight: bold;
                    cursor: pointer;
                }
                #physicsDemoModeSwitcher .physics-mode-btn.active {
                    background: rgba(245, 166, 35, 0.9);
                    border-color: #fff;
                    color: #201400;
                }
                #physicsDemoModeSwitcher .physics-mode-label {
                    background: rgba(20, 20, 30, 0.6);
                    color: #fff;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                }
            </style>
            <div class="physics-mode-label">Physics: <span id="physicsDemoModeLabel"></span></div>
            <button class="physics-mode-btn" data-mode="realistic">Realistic</button>
            <button class="physics-mode-btn" data-mode="retroPlatformer">Retro Platformer</button>
            <button class="physics-mode-btn" data-mode="retroRpg">Retro RPG</button>
        `;
        document.body.appendChild(container);
        this._uiContainer = container;

        container.querySelectorAll('.physics-mode-btn').forEach((btn) => {
            btn.addEventListener('click', () => this.setMode(btn.dataset.mode));
        });

        this._highlightActiveButton();
    }

    _highlightActiveButton() {
        if (!this._uiContainer) return;
        this._uiContainer.querySelectorAll('.physics-mode-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.mode === this.currentMode);
        });
        const label = this._uiContainer.querySelector('#physicsDemoModeLabel');
        if (label) label.textContent = MODE_LABELS[this.currentMode] || this.currentMode;
    }

    destroy() {
        if (this._uiContainer && this._uiContainer.parentNode) {
            this._uiContainer.parentNode.removeChild(this._uiContainer);
        }
        this._uiContainer = null;
    }
}

export default GameLevelPhysicsDemo;
