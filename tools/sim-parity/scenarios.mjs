// What the golden check replays. Each scenario runs the whole timeline (131 s at 1x) at a fixed 100 ms step.
export const DT_MS = 100;
export const FRAMES = 1360;
export const GL_EVERY = 20;   // 3D canvas read back every 2 s of sim time (exact gate)
export const SHOT_EVERY = 40; // full-page screenshot every 4 s (for review; compositor timing makes it inexact)
export const VIEWPORT = { width: 960, height: 600, deviceScaleFactor: 1 };

// Reordered phases, a switched-off built-in phase, a custom phase with every motion pattern, and an equipment switched off.
const custom = {
  equipment: { items: { painter: { on: false } } },
  phases: [
    { id: 'alert' }, { id: 'assess' }, { id: 'debris' },
    { id: 'custom-1', on: true, title: '추가 단계', real: 10, dur: 12, crew: 3, m: '진행', goal: '', steps: [], equip: [],
      anim: { acts: [{ k: 'loader', pattern: 'pass', reps: 2 }, { k: 'dump', pattern: 'loop', reps: 1 }, { k: 'roller', pattern: 'cross', reps: 2 }, { k: 'sweeper', pattern: 'standby' }],
        crew: { count: 3, pattern: 'patrol', label: '보조 요원', vest: '#33aaff' }, dust: true } },
    { id: 'cut' }, { id: 'excavate' }, { id: 'backfill' }, { id: 'compact', on: false }, { id: 'pour' }, { id: 'fod' }, { id: 'cure' }, { id: 'mark' },
  ],
};

export const SCENARIOS = [
  { name: 'small', query: '?size=small' },
  { name: 'medium' },
  { name: 'large', query: '?size=large' },
  { name: 'medium-low', storage: { 'radr.q': '"low"' } },
  { name: 'custom', storage: { 'radr.cfg': JSON.stringify(custom) } },
];
