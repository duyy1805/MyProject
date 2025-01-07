import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Dimensions,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import io from "socket.io-client";
//27.71.231.202
const socket = io("http://192.168.8.79:3500");
const deviceHeight = Dimensions.get("window").height;

const startTime1 = new Date(0, 0, 0, 7, 30, 0); // 7:30 AM
const endTime1 = new Date(0, 0, 0, 11, 30, 0); // 12:00 PM
const startTime2 = new Date(0, 0, 0, 12, 30, 0); // 12:00 PM
const endTime2 = new Date(0, 0, 0, 16, 30, 0); // 16:30 PM
const dailyTarget = 4800; // Tổng số phút
const step = dailyTarget / 480; // Mục tiêu mỗi phút

const plan = [
  { label: "Lều", code: "KH01", numberOfPlan: 220 },
  { label: "Balo", code: "KH02", numberOfPlan: 120 },
  { label: "Túi xách", code: "KH03", numberOfPlan: 320 },
  { label: "Đèn pin", code: "KH04", numberOfPlan: 50 },
  { label: "Lều lớn", code: "KH05", numberOfPlan: 80 },
];
const dataWithIndex = plan.map((item, idx) => ({
  ...item, // Sao chép các thuộc tính hiện tại
  index: idx + 1, // Thêm trường index, bắt đầu từ 1
}));
const initialCounts = dataWithIndex.reduce((acc, item) => {
  acc[item.code] = 0; // Gán giá trị mặc định là 0
  return acc;
}, {});

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);

  const [currentTarget, setCurrentTarget] = useState(0);
  const [lastValue, setLastValue] = useState(0);
  const [nextCheckpoint, setNextCheckpoint] = useState(null);
  const [dataChart, setDataChart] = useState([]);

  //hàm chuyển đổi thời gian sang phút
  function timeInMinutes(date) {
    return date.getHours() * 60 + date.getMinutes();
  }
  // Hàm tính mốc giờ tiếp theo
  const getNextCheckpoint = (now) => {
    // Nếu trước giờ bắt đầu làm việc
    if (timeInMinutes(now) < timeInMinutes(startTime1)) {
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startTime1.getHours() + 1,
        startTime1.getMinutes(),
        0
      );
    }
    // Nếu sau giờ làm việc
    if (timeInMinutes(now) >= timeInMinutes(endTime2)) {
      return null;
    }

    // Kiểm tra xem giờ hiện tại có nằm trong khoảng làm việc không
    if (
      timeInMinutes(now) >= timeInMinutes(startTime1) &&
      timeInMinutes(now) <= timeInMinutes(endTime1)
    ) {
      // Trường hợp trước hoặc đúng XX:30
      if (now.getMinutes() < 30) {
        return new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          30,
          0
        );
      }
      // Trường hợp sau XX:30
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours() + 1,
        30,
        0
      );
    }

    if (
      timeInMinutes(now) >= timeInMinutes(startTime2) &&
      timeInMinutes(now) <= timeInMinutes(endTime2)
    ) {
      // Trường hợp trước hoặc đúng XX:30
      if (now.getMinutes() < 30) {
        return new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          30,
          0
        );
      }
      // Trường hợp sau XX:30
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours() + 1,
        30,
        0
      );
    }

    // Trường hợp giữa giờ sáng và giờ chiều
    if (
      timeInMinutes(now) > timeInMinutes(endTime1) &&
      timeInMinutes(now) < timeInMinutes(startTime2)
    ) {
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startTime2.getHours(),
        startTime2.getMinutes(),
        0
      );
    }
    return null; // Nếu không nằm trong khoảng làm việc
  };
  // Hàm tính toán mục tiêu ban đầu
  const calculateInitialTarget = () => {
    const now = new Date();
    let totalMinutes = 0;

    if (timeInMinutes(now) < timeInMinutes(startTime1)) {
      totalMinutes = 0;
    } else if (
      timeInMinutes(now) >= timeInMinutes(startTime1) &&
      timeInMinutes(now) <= timeInMinutes(endTime1)
    ) {
      totalMinutes = timeInMinutes(now) - timeInMinutes(startTime1);
    } else if (
      timeInMinutes(now) > timeInMinutes(endTime1) &&
      timeInMinutes(now) < timeInMinutes(startTime2)
    ) {
      totalMinutes = timeInMinutes(endTime1) - timeInMinutes(startTime1);
    } else if (
      timeInMinutes(now) >= timeInMinutes(startTime2) &&
      timeInMinutes(now) <= timeInMinutes(endTime2)
    ) {
      totalMinutes =
        timeInMinutes(endTime1) -
        timeInMinutes(startTime1) +
        (timeInMinutes(now) - timeInMinutes(startTime2));
    } else {
      totalMinutes = 480;
    }
    const target = Math.min(step * totalMinutes, dailyTarget);
    setCurrentTarget(target);
  };
  useEffect(() => {
    setNextCheckpoint(getNextCheckpoint(new Date()));
    socket.on("updateCount", (data) => {
      setCount(data.count);
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
    });
    socket.on("connect", () => {
      console.log("Connected to server.");
      // Nếu cần, gửi lại trạng thái hoặc thực hiện hành động cần thiết
    });
    socket.on("error", (err) => {
      console.log(err.message);
    });
    socket.on("disconnect", (reason) => {
      console.log(`Disconnected from server. Reason: ${reason}`);
    });
    return () => socket.disconnect();
  }, []);

  const handlePress = () => {
    const newCount = count + 1;
    setCount(newCount);

    const now = new Date();
    calculateInitialTarget();

    socket.emit("increment", { count: newCount });
  };
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (nextCheckpoint && now >= nextCheckpoint) {
        // Cập nhật logic
        const currentValue = count; // Giá trị giả định
        const difference = currentValue - lastValue;

        console.log(`Checkpoint: ${nextCheckpoint}, Difference: ${difference}`);
        const updatedDataChart = [
          ...dataChart,
          {
            Time: nextCheckpoint.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            Value: difference,
          },
        ];
        setDataChart((prevData) => [
          ...prevData,
          {
            Time: nextCheckpoint.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            Value: difference,
          },
        ]);
        socket.emit("sendChart", { chart: updatedDataChart });
        setLastValue(currentValue);
        setNextCheckpoint(getNextCheckpoint(now));
      } else {
        console.log("Not yet reached the next checkpoint");
        console.log("current value ", count);
      }
    }, 5 * 60000); // 1 phút kiểm tra một lần
    socket.emit("sendChart", { chart: dataChart });
    console.log("Next checkpoint: ", nextCheckpoint);
    console.log("data chart: ", dataChart);
    return () => clearInterval(timer);
  }, [nextCheckpoint, count]);

  return (
    <ThemedView style={styles.titleContainer}>
      <Text style={styles.countText}>{count}</Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Duyệt lệnh</Text>
      </TouchableOpacity>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {`Connected: ${socket.connected}`}
        </Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: "center",
    gap: 8,
    height: deviceHeight,
    backgroundColor: "#123456",
  },
  button: {
    backgroundColor: "#2ebe7c",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: 150,
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  countText: {
    fontSize: 100,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 100,
  },
  statusContainer: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
  statusText: {
    color: "#000",
    fontSize: 12,
    textAlign: "center",
  },
});
