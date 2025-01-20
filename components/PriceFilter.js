import { View, Text } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { THEME } from "../constants";
import { useState } from "react";

const PriceFilter = ({ max, min, filter, setFilter }) => {
  const [priceRange, setPriceRange] = useState([min, max]);
  return (
    <View className="py-4 items-center justify-center">
      <View className="flex-row justify-between w-full px-2">
        <View className="flex-row items-center">
          <Text className="font-semibold">€</Text>
          <Text
            className="font-semibold"
            style={{
              marginLeft: 5,
            }}
          >
            {priceRange[0]}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="font-semibold">€</Text>
          <Text
            className="font-semibold"
            style={{
              marginLeft: 5,
            }}
          >
            {priceRange[1]}
          </Text>
        </View>
      </View>
      <MultiSlider
        onBlur={() => console.log("blur")}
        values={[min, max]}
        sliderLength={THEME.screenWidth - 40}
        onValuesChange={(values) => setPriceRange(values)}
        onValuesChangeFinish={(values) =>
          setFilter((prev) => ({
            ...prev,
            price: values,
          }))
        }
        min={min}
        max={max}
        step={1}
        allowOverlap
        snapped
        selectedStyle={{
          backgroundColor: "#000",
        }}
        unselectedStyle={{
          backgroundColor: "#D4D4D4",
        }}
        containerStyle={{
          height: 40,
        }}
        trackStyle={{
          height: 2,
        }}
        markerStyle={{
          height: 15,
          width: 15,
          marginTop: 1,
          borderRadius: 0,
          backgroundColor: "#000",
        }}
      />
    </View>
  );
};

export default PriceFilter;
