'use strict';
// Builds the deliverables from the raw recording (demo/blue-carbon-demo.webm) and the markers
// written by record-demo.cjs (demo/.run/marks.json):
//   blue-carbon-demo.mp4         1280x720 H.264 (+ silent AAC track), faststart, long typing/transition stretches sped up
//   blue-carbon-demo-square.mp4  1080x1080: the 16:9 video centred on a dark background with a title
//   blue-carbon-demo-short.mp4   30-45 s highlight (submit -> approve/mint -> buy -> result)
//   demo-preview.gif             ~15 s, 800 px wide, for the README
//   chapters.txt                 timestamps (in the final mp4) for the LinkedIn post / video description
// Usage: node demo/edit-videos.cjs
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const RUN = path.join(DIR, '.run');
const RAW = path.join(DIR, 'blue-carbon-demo.webm');
const marks = JSON.parse(fs.readFileSync(path.join(RUN, 'marks.json'), 'utf8'));
const T = (name) => {
  const m = marks.find((x) => x.note === name || x.subtitle === name || (x.subtitle || '').startsWith(name));
  if (!m) throw new Error('marker not found: ' + name);
  return m.t;
};
const stepStart = (n) => marks.find((m) => m.step === n && m.subtitle && m.subtitle.startsWith('Step')).t;
const END = marks.find((m) => m.subtitle === 'END').t;

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const probeDuration = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f]).toString());
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ---- 1. main edit: [start, end, speed] in raw-recording seconds ------------------------------
const segments = [
  [0, stepStart(3), 1],                         // title card, home, role choice
  [stepStart(3), stepStart(4), 1.5],            // NGO login + connect
  [stepStart(4), stepStart(5), 2],              // typing the project form
  [stepStart(5), stepStart(7), 1],              // photo, submit, screening result
  [stepStart(7), stepStart(8), 1.5],            // auditor login + connect
  [stepStart(8), stepStart(10), 1],             // review + approve + mint hash
  [stepStart(10), stepStart(11), 1.4],          // NGO balance
  [stepStart(11), stepStart(12), 1],            // approve marketplace
  [stepStart(12), stepStart(13), 1.4],          // company login + marketplace
  [stepStart(13), END, 1],                      // buy, result, end card
];
const rawToFinal = (t) => {
  let acc = 0;
  for (const [a, b, sp] of segments) {
    if (t <= a) return acc;
    if (t < b) return acc + (t - a) / sp;
    acc += (b - a) / sp;
  }
  return acc;
};

const filter = segments
  .map(([a, b, sp], i) => `[0:v]trim=start=${a.toFixed(3)}:end=${b.toFixed(3)},setpts=(PTS-STARTPTS)/${sp},fps=30[v${i}]`)
  .concat([`${segments.map((_, i) => `[v${i}]`).join('')}concat=n=${segments.length}:v=1:a=0,format=yuv420p[v]`])
  .join(';');
const MAIN = path.join(DIR, 'blue-carbon-demo.mp4');
ff(['-i', RAW, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-filter_complex', filter, '-map', '[v]', '-map', '1:a',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', MAIN]);

// ---- 2. chapters (timestamps in the final mp4) -----------------------------------------------
const chapterRows = [['Title card', 0]];
for (const m of marks) {
  if (m.step >= 1 && m.subtitle && m.subtitle.startsWith('Step')) chapterRows.push([m.subtitle.replace(/^Step (\d+) – /, 'Step $1 – '), rawToFinal(m.t)]);
}
chapterRows.push(['End card: tech stack and repo', rawToFinal(T('end-card'))]);
fs.writeFileSync(path.join(DIR, 'chapters.txt'), chapterRows.map(([n, t]) => `${mmss(t)} ${n}`).join('\n') + '\n');

// ---- 3. square 1080x1080 ----------------------------------------------------------------------
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  await page.setContent(`<body style="margin:0;width:1080px;height:1080px;background:transparent;font-family:-apple-system,'Segoe UI',sans-serif;color:#fff">
    <div style="position:absolute;top:58px;left:0;right:0;text-align:center">
      <div style="font-size:60px;font-weight:700">Blue Carbon Registry</div>
      <div style="font-size:27px;color:#9bd5e8;margin-top:14px">Transparent carbon credits on Ethereum<br>NGO → Auditor → Company</div>
    </div>
    <div style="position:absolute;top:900px;left:0;right:0;text-align:center">
      <div style="font-size:26px;font-family:ui-monospace,Menlo,monospace;color:#7dd3fc">github.com/08pranav/Blue-Carbon-Registry-blockchain</div>
      <div style="font-size:18px;opacity:.6;margin-top:12px">Demo on a local test chain with a stand-in wallet</div>
    </div></body>`);
  await page.screenshot({ path: path.join(RUN, 'square-overlay.png'), omitBackground: true });
  await browser.close();

  ff(['-i', MAIN, '-loop', '1', '-i', path.join(RUN, 'square-overlay.png'),
    '-filter_complex', '[0:v]scale=1080:608[v];color=c=0x071a2a:s=1080x1080:r=30[bg];[bg][v]overlay=0:(H-h)/2+10:shortest=1[a];[a][1:v]overlay=0:0:shortest=1,format=yuv420p[out]',
    '-map', '[out]', '-map', '0:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart',
    path.join(DIR, 'blue-carbon-demo-square.mp4')]);

  // ---- 4. short highlight (raw seconds, natural speed) -----------------------------------------
  const shortSegs = [
    [T('click: submit') - 1.0, T('dialog: project submitted') + 6.5],   // submit + screening result
    [T('click: approve') + 0.4, T('dialog: credits issued') + 7.0],     // approve, mint hash
    [T('type: quantity') - 0.3, T('dialog: trade complete') + 4.5],     // buy
    [T('result'), T('result') + 12.5],                                  // balances
  ];
  const sf = shortSegs.map(([a, b], i) => `[0:v]trim=start=${a.toFixed(3)}:end=${b.toFixed(3)},setpts=PTS-STARTPTS,fps=30[s${i}]`)
    .concat([`${shortSegs.map((_, i) => `[s${i}]`).join('')}concat=n=${shortSegs.length}:v=1:a=0,format=yuv420p[v]`]).join(';');
  const SHORT = path.join(DIR, 'blue-carbon-demo-short.mp4');
  ff(['-i', RAW, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-filter_complex', sf, '-map', '[v]', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', SHORT]);

  // ---- 5. preview GIF (~15 s, 800 px) ---------------------------------------------------------
  const gifSegs = [
    [T('dialog: project submitted') + 0.2, 3.3],
    [T('dialog: credits issued') + 0.2, 3.3],
    [T('dialog: trade complete') + 0.2, 3.3],
    [T('result') + 1.0, 4.0],
  ];
  const gf = gifSegs.map(([a, d], i) => `[0:v]trim=start=${a.toFixed(3)}:end=${(a + d).toFixed(3)},setpts=PTS-STARTPTS,fps=10,scale=800:-1:flags=lanczos[g${i}]`)
    .concat([`${gifSegs.map((_, i) => `[g${i}]`).join('')}concat=n=${gifSegs.length}:v=1:a=0,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4[out]`]).join(';');
  ff(['-i', RAW, '-filter_complex', gf, '-map', '[out]', '-loop', '0', path.join(DIR, 'demo-preview.gif')]);

  for (const f of ['blue-carbon-demo.webm', 'blue-carbon-demo.mp4', 'blue-carbon-demo-square.mp4', 'blue-carbon-demo-short.mp4', 'demo-preview.gif']) {
    const p = path.join(DIR, f);
    console.log(f.padEnd(32), `${probeDuration(p).toFixed(1)} s`.padStart(9), `${(fs.statSync(p).size / 1048576).toFixed(2)} MB`.padStart(10));
  }
})().catch((e) => { console.error('EDIT ERROR:', e.message); process.exit(1); });
