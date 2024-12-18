import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  View,
  Dimensions,
} from "react-native";
// android:usesCleartextTraffic="true"
import { ThemedView } from "@/components/ThemedView";
import io from "socket.io-client";
import { stringify } from "flatted";
//27.71.231.202
const socket = io("http://27.71.231.202:8080");
const deviceHeight = Dimensions.get("window").height;

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.on("updateCount", (data) => {
      console.log("Soket", socket);
      setCount(data.count);
    });

    // Lắng nghe lỗi từ socket
    socket.on("connect_error", (err) => {
      setError(err.message); // Lưu thông báo lỗi
    });

    socket.on("error", (err) => {
      console.log(err.message);
    });

    return () => socket.disconnect();
  }, []);

  // Hàm xử lý khi nhấn nút
  const handlePress = () => {
    const newCount = count + 1; // Tính toán giá trị count mới
    setCount(newCount); // Cập nhật giá trị count ở phía client
    // Gửi giá trị mới lên server
    socket.emit("increment", { count: newCount });
  };

  return (
    <ThemedView style={styles.titleContainer}>
      <Text style={styles.countText}>{count}</Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Duyệt lệnh</Text>
      </TouchableOpacity>
      <View style={{ padding: 10, backgroundColor: "#ddd", borderRadius: 5 }}>
        <Text style={{ color: "#000", fontSize: 12, textAlign: "center" }}>
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
  itemText: {
    fontSize: 40,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 100,
  },
});
