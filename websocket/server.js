const http = require("http");
const socketIo = require("socket.io");

const PORT = 8080;
let currentCount = 0;

// Tạo HTTP server
const server = http.createServer();
const io = socketIo(server, {
    cors: {
        origin: "*",  // Cho phép tất cả các nguồn kết nối (có thể thay bằng một địa chỉ cụ thể nếu cần)
    },
});

console.log(`Socket.IO server is running on http://localhost:${PORT}`);

io.on("connection", (socket) => {
    console.log("A new client connected.");

    socket.emit("updateCount", { count: currentCount });

    socket.on("increment", (data) => {
        // Kiểm tra nếu `data` là chuỗi, thì parse nó
        const parsedData = typeof data === "string" ? JSON.parse(data) : data;

        console.log("Received count from client:", parsedData);

        // Cập nhật giá trị count
        currentCount = parsedData.count;

        // Phát lại sự kiện `updateCount` tới tất cả client
        io.emit("updateCount", { count: currentCount });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected.");
    });
});

// Hàm đặt lại giá trị count về 0
function resetCount() {
    currentCount = 0;
    io.emit("updateCount", { count: currentCount }); // Cập nhật cho tất cả client
    console.log("Count has been reset to 0 at midnight.");
}

// Tính thời gian đến 0h sáng hôm sau
function scheduleMidnightReset() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeToMidnight = midnight - now;

    // Đặt timeout để reset lần đầu
    setTimeout(() => {
        resetCount();

        // Sau đó, đặt interval để reset mỗi ngày
        setInterval(resetCount, 24 * 60 * 60 * 1000); // 24 giờ
    }, timeToMidnight);
}

// Lập lịch đặt lại count
scheduleMidnightReset();


server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
