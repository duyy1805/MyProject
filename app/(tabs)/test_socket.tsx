import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  View,
  Dimensions,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";

const deviceHeight = Dimensions.get("window").height;

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const [itemCode, setItemCode] = useState("");
  const [ws, setWs] = useState(null); // Lưu trữ kết nối WebSocket

  // Thiết lập WebSocket khi component mount
  useEffect(() => {
    const socket = new WebSocket("ws://192.168.8.79:8080");
    setWs(socket);

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error.message);
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    return () => {
      socket.close(); // Đóng WebSocket khi component unmount
    };
  }, []);

  // Hàm xử lý khi nhấn nút
  const handlePress = async () => {
    const newCount = count + 1;
    setCount(newCount);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "increment",
          count: newCount,
        })
      );
    } else {
      console.error("WebSocket is not open");
    }
  };

  return (
    <ThemedView style={styles.titleContainer}>
      <Text style={styles.countText}>{count}</Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Duyệt lệnh</Text>
      </TouchableOpacity>
      <Text style={styles.itemText}>{itemCode}</Text>
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
