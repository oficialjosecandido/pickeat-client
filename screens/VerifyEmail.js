import { View, Text, TouchableOpacity, Image, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import { useModal } from "../context/ModalContext";
import { ICONS } from "../constants";
import { CodeField, Cursor } from "react-native-confirmation-code-field";
import Toast from "react-native-toast-message";

const CELL_COUNT = 6;

const VerifyEmail = ({ email, verifyEmail, resentVerificationEmail }) => {
  const { setModalContent, setShowModal } = useModal();

  const [digits, setDigits] = useState("");
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      if (digits.length !== CELL_COUNT) throw new Error("Invalid code.");
      await verifyEmail(email, digits);
      setModalContent(null);
      setShowModal(false);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Email verified successfully.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    setLoading(true);
    try {
      await resentVerificationEmail(email);
      setCounter(60);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (counter === 0) return;
    const timer = setTimeout(() => {
      setCounter(counter - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [counter]);

  return (
    <View className="p-4 bg-white max-w-[90%] mx-auto rounded">
      <View className="flex-row items-center justify-between w-full">
        <Text>Verify Your Email</Text>
        <TouchableOpacity className="p-1" onPress={() => setModalContent(null)}>
          <Image
            source={ICONS.close}
            className="w-3 h-3"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <Text className="text-xs mt-2 text-black/70 text-center">
        Please enter the 6-digit code sent to
      </Text>
      <Text className="underline text-center text-xs mb-4">{email}</Text>
      <CodeField
        value={digits}
        onChangeText={setDigits}
        cellCount={CELL_COUNT}
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
      <TouchableOpacity
        onPress={resendEmail}
        disabled={counter > 0}
        className="mt-2 mb-4 justify-center items-center"
      >
        <Text className="font-semibold text-xs text-main-1">
          {counter > 0 ? `Send again in ${counter}s` : `Resend Email`}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`p-2 rounded ${loading ? "bg-main-1/50" : "bg-main-1"}`}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text className="text-white text-center">Verify</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyEmail;
