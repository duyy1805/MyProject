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
const socket = io("http://27.71.231.202:3500");
const deviceHeight = Dimensions.get("window").height;

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.on("updateCount", (data) => {
      setCount(data.count);
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
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
    socket.emit("increment", { count: newCount });
  };

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
