const root = document.getElementById('forma-root');
const select = document.getElementById('theme');
const color = matchMedia('(prefers-color-scheme: dark)');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
function update() {
  const theme = select.value;
  root.dataset.theme = theme === 'system' ? (color.matches ? 'dark' : 'light') : theme;
  root.dataset.motion = motion.matches ? 'reduce' : 'full';
}
select.addEventListener('change', update);
color.addEventListener('change', update);
motion.addEventListener('change', update);
update();
