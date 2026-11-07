import { copyFile, mkdir, writeFile } from 'node:fs/promises';
const primitive = {
  white: '#ffffff',
  gray50: '#f7f8fa',
  gray100: '#eef0f3',
  gray200: '#dce0e6',
  gray500: '#586577',
  gray700: '#344054',
  gray900: '#1b2330',
  blue600: '#2459cf',
  blue400: '#83aaff',
};
const light = {
  canvas: '{primitive.gray50}',
  surface: '{primitive.white}',
  subtle: '{primitive.gray100}',
  text: '{primitive.gray900}',
  muted: '{primitive.gray500}',
  border: '{primitive.gray200}',
  brand: '{primitive.blue600}',
  onBrand: '#ffffff',
  brandSubtle: '#edf2ff',
  brandHover: '#1f4db5',
  brandPressed: '#1a4096',
  surfaceHover: '#eef0f3',
  surfacePressed: '#e2e6ec',
  controlBorder: '#7c8797',
  danger: '#ba3039',
  dangerSubtle: '#fff0f0',
  success: '#21744a',
  successSubtle: '#edf8f1',
  warning: '#855b0b',
  warningSubtle: '#fff6df',
  focus: '#2459cf',
};
const dark = {
  canvas: '#14171c',
  surface: '#1c2027',
  subtle: '#262c35',
  text: '#eef1f6',
  muted: '#a5afbf',
  border: '#3d4654',
  brand: '{primitive.blue400}',
  onBrand: '#102044',
  brandSubtle: '#222f4b',
  brandHover: '#9abaff',
  brandPressed: '#b5cdff',
  surfaceHover: '#2b323d',
  surfacePressed: '#343e4b',
  controlBorder: '#7c899b',
  danger: '#ff969c',
  dangerSubtle: '#3e252c',
  success: '#86d4a8',
  successSubtle: '#20382c',
  warning: '#edcb7e',
  warningSubtle: '#3c3321',
  focus: '#a8c2ff',
};
const component = {
  buttonBackground: '{semantic.brand}',
  buttonForeground: '{semantic.onBrand}',
  inputBackground: '{semantic.surface}',
  inputBorder: '{semantic.controlBorder}',
};
const spacing = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
const radius = { small: 4, medium: 6, large: 8 };
const typography = { caption: 12, body: 14, website: 16, section: 20, heading: 28, display: 40 };
const weight = { regular: 400, medium: 500, semibold: 600 };
const tracking = { normal: '0em', overline: '0.08em' };
const motion = {
  durationMs: 120,
  duration: { fast: 120, standard: 180, deliberate: 240, loading: 1400, spin: 800 },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    enter: 'cubic-bezier(0, 0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  distance: { small: 4, medium: 8 },
};
const font =
  '"IBM Plex Sans JP",-apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic","Hiragino Kaku Gothic ProN",Meiryo,sans-serif';
const dimensions = [
  ...spacing.map((n) => `--f-space-${n}:${n}px;`),
  ...Object.entries(radius).map(([name, n]) => `--f-radius-${name}:${n}px;`),
  ...Object.entries(typography).map(([name, n]) => `--f-font-${name}:${n}px;`),
  ...Object.entries(weight).map(([name, n]) => `--f-weight-${name}:${n};`),
  ...Object.entries(tracking).map(([name, n]) => `--f-tracking-${name}:${n};`),
  '--f-motion-duration:120ms;',
  ...Object.entries(motion.duration).map(([name, n]) => `--f-motion-${name}:${n}ms;`),
  ...Object.entries(motion.easing).map(([name, value]) => `--f-ease-${name}:${value};`),
  ...Object.entries(motion.distance).map(([name, n]) => `--f-motion-distance-${name}:${n}px;`),
].join('\n');
const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
const val = (v) =>
  v.replace(/\{(?:primitive|semantic)\.([^}]+)\}/g, (_, k) => `var(--f-${kebab(k)})`);
const block = (o) =>
  Object.entries(o)
    .map(([k, v]) => `  --f-${kebab(k)}: ${val(v)};`)
    .join('\n');
await mkdir(new URL('./dist', import.meta.url), { recursive: true });
await writeFile(
  new URL('./dist/tokens.json', import.meta.url),
  JSON.stringify(
    {
      primitive,
      semantic: { light, dark },
      component,
      spacing,
      radius,
      typography: { family: font, size: typography, weight, tracking },
      motion,
    },
    null,
    2,
  ),
);
await writeFile(
  new URL('./dist/tokens.css', import.meta.url),
  `/*! Forma — MIT License. See LICENSE. */\n:root, [data-theme="light"] {\n${block(primitive)}\n${block(light)}\n${block(component)}\n${dimensions}\n--f-radius:var(--f-radius-medium); --f-control-height:40px; --f-font:${font};\n}\n[data-theme="dark"] {\n${block(dark)}\n${block(component)}\ncolor-scheme:dark;\n}\n[data-density="comfortable"] {--f-control-height:40px;}\n[data-density="compact"] {--f-control-height:32px;}\n`,
);
await copyFile(new URL('../../LICENSE', import.meta.url), new URL('./LICENSE', import.meta.url));
