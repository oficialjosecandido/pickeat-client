import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-native-phone-number-input";
import { ICONS } from "../constants";
import { useModal } from "../context/ModalContext";

const ChangePhoneNumber = () => {
  const [countryCode, setCountryCode] = useState(39);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { setShowModal, setModalContent } = useModal();

  const closeBottomSheet = () => {
    setShowModal(false);
    setModalContent(null);
  };

  useEffect(() => {
    return () => {
      setCountryCode(39);
      setPhoneNumber("");
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="p-4 rounded-lg bg-white border border-black/20 w-[90%] mx-auto">
        <TouchableOpacity
          onPress={closeBottomSheet}
          className="p-2 absolute left-2 top-4 z-10"
        >
          <Image
            source={ICONS.back}
            className="h-4 w-4"
            resizeMode="container"
          />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-center">
          Enter your phone number
        </Text>
        <Text className="text-xs font-light text-center mt-2">
          We will send you confirmation code
        </Text>
        <View className="border border-black/20 self-start mx-auto my-4 w-full">
          <PhoneInput
            containerStyle={{ width: "100%" }}
            onChangeCountry={(country) => {
              setCountryCode(country.callingCode[0]);
            }}
            defaultCode="IT"
            layout="first"
            onChangeText={(text) => {
              setPhoneNumber(text);
            }}
            autoFocus={false}
          />
        </View>
        <TouchableOpacity className="bg-main-1 py-4 rounded-lg mt-2">
          <Text className="text-center text-white font-semibold">Next</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ChangePhoneNumber;
