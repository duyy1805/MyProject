const http = require("http");
const socketIo = require("socket.io");

const PORT = 8080;
let currentCount = 0;

// Tạo HTTP server
const server = http.createServer();
const io = socketIo(server, {
    cors: {
        origin: "*", // Cho phép mọi nguồn truy cập (hoặc điều chỉnh tùy vào dự án)
    },
    pingTimeout: 60000, // Thời gian chờ tối đa (ms) trước khi đóng kết nối do không nhận được phản hồi
    pingInterval: 25000, // Khoảng thời gian gửi gói ping để giữ kết nối
    transports: ["websocket", "polling"],
});

console.log(`Socket.IO server is running on http://localhost:${PORT}`);

io.on("connection", (socket) => {
    console.log("A new client connected.");

    socket.emit("updateCount", { count: currentCount });

    socket.on("increment", (data) => {
        console.log("Received count from client:", data.count);

        currentCount = data.count;

        io.emit("updateCount", { count: currentCount });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected.");
    });
});

// Lắng nghe cổng
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
