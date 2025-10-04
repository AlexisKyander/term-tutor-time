const { spawn } = require('child_process');
const http = require('http');

// Start Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

// Function to check if Vite server is ready
function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkServer = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };
    
    const retry = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for Vite server'));
        return;
      }
      setTimeout(checkServer, 500);
    };
    
    checkServer();
  });
}

// Wait for Vite to be ready then launch Electron
waitForServer('http://localhost:8080')
  .then(() => {
    console.log('Vite server is ready, launching Electron...');
    const electronProcess = spawn('npx', ['electron', 'public/electron.cjs'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' }
    });

    electronProcess.on('close', () => {
      viteProcess.kill();
      process.exit();
    });
  })
  .catch((error) => {
    console.error('Failed to start Vite server:', error);
    viteProcess.kill();
    process.exit(1);
  });

process.on('SIGINT', () => {
  viteProcess.kill();
  process.exit();
});