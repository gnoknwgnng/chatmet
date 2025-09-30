const fs = require('fs');
const path = require('path');

// Create sessions directory if it doesn't exist
const sessionsDir = process.env.SESSION_DATA_PATH || './sessions/';
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true, mode: 0o755 });
    console.log(`Created sessions directory: ${sessionsDir}`);
} else {
    console.log(`Sessions directory already exists: ${sessionsDir}`);
}

// Create the specific session directory for whatsapp-web.js
const sessionPath = path.join(sessionsDir, 'session-soulmate-bot');
if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true, mode: 0o755 });
    console.log(`Created session directory: ${sessionPath}`);
} else {
    console.log(`Session directory already exists: ${sessionPath}`);
}

// Also create the absolute path that might be used in deployment
const absoluteSessionPath = '/app/sessions/session-soulmate-bot';
const absoluteSessionsDir = '/app/sessions';
if (!fs.existsSync(absoluteSessionsDir)) {
    try {
        fs.mkdirSync(absoluteSessionsDir, { recursive: true, mode: 0o755 });
        console.log(`Created absolute sessions directory: ${absoluteSessionsDir}`);
    } catch (err) {
        console.log(`Could not create absolute sessions directory: ${err.message}`);
    }
}
if (!fs.existsSync(absoluteSessionPath)) {
    try {
        fs.mkdirSync(absoluteSessionPath, { recursive: true, mode: 0o755 });
        console.log(`Created absolute session directory: ${absoluteSessionPath}`);
    } catch (err) {
        console.log(`Could not create absolute session directory: ${err.message}`);
    }
}

console.log('Setup complete!');