import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Dimensions,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";

const deviceHeight = Dimensions.get("window").height;

export default function HomeScreen() {
  const data = [
    { label: "Lều", code: "KH01", numberOfPlan: 220 },
    { label: "Balo", code: "KH02", numberOfPlan: 120 },
    { label: "Túi xách", code: "KH03", numberOfPlan: 320 },
    { label: "Đèn pin", code: "KH04", numberOfPlan: 50 },
    { label: "Lều lớn", code: "KH05", numberOfPlan: 80 },
  ];
  const dataWithIndex = data.map((item, idx) => ({
    ...item, // Sao chép các thuộc tính hiện tại
    index: idx + 1, // Thêm trường index, bắt đầu từ 1
  }));
  const initialCounts = dataWithIndex.reduce((acc, item) => {
    acc[item.code] = 0; // Gán giá trị mặc định là 0
    return acc;
  }, {});

  const [selectedPlan, setSelectedPlan] = useState("KH01");
  const [counts, setCounts] = useState(initialCounts);
  const [isFocus, setIsFocus] = useState(false);

  const handlePress = () => {
    setCounts((prevCounts) => ({
      ...prevCounts,
      [selectedPlan]: prevCounts[selectedPlan] + 1,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.countText}>{counts[selectedPlan]}</Text>
      <View
        style={{
          backgroundColor: "#FFF",
          // padding: 15,
          borderRadius: 10,
        }}
      >
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
          // search
          maxHeight={300}
          labelField="label"
          valueField="code"
          placeholder={!isFocus ? "Chọn kế hoạch" : "..."}
          searchPlaceholder="Tìm kiếm..."
          value={selectedPlan}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            setSelectedPlan(item.code);
            setIsFocus(false);
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={styles.icon}
              color={isFocus ? "blue" : "black"}
              name="Safety"
              size={20}
            />
          )}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Duyệt lệnh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    // height: deviceHeight,
    backgroundColor: "#123456",
    flex: 1,
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
  },
  dropdown: {
    width: 250,
    height: 50,
    padding: 15,
    borderRadius: 5,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
});
