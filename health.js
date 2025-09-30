// Simple health check server
const http = require('http');
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Soulmate Bot is running!\nCheck the logs for the QR code to connect WhatsApp.');
    }
});

server.listen(port, () => {
    console.log(`Health check server running on port ${port}`);
});