const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building React app...');

// Build the React app first
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('React app built successfully!');
    console.log('Starting Electron app...');
    
    // Start Electron with the built app
    const electronProcess = spawn('npx', ['electron', 'public/electron.cjs'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'production' }
    });
  } else {
    console.error('Build failed!');
    process.exit(1);
  }
});