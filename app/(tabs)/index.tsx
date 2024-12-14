import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  View,
  Dimensions,
} from "react-native";
import axios from "axios";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const deviceHeight = Dimensions.get("window").height;

interface ApiResponse {
  data: {
    itemCode: string;
  }[];
}

export default function HomeScreen(): JSX.Element {
  const [count, setCount] = useState<number>(0);
  const [itemCode, setItemCode] = useState<string>("");

  const callAPISearch = async (): Promise<ApiResponse | undefined> => {
    try {
      const response = await axios.post<ApiResponse>(
        `https://apilayoutkho.z76.vn/layoutkho/bylenhxuatbtp`,
        {
          soLenhXuatBTP: "LXBTP-2024-11-3423",
          itemCode: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  const handlePress = async (): Promise<void> => {
    setCount((prevCount) => prevCount + 1);
    const response = await callAPISearch();
    if (response && response.data.length > 0) {
      setItemCode(response.data[0].itemCode);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.titleContainer}>
        <Text style={styles.countText}>{count}</Text>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Duyệt lệnh</Text>
        </TouchableOpacity>
        <Text style={styles.itemText}>{itemCode}</Text>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#123456",
  },
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
