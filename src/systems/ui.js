// Crisp DOM-based UI text.
//
// The game canvas is 480×270 and CSS-upscaled ~7× with nearest-neighbor, which
// turns any small in-canvas text to mush. DOM elements are rendered by the
// browser as vector fonts at the FINAL on-screen size, so they stay razor sharp
// at any scale while the pixel-art sprites keep their crunchy look.

const FONT = '"Orbitron", "Segoe UI", system-ui, sans-serif';
const MONO = '"DejaVu Sans Mono", "Consolas", "Menlo", monospace';

/**
 * Create a crisp DOM text object positioned in game coordinates.
 * Returns a Phaser.GameObjects.DOMElement (supports setText / setVisible / tweens).
 */
export function uiText(scene, x, y, text, opts = {}) {
  const {
    size = 9,
    color = '#ffffff',
    weight = 400,
    align = 'center',
    spacing = 0,
    width = 0,           // 0 = no wrap (nowrap); >0 = wrap at this game-unit width
    glow = 0,            // glow radius in px (0 = none)
    stroke = 0,          // outline thickness in px (0 = none)
    origin = 0.5,        // number or { x, y }
    depth = 250,
    scrollFactor = 0,
    lineHeight = 1.4,
    mono = false,
  } = opts;

  let css =
    `font-family:${mono ? MONO : FONT};` +
    `font-size:${size}px;` +
    `font-weight:${weight};` +
    `color:${color};` +
    `text-align:${align};` +
    `letter-spacing:${spacing}px;` +
    `line-height:${lineHeight};` +
    `margin:0;padding:0;` +
    `pointer-events:none;` +
    `-webkit-font-smoothing:antialiased;` +
    `text-rendering:geometricPrecision;` +
    `user-select:none;`;

  css += width ? `width:${width}px;white-space:normal;` : `white-space:nowrap;`;

  const shadows = [];
  if (glow) shadows.push(`0 0 ${glow}px ${color}`);
  if (stroke) {
    // Cheap outline via 4 offset shadows
    const s = stroke;
    shadows.push(`${s}px 0 0 #000`, `-${s}px 0 0 #000`, `0 ${s}px 0 #000`, `0 -${s}px 0 #000`);
  }
  if (shadows.length) css += `text-shadow:${shadows.join(',')};`;

  const el = scene.add.dom(x, y, 'div', css, text);
  const ox = typeof origin === 'number' ? origin : origin.x;
  const oy = typeof origin === 'number' ? origin : origin.y;
  el.setOrigin(ox, oy);
  el.setDepth(depth);
  el.setScrollFactor(scrollFactor);
  return el;
}
