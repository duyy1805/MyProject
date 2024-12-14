const WebSocket = require('ws');

const PORT = 8080; // Port chạy WebSocket server
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket Server is running on ws://localhost:${PORT}`);

let currentCount = 0;

wss.on('connection', (ws) => {
    console.log('A new client connected.');

    // Gửi số đếm hiện tại cho client khi kết nối
    ws.send(JSON.stringify({ count: currentCount }));

    // Nhận thông tin từ client
    ws.on('message', (message) => {

        const data = JSON.parse(message);
        console.log('Received:', data);
        if (data.type === 'increment') {
            currentCount = data.count;
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ count: currentCount }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});
