const { spawn } = require('child_process');
const path = require('path');

// Start Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

// Wait for Vite to start then launch Electron
setTimeout(() => {
  const electronProcess = spawn('npx', ['electron', 'public/electron.js'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  electronProcess.on('close', () => {
    viteProcess.kill();
    process.exit();
  });
}, 3000);

process.on('SIGINT', () => {
  viteProcess.kill();
  process.exit();
});