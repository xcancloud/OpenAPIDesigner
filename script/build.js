const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function resolve (p) {
  return path.join(__dirname, p);
}

async function start() {
  execSync('vite build --config core/vite.config.ts', { stdio: 'inherit' });
  fs.writeFileSync(resolve(`../assets/style.js`), '', 'utf8');
  const styleList = [];
  const files = fs.readdirSync(resolve('../coredist'));
  files.forEach((file) => {
    console.log(file)
    if (file.endsWith('.css')) {
      console.log(true);
      let cssText = fs.readFileSync(resolve(`../coredist/${file}`), 'utf8');
      cssText = cssText.replaceAll('\\\/', '\\\\\/');
      cssText = cssText.replaceAll(' \\9', '');
      cssText = cssText.replaceAll('content:"\\', 'content:"\\\\');
      cssText = cssText.replaceAll('content:\'\\', 'content:\'\\\\');
      if (cssText.startsWith('.CodeMirror')) {
        cssText = cssText.replaceAll('\/', '\\\/');
      }
      
      fs.appendFileSync(resolve(`../assets/style.js`), `const styleText${styleList.length} = \`${cssText}\`; \n`, 'utf8');
      styleList.push(`styleText${styleList.length}`);
    }
  });
  fs.appendFileSync(resolve(`../assets/style.js`), `const styleList = [${styleList.join(', ')}]; \nexport default styleList;\n`, 'utf8');
  
  fs.rmSync(resolve('../coredist'),  { recursive: true, force: true });
  execSync('vite build');
}

start();