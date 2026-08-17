// To build GameLevels, each contains GameObjects from below imports
import BackgroundParallax from './essentials/BackgroundParallax.js';
import GameEnvBackground from './essentials/GameEnvBackground.js';

class GameLevelParallaxStairs {
  constructor(gameEnv) {
    let width = gameEnv.innerWidth;
    let height = gameEnv.innerHeight;
    let path = gameEnv.path;

    const image_src_stairs = path + "/images/mansionGame/stairs_lvl3.png";
    const image_data_stairs = {
        name: 'stairs',
        greeting: "Never ending stairs, leading to unknown depths.",
        src: image_src_stairs,
        velocity: { x: 0, y: 0.3 },  // Vertical scrolling downward
        scaleToFit: 'width',  // Scale image to fit screen width, tile vertically for scrolling
    }; 

    // List of objects defnitions for this level
    this.classes = [
      { class: GameEnvBackground, data: {} },
      { class: BackgroundParallax, data: image_data_stairs },
    ];
  }

}

export default GameLevelParallaxStairs;