const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function resolve (p) {
  return path.join(__dirname, p);
}

function start() {
  execSync('vite build --config core/vite.config.ts', { stdio: 'inherit' });
  let cssText = fs.readFileSync(resolve(`../coredist/index.css`), 'utf8');
  cssText = cssText.replaceAll('\\', '');
  fs.writeFileSync(resolve(`../assets/style.js`), `const styleText = \`${cssText}\`; export default styleText`, 'utf8');
  fs.rmSync(resolve('../coredist'),  { recursive: true, force: true });
  execSync('vite build');
}

start();