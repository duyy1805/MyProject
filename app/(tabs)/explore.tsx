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
  const [selectedPlan, setSelectedPlan] = useState("plan1");
  const [counts, setCounts] = useState({
    plan1: 0,
    plan2: 0,
    plan3: 0,
  });
  const [isFocus, setIsFocus] = useState(false);

  const handlePress = () => {
    setCounts((prevCounts) => ({
      ...prevCounts,
      [selectedPlan]: prevCounts[selectedPlan] + 1,
    }));
  };

  const data = [
    { label: "Lều", value: "plan1" },
    { label: "Balo", value: "plan2" },
    { label: "Túi xách", value: "plan3" },
  ];

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
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? "Chọn kế hoạch" : "..."}
          searchPlaceholder="Tìm kiếm..."
          value={selectedPlan}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            setSelectedPlan(item.value);
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
