---
layout: opencs
title: Physics Engine Demo (Realistic / Retro Platformer / Retro RPG)
permalink: /gamify/physicsdemo
---

<div id="gameContainer">
    <div id="promptDropDown" class="promptDropDown" style="z-index: 9999"></div>
    <!-- GameEnv will create canvas dynamically -->
</div>

<p style="position: fixed; bottom: 12px; left: 12px; z-index: 1000; color: #fff; background: rgba(20,20,30,0.6); padding: 6px 10px; border-radius: 4px; font-family: sans-serif; font-size: 12px;">
    WASD to move &middot; W to jump (Realistic / Retro Platformer) &middot; buttons top-right switch physics mode live
</p>

<script type="module">
    import Core from "{{site.baseurl}}/assets/js/GameEnginev1.2/essentials/Game.js";
    import GameControl from "{{site.baseurl}}/assets/js/GameEnginev1.2/essentials/GameControl.js";
    import GameLevelPhysicsDemo from "{{site.baseurl}}/assets/js/GameEnginev1.2/GameLevelPhysicsDemo.js";
    import { pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';

    const gameLevelClasses = [GameLevelPhysicsDemo];

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
