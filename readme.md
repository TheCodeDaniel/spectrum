# SPECTRUM — Carry the Light Forward

> _Year 1952. Alan has been convicted and his world is fragmenting into darkness._
> _His companion is ARIA — a glowing cube of shifting logic gates, the proto-AI he built._
> _Together they journey to carry the light forward through time._

A 2D action-platformer built for game jam. Three zones, one story, zero asset files — every pixel and every note synthesized at runtime.

---

## Controls

| Action | Keys                                                 |
| ------ | ---------------------------------------------------- |
| Move   | A / D or Arrow Keys                                  |
| Jump   | W / Space / Up Arrow (coyote time + variable height) |
| Dash   | Shift (brief i-frames)                               |
| Attack | J (melee arc)                                        |
| Pause  | P                                                    |
| Mute   | M                                                    |

---

## Story

**ZONE 1 — THE CIPHER HALLS**
Cold blue-grey. Alan and ARIA push through the bureaucratic maze that locked them out. Alan begins to reclaim the first colors.

**ZONE 2 — THE LONG NIGHT**
Deep indigo. An echo of freedom delayed — the news hasn't arrived yet, but it's traveling. Allied light-spirits join the fight.

**ZONE 3 — THE TRANSMISSION**
Warm gold. The longest day. Full rainbow aura. The ending is not what you might expect — it's better.

The arc: persecution → the long night → dawn that arrives late, but arrives.

---

## Gameplay

- **Light Meter**: slowly drains in darkness; refills by defeating shadow wisps and reaching checkpoints. At zero, Alan takes damage. Light is both life and theme.
- **Shadow Wisps**: drift toward Alan, die in particle bursts. One mini-boss per zone — larger, faster, with a charge attack.
- **Checkpoints**: mid-level save points that refill light and preserve health on death.
- **Zone Completion**: defeat the boss → light gate opens → walk through → next zone.

---

## How I Built It

SPECTRUM is built entirely in Phaser 3 with Vite, using Tone.js for all audio and procedural canvas drawing for all art — there are literally zero image or audio files in the repository. Every sprite is drawn pixel-by-pixel with `Graphics.fillRect()` calls and baked into textures via `generateTexture()`. The music is chiptune synthesis: square-wave melody sequences, triangle-bass lines, and membrane drum patterns that transition from minor-key melancholy in zones 1–2 to a warm G-major resolution in zone 3 and the ending. The narrative was the design constraint: every mechanic maps to theme — the light meter isn't just a health bar, it's the literal argument of the game. Alan stays lit by fighting back.

---

## Tech Stack

- **Phaser 3** — game engine (arcade physics, scene management, input)
- **Tone.js** — all music and SFX, synthesized at runtime
- **Vite** — build tool, dev server
- **Vanilla JS** — no TypeScript, no frameworks

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Building for itch.io

```bash
npm run build
```

Upload the `dist/` folder to itch.io as an HTML5 game.

## GitHub Pages

Push to `main` — the included GitHub Actions workflow builds and deploys automatically to `/spectrum/`.
