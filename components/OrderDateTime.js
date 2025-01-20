import { View, Text, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { useModal } from "../context/ModalContext";
import OrderType from "./OrderType";
import Loader from "./Loader";
import { useData } from "../context/DataContext";

const getTimezoneOffsetInMinutes = () => new Date().getTimezoneOffset();

// Convert a UTC time slot to the user's local time
const convertToUserTimezone = (slot) => {
  const timezoneOffset = getTimezoneOffsetInMinutes(); // Get timezone offset
  const slotDate = moment.utc(slot, "HH:mm"); // Parse the slot in UTC

  // Convert the time by applying the user's local timezone offset
  return slotDate.add(-timezoneOffset, "minutes").format("HH:mm");
};

const OrderDateTime = ({ restaurants, stadiumId }) => {
  const { setBottomSheetVisible, setBottomSheetContent } = useModal();
  const { getAvailableSlots } = useData();

  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState(0);
  const [slots, setSlots] = useState([]);

  const nextStep = () => {
    setBottomSheetContent(
      <OrderType
        onBack={onBack}
        stadiumId={stadiumId}
        timeSlot={slots[selectedTime]}
      />
    );
    setBottomSheetVisible(true);
  };

  const onBack = () => {
    setBottomSheetContent(
      <OrderDateTime restaurants={restaurants} stadiumId={stadiumId} />
    );
    setBottomSheetVisible(true);
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      console.log("Fetching slots for restaurants:", restaurants); // Add this
      const slots = await getAvailableSlots(restaurants);
      console.log("Received slots:", slots); // Add this
      const localizedSlots = slots.map((slot) => convertToUserTimezone(slot));
      console.log("Localized slots:", localizedSlots); // Add this
      setSlots(localizedSlots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  return (
    <View className="bg-white border-t border-black/10 px-2 flex-1">
      <Text className="text-lg font-semibold py-4 mb-4 text-center border-b border-black/10">
        Select Date
      </Text>
      {loading ? (
        <View className="py-4">
          <Loader />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="w-full flex-1 max-h-96"
        >
          {(slots || []).map((time, index) => (
            <TouchableOpacity
              onPress={() => setSelectedTime(index)}
              key={index}
              className={`py-4 px-3 rounded-full shadow-sm border border-black/10 my-2 items-center justify-center ${
                Platform.OS === "ios" ? "shadow-black/10" : "shadow-black"
              } ${selectedTime === index ? "bg-[#ec7d55]" : "bg-white"}`}
            >
              <Text
                className={`text-xs  font-semibold ${
                  selectedTime === index ? "text-white" : "text-black"
                }`}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
          {slots.length < 3 &&
            Array.from({ length: 3 }).map((_, i) => (
              <View key={i} className="h-10" />
            ))}
        </ScrollView>
      )}
      <TouchableOpacity
        onPress={nextStep}
        className="p-4 bg-main-1 rounded-full mb-4 mt-4"
      >
        <Text className="text-center font-semibold text-white">Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderDateTime;
