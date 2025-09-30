const fs = require('fs');
const path = require('path');

console.log("=========================================");
console.log("🚀 Running setup script...");
console.log("=========================================");

// Create sessions directory if it doesn't exist
const sessionsDir = process.env.SESSION_DATA_PATH || './sessions/';
console.log(`Checking sessions directory: ${sessionsDir}`);
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true, mode: 0o777 });
    console.log(`✅ Created sessions directory: ${sessionsDir}`);
} else {
    console.log(`✅ Sessions directory already exists: ${sessionsDir}`);
}

// Create the specific session directory for whatsapp-web.js
const sessionPath = path.join(sessionsDir, 'session-soulmate-bot');
console.log(`Checking session directory: ${sessionPath}`);
if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true, mode: 0o777 });
    console.log(`✅ Created session directory: ${sessionPath}`);
} else {
    console.log(`✅ Session directory already exists: ${sessionPath}`);
}

// Also create the absolute path that might be used in deployment
const absoluteSessionPath = '/app/sessions/session-soulmate-bot';
const absoluteSessionsDir = '/app/sessions';
console.log(`Checking absolute sessions directory: ${absoluteSessionsDir}`);
if (!fs.existsSync(absoluteSessionsDir)) {
    try {
        fs.mkdirSync(absoluteSessionsDir, { recursive: true, mode: 0o777 });
        console.log(`✅ Created absolute sessions directory: ${absoluteSessionsDir}`);
    } catch (err) {
        console.log(`⚠️ Could not create absolute sessions directory: ${err.message}`);
        // Try to create parent directories one by one
        try {
            fs.mkdirSync(path.dirname(absoluteSessionsDir), { recursive: true, mode: 0o777 });
            fs.mkdirSync(absoluteSessionsDir, { mode: 0o777 });
            console.log(`✅ Created absolute sessions directory (method 2): ${absoluteSessionsDir}`);
        } catch (err2) {
            console.log(`⚠️ Could not create absolute sessions directory (method 2): ${err2.message}`);
        }
    }
}
console.log(`Checking absolute session directory: ${absoluteSessionPath}`);
if (!fs.existsSync(absoluteSessionPath)) {
    try {
        fs.mkdirSync(absoluteSessionPath, { recursive: true, mode: 0o777 });
        console.log(`✅ Created absolute session directory: ${absoluteSessionPath}`);
    } catch (err) {
        console.log(`⚠️ Could not create absolute session directory: ${err.message}`);
        // Try to create parent directories one by one
        try {
            fs.mkdirSync(path.dirname(absoluteSessionPath), { recursive: true, mode: 0o777 });
            fs.mkdirSync(absoluteSessionPath, { mode: 0o777 });
            console.log(`✅ Created absolute session directory (method 2): ${absoluteSessionPath}`);
        } catch (err2) {
            console.log(`⚠️ Could not create absolute session directory (method 2): ${err2.message}`);
        }
    }
}

// Ensure the sessions directory is writable
try {
    fs.accessSync(sessionsDir, fs.constants.W_OK);
    console.log(`✅ Sessions directory is writable: ${sessionsDir}`);
} catch (err) {
    console.log(`⚠️ Sessions directory is not writable: ${sessionsDir}`);
}

console.log('✅ Setup complete!');
console.log("=========================================");