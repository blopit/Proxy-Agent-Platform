// build.js - A script to run Next.js build when other methods fail
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Debug info
console.log('Current working directory:', process.cwd());
console.log('Node version:', process.version);
console.log('Directory contents:', fs.readdirSync('.'));

// Try to find next binary
const possibleNextBinLocations = [
  path.join(process.cwd(), 'node_modules', '.bin', 'next'),
  path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next'),
  require.resolve('next/dist/bin/next')
];

let nextBinPath;
for (const location of possibleNextBinLocations) {
  try {
    if (fs.existsSync(location)) {
      nextBinPath = location;
      console.log('Found Next.js binary at:', nextBinPath);
      break;
    }
  } catch (err) {
    console.log('Error checking location:', location, err);
  }
}

if (!nextBinPath) {
  console.error('Could not find Next.js binary. Installing Next.js...');
  // If we can't find next, try to install it
  const installProcess = spawn('npm', ['install', 'next@14.0.4', '--no-save'], {
    stdio: 'inherit',
    shell: true
  });
  
  installProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`npm install exited with code ${code}`);
      process.exit(code);
    }
    // Try to find the binary again
    for (const location of possibleNextBinLocations) {
      try {
        if (fs.existsSync(location)) {
          nextBinPath = location;
          console.log('Found Next.js binary after installation at:', nextBinPath);
          runBuild(nextBinPath);
          break;
        }
      } catch (err) {}
    }
    
    if (!nextBinPath) {
      console.error('Still could not find Next.js binary after installation. Exiting.');
      process.exit(1);
    }
  });
} else {
  runBuild(nextBinPath);
}

function runBuild(binPath) {
  console.log('Starting build with binary:', binPath);
  
  // Set environment variables
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  
  // Run the Next.js build command
  const buildProcess = spawn('node', [binPath, 'build'], {
    stdio: 'inherit',
    shell: true
  });
  
  buildProcess.on('close', (code) => {
    console.log(`Build process exited with code ${code}`);
    process.exit(code);
  });
} 