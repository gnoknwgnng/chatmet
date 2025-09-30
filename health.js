// Simple health check server
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    } else if (req.url === '/qr') {
        const qrFile = path.join(__dirname, 'qr.txt');
        if (fs.existsSync(qrFile)) {
            const qrData = fs.readFileSync(qrFile, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Scan this QR code with your WhatsApp app:\n\n${qrData}`);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('QR code not available yet. Please check the application logs.');
        }
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
        <html>
        <head><title>Soulmate Bot</title></head>
        <body>
            <h1>🤖 Soulmate Bot is running!</h1>
            <p><a href="/qr">Click here to view the WhatsApp QR code</a></p>
            <p>If the link above doesn't work, check the application logs for the QR code.</p>
            <p><a href="/health">Health Check</a></p>
        </body>
        </html>
        `);
    }
});

server.listen(port, () => {
    console.log(`Health check server running on port ${port}`);
    console.log(`Visit http://localhost:${port} to access the bot interface`);
    console.log(`Visit http://localhost:${port}/qr to view the WhatsApp QR code`);
});