import { View, Text } from "react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import PriceFilter from "./PriceFilter";

const MenuFilter = () => {
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("Rating");
  const [price, setPrice] = useState([0, 50]);
  return (
    <View className="px-2">
      <View className="flex-row items-center py-3 border-b border-black/10">
        <TouchableOpacity className="px-2 py-1">
          <Text className="font-semibold">Reset</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold flex-1 text-center">Filter</Text>
        <TouchableOpacity className="px-2 py-1">
          <Text className="font-semibold text-main-1">Done</Text>
        </TouchableOpacity>
      </View>
      <Text className="py-3 font-semibold text-black/70">Categories</Text>
      <View className="flex-row flex-wrap">
        {["All", "Burgers", "Pizza", "Sushi", "Drinks", "Desserts"].map(
          (category, index) => (
            <TouchableOpacity
              onPress={() => {
                if (categories.includes(category)) {
                  setCategories(categories.filter((c) => c !== category));
                } else {
                  setCategories([...categories, category]);
                }
              }}
              key={index}
              className={`px-3 py-1 border rounded-full mr-2 mb-2 ${
                categories.includes(category)
                  ? "border-main-1"
                  : "border-black/10 text-black"
              }`}
            >
              <Text
                className={`
                ${categories.includes(category) ? "text-main-1" : "text-black"}
                `}
              >
                {category}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
      <Text className="py-3 font-semibold text-black/70">Sort By</Text>
      <View className="border-t border-black/20">
        {["Rating", "Price", "Delivery Time"].map((sort, index) => (
          <TouchableOpacity
            key={index}
            className={`px-3 py-2 border-b border-black/20 py-2 flex-row items-center justify-between`}
            onPress={() => setSortBy(sort)}
          >
            <Text
              className={`font-semibold
                ${sortBy === sort ? "text-main-1" : "text-black"}
                `}
            >
              {sort}
            </Text>
            {sortBy === sort && <Text className="text-main-1">✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
      <PriceFilter
        max={50}
        min={0}
        filter={{ price }}
        setFilter={(prev) => ({ ...prev, price })}
      />
    </View>
  );
};

export default MenuFilter;
