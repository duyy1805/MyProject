import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Dimensions,
  Picker,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const initialCounts = plan.reduce((acc, item) => {
  acc[item.code] = {
    count: 0,
    dailyTarget: item.numberOfPlan,
    currentTarget: 0,
    lastValue: 0,
    dataChart: [],
  };
  return acc;
}, {});

export default function HomeScreen() {
  const [selectedPlan, setSelectedPlan] = useState(plan[0].code);
  const [counts, setCounts] = useState(initialCounts);
  const [error, setError] = useState(null);
  const [nextCheckpoint, setNextCheckpoint] = useState(null);

  const saveCountsToStorage = async (countsToSave) => {
    const today = new Date().toISOString().split("T")[0]; // Lấy ngày hiện tại dưới dạng YYYY-MM-DD
    try {
      await AsyncStorage.setItem(
        "counts",
        JSON.stringify({ date: today, counts: countsToSave })
      );
    } catch (error) {
      console.error("Failed to save counts:", error);
    }
  };

  const loadCountsFromStorage = async () => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const storedData = await AsyncStorage.getItem("counts");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.date === today) {
          setCounts(parsedData.counts); // Khôi phục dữ liệu nếu ngày trùng khớp
        }
      }
    } catch (error) {
      console.error("Failed to load counts:", error);
    } // Trả về giá trị mặc định nếu không có dữ liệu hoặc ngày không trùng
  };

  function timeInMinutes(date) {
    return date.getHours() * 60 + date.getMinutes();
  }
  const getNextCheckpoint = (now) => {
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
    if (timeInMinutes(now) >= timeInMinutes(endTime2)) {
      return null;
    }

    if (
      timeInMinutes(now) >= timeInMinutes(startTime1) &&
      timeInMinutes(now) <= timeInMinutes(endTime1)
    ) {
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
    return null;
  };

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
    const updatedCounts = { ...counts }; // Tạo bản sao của counts hiện tại
    plan.forEach((item) => {
      const target = (item.numberOfPlan / 480) * totalMinutes;

      updatedCounts[item.code] = {
        ...updatedCounts[item.code],
        currentTarget: target,
      };
    });
    setCounts(updatedCounts);
    socket.emit("sendChart", { counts: updatedCounts });
  };

  useEffect(() => {
    loadCountsFromStorage();
    calculateInitialTarget();
    setNextCheckpoint(getNextCheckpoint(new Date()));
    // socket.on("updateCount", (data) => {
    //   setCounts((prevCounts) => ({
    //     ...prevCounts,
    //     [data.plan]: {
    //       ...prevCounts[data.plan],
    //       count: data.count,
    //     },
    //   }));
    // });

    socket.on("connect_error", (err) => {
      setError(err.message);
    });

    socket.on("connect", () => {
      console.log("Connected to server.");
    });

    socket.on("error", (err) => {
      console.log(err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Disconnected from server. Reason: ${reason}`);
    });

    return () => socket.disconnect();
  }, []);

  const handlePress = async () => {
    const newCount = counts[selectedPlan].count + 1;
    const updatedCounts = { ...counts };

    updatedCounts[selectedPlan] = {
      ...updatedCounts[selectedPlan],
      count: newCount,
    };

    console.log("Updated counts:", updatedCounts);
    console.log("CheckPoint", nextCheckpoint);
    setCounts(updatedCounts);

    try {
      await saveCountsToStorage(updatedCounts); // Lưu dữ liệu vào AsyncStorage
      socket.emit("increment", { counts: updatedCounts }); // Gửi dữ liệu qua socket
      console.log("Counts saved successfully.");
    } catch (error) {
      console.error("Failed to save counts:", error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (nextCheckpoint && now >= nextCheckpoint) {
        const updatedCounts = { ...counts }; // Tạo bản sao của counts hiện tại

        // Lặp qua tất cả các kế hoạch để tính toán
        plan.forEach((item) => {
          const currentValue = updatedCounts[item.code].count;
          const difference = currentValue - updatedCounts[item.code].lastValue;

          console.log(
            `Checkpoint: ${nextCheckpoint}, Plan: ${item.label}, Difference: ${difference}`
          );

          const updatedDataChart = [
            ...updatedCounts[item.code].dataChart,
            {
              Time: nextCheckpoint.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              Value: difference,
            },
          ];

          updatedCounts[item.code] = {
            ...updatedCounts[item.code],
            dataChart: updatedDataChart,
            lastValue: currentValue,
          };
        });
        socket.emit("sendChart", { counts: updatedCounts });
        // Cập nhật lại counts sau khi tính toán cho tất cả kế hoạch
        setCounts(updatedCounts);
        setNextCheckpoint(getNextCheckpoint(now));
      } else {
        console.log("Not yet reached the next checkpoint");
        // plan.forEach((item) => {
        //   console.log(
        //     `Plan: ${item.label}, current value: ${counts[item.code].count}`
        //   );
        // });
      }
    }, 2 * 60000);

    return () => clearInterval(timer);
  }, [nextCheckpoint, counts]);

  return (
    <ThemedView style={styles.titleContainer}>
      <Text style={styles.countText}>{counts[selectedPlan].count}</Text>

      {/* Picker for selecting a plan */}
      <Picker
        selectedValue={selectedPlan}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedPlan(itemValue)}
      >
        {plan.map((item) => (
          <Picker.Item key={item.code} label={item.label} value={item.code} />
        ))}
      </Picker>

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
  picker: {
    height: 50,
    width: 200,
    marginVertical: 10,
    borderRadius: 6,
  },
});
