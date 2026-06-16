import * as Tone from 'tone';

let ready = false;
let muted = false;
let currentZone = 0;

// Instruments
let melody, bass, drum, pad;
let jumpSfx, dashSfx, hitSfx, gateSfx, checkSfx, dieSfx;
let currentSeq = null;
let bassSeq = null;
let drumSeq = null;
let masterVol;

export async function initAudio() {
  if (ready) return;
  await Tone.start();

  masterVol = new Tone.Volume(-4).toDestination();
  const reverb = new Tone.Reverb({ decay: 1.2, wet: 0.15 }).connect(masterVol);

  // Melody synth — chiptune square
  melody = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.08, sustain: 0.35, release: 0.15 },
  }).connect(reverb);
  melody.volume.value = -14;

  // Bass synth
  bass = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
  }).connect(masterVol);
  bass.volume.value = -16;

  // Drum — membrane
  drum = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
  }).connect(masterVol);
  drum.volume.value = -20;

  // Pad synth for zone 3
  pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.4, decay: 0.3, sustain: 0.6, release: 1.2 },
  }).connect(reverb);
  pad.volume.value = -22;

  // ── SFX synths ─────────────────────────────────────────────────────────────
  jumpSfx = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
  }).toDestination();
  jumpSfx.volume.value = -18;

  dashSfx = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 },
  }).toDestination();
  dashSfx.volume.value = -20;

  hitSfx = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 },
  }).toDestination();
  hitSfx.volume.value = -22;

  gateSfx = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.05, decay: 0.5, sustain: 0.3, release: 0.8 },
  }).toDestination();
  gateSfx.volume.value = -16;

  checkSfx = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.4 },
  }).toDestination();
  checkSfx.volume.value = -18;

  dieSfx = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.05, release: 0.2 },
  }).toDestination();
  dieSfx.volume.value = -18;

  Tone.Transport.bpm.value = 108;
  ready = true;
}

export function setMuted(val) {
  muted = val;
  if (masterVol) masterVol.volume.value = val ? -Infinity : -4;
}

export function getMuted() { return muted; }

function stopMusic() {
  if (currentSeq) { currentSeq.stop(); currentSeq.dispose(); currentSeq = null; }
  if (bassSeq) { bassSeq.stop(); bassSeq.dispose(); bassSeq = null; }
  if (drumSeq) { drumSeq.stop(); drumSeq.dispose(); drumSeq = null; }
}

export function playZoneMusic(zone) {
  if (!ready) return;
  if (currentZone === zone) return;
  currentZone = zone;
  stopMusic();
  Tone.Transport.stop();

  if (zone === 1) playZone1Music();
  else if (zone === 2) playZone2Music();
  else if (zone === 3) playZone3Music();

  Tone.Transport.start();
}

export function playTitleMusic() {
  if (!ready) return;
  stopMusic();
  currentZone = 0;
  Tone.Transport.stop();

  // Simple atmospheric minor arp
  const notes = ['C2', null, 'Eb2', null, 'G2', null, 'Bb2', null];
  currentSeq = new Tone.Sequence((time, note) => {
    if (note) bass.triggerAttackRelease(note, '8n', time);
  }, notes, '4n');
  currentSeq.start(0);
  Tone.Transport.bpm.value = 80;
  Tone.Transport.start();
}

// ── Zone 1 — Cm, melancholic chiptune ─────────────────────────────────────────
function playZone1Music() {
  Tone.Transport.bpm.value = 108;

  // Melody: Cm natural minor
  const mel = [
    'C4', null, 'Eb4', 'G4', null, 'Bb3', 'G3', null,
    'Ab3', null, 'G3', 'F3', null, 'Eb3', null, null,
  ];
  currentSeq = new Tone.Sequence((time, n) => {
    if (n) melody.triggerAttackRelease(n, '8n', time);
  }, mel, '8n');
  currentSeq.start(0);

  // Bass
  const bline = ['C2', null, null, 'C2', 'G2', null, null, null];
  bassSeq = new Tone.Sequence((time, n) => {
    if (n) bass.triggerAttackRelease(n, '8n', time);
  }, bline, '8n');
  bassSeq.start(0);

  // Kick pattern
  const kicks = [1, 0, 0, 0, 1, 0, 0, 0];
  drumSeq = new Tone.Sequence((time, hit) => {
    if (hit) drum.triggerAttackRelease('C1', '8n', time);
  }, kicks, '8n');
  drumSeq.start(0);
}

// ── Zone 2 — Dm, deeper indigo ────────────────────────────────────────────────
function playZone2Music() {
  Tone.Transport.bpm.value = 116;

  const mel = [
    'D4', null, 'F4', 'A4', null, 'C4', 'A3', null,
    'Bb3', null, 'A3', 'G3', null, 'F3', null, 'D3',
  ];
  currentSeq = new Tone.Sequence((time, n) => {
    if (n) melody.triggerAttackRelease(n, '8n', time);
  }, mel, '8n');
  currentSeq.start(0);

  const bline = ['D2', null, null, 'D2', 'A2', null, 'C2', null];
  bassSeq = new Tone.Sequence((time, n) => {
    if (n) bass.triggerAttackRelease(n, '8n', time);
  }, bline, '8n');
  bassSeq.start(0);

  const kicks = [1, 0, 0, 1, 0, 0, 1, 0];
  drumSeq = new Tone.Sequence((time, hit) => {
    if (hit) drum.triggerAttackRelease('C1', '16n', time);
  }, kicks, '8n');
  drumSeq.start(0);
}

// ── Zone 3 — G major, triumphant ─────────────────────────────────────────────
function playZone3Music() {
  Tone.Transport.bpm.value = 132;

  const mel = [
    'G4', 'A4', 'B4', 'D5', null, 'B4', 'A4', 'G4',
    'E4', null, 'G4', 'A4', 'B4', null, 'D5', null,
  ];
  currentSeq = new Tone.Sequence((time, n) => {
    if (n) melody.triggerAttackRelease(n, '16n', time);
  }, mel, '16n');
  currentSeq.start(0);

  const bline = ['G2', null, 'D2', null, 'E2', null, 'C2', null];
  bassSeq = new Tone.Sequence((time, n) => {
    if (n) bass.triggerAttackRelease(n, '8n', time);
  }, bline, '8n');
  bassSeq.start(0);

  // Pad chords for warmth
  const chords = [['G3', 'B3', 'D4'], null, null, null, ['E3', 'G3', 'B3'], null, null, null];
  const padSeq = new Tone.Sequence((time, c) => {
    if (c) pad.triggerAttackRelease(c, '2n', time);
  }, chords, '4n');
  padSeq.start(0);

  const kicks = [1, 0, 1, 0, 1, 0, 1, 1];
  drumSeq = new Tone.Sequence((time, hit) => {
    if (hit) drum.triggerAttackRelease('C1', '16n', time);
  }, kicks, '8n');
  drumSeq.start(0);
}

// ── SFX ───────────────────────────────────────────────────────────────────────
export function sfxJump() {
  if (!ready || muted) return;
  jumpSfx.triggerAttackRelease('G4', '32n', Tone.now());
  jumpSfx.triggerAttackRelease('C5', '32n', Tone.now() + 0.05);
}

export function sfxDash() {
  if (!ready || muted) return;
  dashSfx.triggerAttackRelease('A3', '16n', Tone.now());
}

export function sfxHit() {
  if (!ready || muted) return;
  hitSfx.triggerAttackRelease('16n', Tone.now());
}

export function sfxEnemyDie() {
  if (!ready || muted) return;
  hitSfx.triggerAttackRelease('8n', Tone.now());
}

export function sfxGateOpen() {
  if (!ready || muted) return;
  const now = Tone.now();
  gateSfx.triggerAttackRelease('C4', '4n', now);
  gateSfx.triggerAttackRelease('G4', '4n', now + 0.2);
  gateSfx.triggerAttackRelease('C5', '2n', now + 0.4);
}

export function sfxCheckpoint() {
  if (!ready || muted) return;
  const now = Tone.now();
  checkSfx.triggerAttackRelease('E4', '8n', now);
  checkSfx.triggerAttackRelease('G4', '8n', now + 0.1);
  checkSfx.triggerAttackRelease('C5', '4n', now + 0.2);
}

export function sfxDie() {
  if (!ready || muted) return;
  dieSfx.triggerAttackRelease('4n', Tone.now());
}

export function sfxDialogue() {
  if (!ready || muted) return;
  jumpSfx.triggerAttackRelease('D5', '64n', Tone.now());
}

export function stopAll() {
  stopMusic();
  if (Tone.Transport.state === 'started') Tone.Transport.stop();
  currentZone = 0;
}
