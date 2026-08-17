/**
 * HitboxAnalyzer - derives a tighter "rigid body" hitbox from a sprite's
 * actual pixels instead of a hand-picked widthPercentage/heightPercentage.
 *
 * Output is intentionally shaped to match the hitbox schema GameObject
 * already understands ({ widthPercentage, heightPercentage, radiusPercentage
 * }) — no changes to the collision math itself, just a way to derive better
 * numbers automatically instead of hand-tuning them per sprite.
 *
 * Two "solid vs. background" tests are combined ("color theory" in the
 * practical sense: distinguishing figure from ground by both transparency
 * and hue/luminance distance):
 *  1. Alpha: pixels below alphaThreshold are treated as background. Handles
 *     sprites exported with real transparency.
 *  2. Color distance from a detected background color (sampled from the
 *     frame's four corners, which are background in the overwhelming
 *     majority of sprite art): pixels within colorThreshold of that color
 *     are also treated as background. Handles sprites exported as flat,
 *     fully-opaque images against a solid backdrop (no alpha channel at all).
 *
 * The existing hitbox schema only supports a *symmetric* reduction from each
 * side, so an off-center silhouette can't be fit perfectly — this takes the
 * smaller of each axis's two margins so the box never clips outside the
 * actual sprite, which is the safe direction to be imprecise in for
 * collision purposes.
 */

const DEFAULTS = {
    alphaThreshold: 10,     // 0-255; pixels with alpha <= this are background
    colorThreshold: 28,     // Euclidean RGB distance; below this counts as background
    minRadiusPercentage: 0.28,
    maxRadiusPercentage: 0.5,
    fallback: { widthPercentage: 0.2, heightPercentage: 0.2, radiusPercentage: 0.5 },
};

function colorDistance(r1, g1, b1, r2, g2, b2) {
    const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Analyze one rectangular frame of pixel data and return hitbox percentages.
 * @param {ImageData} imageData - from ctx.getImageData() over the frame
 * @param {Object} options - override any DEFAULTS field
 * @returns {{widthPercentage:number, heightPercentage:number, radiusPercentage:number}}
 */
export function analyzeImageData(imageData, options = {}) {
    const opts = { ...DEFAULTS, ...options };
    const { width, height, data } = imageData;

    if (width < 2 || height < 2) {
        return { ...opts.fallback };
    }

    // Sample the four corners to estimate the background color, for sprites
    // with no real alpha channel (a flat, fully-opaque background fill).
    const corner = (x, y) => {
        const i = (y * width + x) * 4;
        return [data[i], data[i + 1], data[i + 2]];
    };
    const corners = [corner(0, 0), corner(width - 1, 0), corner(0, height - 1), corner(width - 1, height - 1)];
    const bg = [
        corners.reduce((s, c) => s + c[0], 0) / 4,
        corners.reduce((s, c) => s + c[1], 0) / 4,
        corners.reduce((s, c) => s + c[2], 0) / 4,
    ];

    let minX = width, maxX = -1, minY = height, maxY = -1;
    let solidPixelCount = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const a = data[i + 3];
            if (a <= opts.alphaThreshold) continue; // transparent -> background

            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (colorDistance(r, g, b, bg[0], bg[1], bg[2]) <= opts.colorThreshold) continue; // matches bg -> background

            solidPixelCount++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }

    if (maxX < minX || maxY < minY || solidPixelCount === 0) {
        // Nothing distinguishable from the background (fully transparent
        // frame, or a flat-color placeholder) — fall back to a sane default
        // rather than producing a zero-size or inverted hitbox.
        return { ...opts.fallback };
    }

    // Symmetric reduction: use the smaller margin on each axis so the
    // resulting box never excludes part of the actual silhouette.
    const leftMargin = minX;
    const rightMargin = width - 1 - maxX;
    const topMargin = minY;
    const bottomMargin = height - 1 - maxY;

    const widthPercentage = Math.max(0, Math.min(0.85, (2 * Math.min(leftMargin, rightMargin)) / width));
    const heightPercentage = Math.max(0, Math.min(0.85, (2 * Math.min(topMargin, bottomMargin)) / height));

    // Fit a circle's area to the actual solid-pixel coverage of the (now
    // tightened) bounding box, so a thin/sparse silhouette (e.g. a stick
    // figure) gets a smaller relative radius than a solid blob does.
    const boxWidth = Math.max(1, maxX - minX + 1);
    const boxHeight = Math.max(1, maxY - minY + 1);
    const fillRatio = solidPixelCount / (boxWidth * boxHeight);
    const impliedRadius = Math.sqrt((fillRatio * boxWidth * boxHeight) / Math.PI);
    const radiusPercentage = Math.max(
        opts.minRadiusPercentage,
        Math.min(opts.maxRadiusPercentage, impliedRadius / Math.min(boxWidth, boxHeight))
    );

    return { widthPercentage, heightPercentage, radiusPercentage };
}

/**
 * Analyze a single frame region of a loaded sprite sheet Image and return
 * hitbox percentages. Draws just that frame to a small offscreen canvas
 * (cheap — this runs once per sprite load, not per rendered frame).
 * @param {HTMLImageElement} image - loaded sprite sheet
 * @param {{sx:number, sy:number, sWidth:number, sHeight:number}} frameRect - source rect within the sheet
 * @param {Object} options - see DEFAULTS
 * @returns {{widthPercentage:number, heightPercentage:number, radiusPercentage:number}}
 */
export function analyzeSpriteFrame(image, frameRect, options = {}) {
    try {
        const { sx, sy, sWidth, sHeight } = frameRect;
        if (!image || !sWidth || !sHeight) return { ...DEFAULTS.fallback, ...options.fallback };

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(sWidth));
        canvas.height = Math.max(1, Math.round(sHeight));
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return analyzeImageData(imageData, options);
    } catch (err) {
        // Most likely a tainted canvas (cross-origin image without CORS
        // headers) — fail soft to the standard hitbox rather than breaking
        // the game.
        console.warn('HitboxAnalyzer: falling back to default hitbox —', err.message);
        return { ...DEFAULTS.fallback, ...options.fallback };
    }
}

/**
 * Pick a representative frame (the sprite's "down"/idle-facing pose, frame
 * 0) from Character-style spriteData and analyze it. Mirrors the frame-slice
 * math in Character.drawSprite() so the analyzed region matches what
 * actually renders.
 * @param {HTMLImageElement} image - loaded sprite sheet
 * @param {Object} spriteData - same shape Character uses (pixels, orientation, down/left/right/up, ...)
 * @param {Object} options - see DEFAULTS
 */
export function computeRigidBodyHitbox(image, spriteData, options = {}) {
    const pixels = spriteData?.pixels || { width: image?.naturalWidth || 0, height: image?.naturalHeight || 0 };
    const orientation = spriteData?.orientation || { rows: 1, columns: 1 };
    const frameWidth = Math.max(1, Math.round(pixels.width / (orientation.columns || 1)));
    const frameHeight = Math.max(1, Math.round(pixels.height / (orientation.rows || 1)));

    const directionData = spriteData?.down || {};
    const frameX = (directionData.start || 0) * frameWidth;
    const frameY = (directionData.row || 0) * frameHeight;

    return analyzeSpriteFrame(image, { sx: frameX, sy: frameY, sWidth: frameWidth, sHeight: frameHeight }, options);
}

export default { analyzeImageData, analyzeSpriteFrame, computeRigidBodyHitbox };
