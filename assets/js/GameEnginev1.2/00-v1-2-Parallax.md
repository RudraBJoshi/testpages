---
layout: opencs
title: RPG Baseline with Squares 
permalink: /gamify/parallaxv1-2
---

<div id="gameContainer">
    <div id="promptDropDown" class="promptDropDown" style="z-index: 9999"></div>
    <!-- GameEnv will create canvas dynamically -->
</div>

<script type="module">
    // Adnventure Game assets locations
    import Core from "{{site.baseurl}}/assets/js/GameEnginev1.2/essentials/Game.js";
    import GameControl from "{{site.baseurl}}/assets/js/GameEnginev1.2/essentials/GameControl.js";
    import GameLevelParallaxFish from "{{site.baseurl}}/assets/js/GameEnginev1.2/GameLevelParallaxFish.js";
    import GameLevelParallaxStairs from "{{site.baseurl}}/assets/js/GameEnginev1.2/GameLevelParallaxStairs.js";
    import { pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';

    const gameLevelClasses = [GameLevelParallaxFish, GameLevelParallaxStairs];

    // Web Server Environment data
    const environment = {
        path: "{{site.baseurl}}",
        pythonURI: pythonURI,
        javaURI: javaURI,
        fetchOptions: fetchOptions,
        gameContainer: document.getElementById("gameContainer"),
        gameLevelClasses: gameLevelClasses

    }
    // Launch Adventure Game using the central core and adventure GameControl
    Core.main(environment, GameControl);
</script>
