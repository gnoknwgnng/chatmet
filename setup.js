const fs = require('fs');
const path = require('path');

// Create sessions directory if it doesn't exist
const sessionsDir = process.env.SESSION_DATA_PATH || './sessions/';
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
    console.log(`Created sessions directory: ${sessionsDir}`);
} else {
    console.log(`Sessions directory already exists: ${sessionsDir}`);
}

console.log('Setup complete!');