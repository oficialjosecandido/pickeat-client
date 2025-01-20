import { View, Text, Image } from "react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { ICONS } from "../constants";

const ApplyCoupons = ({ onApply, onCancel, coupons }) => {
  const [selectedCoupon, setSelectedCoupon] = useState("");
  return (
    <View className="bg-white rounded max-w-[80%] m-auto w-full">
      <TouchableOpacity
        onPress={onCancel}
        className="p-2 rounded-full absolute -top-3 -right-3 bg-main-1"
      >
        <Image
          style={{ tintColor: "white" }}
          source={ICONS.close}
          className="h-3 w-3"
          resizeMode="container"
        />
      </TouchableOpacity>
      <Text className="font-bold text-center py-4 border-b border-black/10">
        Choose Coupons
      </Text>
      {coupons.map((coupon, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => setSelectedCoupon(coupon._id)}
          className={`p-4 border-b border-black/10 flex-row items-center justify-between ${
            coupon._id === selectedCoupon ? "bg-main-1" : "bg-white"
          }`}
        >
          <Text className="text-center font-semibold">{coupon.code}</Text>
          <Text className="text-center font-semibold">
            {coupon.discountType === "fixed"
              ? `€${coupon.discountValue}`
              : `${coupon.discountValue}%`}
          </Text>
        </TouchableOpacity>
      ))}
      <View className="px-4 space-y-4 py-4">
        <TouchableOpacity
          onPress={() => onApply(selectedCoupon)}
          className="bg-white py-2 rounded-lg w-full border border-main-1"
        >
          <Text className="text-main-1 text-center font-semibold">Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ApplyCoupons;
