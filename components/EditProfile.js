import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ICONS } from "../constants";
import { useModal } from "../context/ModalContext";
import { CodeField, Cursor } from "react-native-confirmation-code-field";
import Toast from "react-native-toast-message";
import { useUser } from "../context/UserContext";

const validateEmail = (email) => {
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!pattern.test(email)) throw "Invalid email.";
};

const EditProfile = ({ user }) => {
  const { setShowModal, setModalContent } = useModal();
  const { changeEmail, verifyChangeEmail } = useUser();

  const [newEmail, setNewEmail] = useState("");
  const [digits, setDigits] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const closeBottomSheet = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        validateEmail(newEmail);
        await changeEmail(newEmail);
      }
      if (step === 2) {
        validateEmail(newEmail);
        await verifyChangeEmail(digits);
        closeBottomSheet();
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Email changed successfully",
        });
      }
      setStep((prev) => prev + 1);
    } catch (error) {
      console.error("Error changing email", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="p-4 rounded-lg bg-white border border-black/20 w-[90%] mx-auto">
        <TouchableOpacity
          onPress={closeBottomSheet}
          className="p-2 rounded-full absolute -top-3 -right-3 bg-main-1"
        >
          <Image
            style={{ tintColor: "white" }}
            source={ICONS.close}
            className="h-3 w-3"
            resizeMode="container"
          />
        </TouchableOpacity>
        <Text className="text-left text-black/70 font-bold">
          Change Email Address
        </Text>
        <Text className="text-xs text-black/70 text-lect my-4">
          {step === 1
            ? "Write down your new email address below and click next to proceed"
            : "Please enter the 6-digit code sent to your email."}
        </Text>
        {step === 1 ? (
          <TextInput
            className="border border-black/20 p-2 rounded w-full mt-1 bg-main-1/10 text-left"
            placeholder="New Email"
            value={newEmail}
            onChangeText={setNewEmail}
          />
        ) : (
          <CodeField
            value={digits}
            onChangeText={setDigits}
            cellCount={6}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete={Platform.select({
              android: "sms-otp",
              default: "one-time-code",
            })}
            isFocused={true}
            rootStyle={{
              gap: 10,
            }}
            testID="my-code-input"
            renderCell={({ index, symbol, isFocused }) => (
              <Text
                className={`bg-main-1/10 flex-1 p-4 text-center border rounded ${
                  isFocused ? "border-main-1" : "border-black/10"
                }`}
                key={index}
              >
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            )}
          />
        )}
        <TouchableOpacity
          onPress={handleNext}
          disabled={loading}
          className={`self-start ml-auto mt-4 px-6 py-1.5 rounded-lg ${
            loading ? "bg-gray-200" : "bg-main-1"
          }`}
        >
          <Text className="text-center text-white text-sm">Next</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default EditProfile;
