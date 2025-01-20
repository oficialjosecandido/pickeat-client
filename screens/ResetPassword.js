import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { ICONS, THEME } from "../constants";
import Toast from "react-native-toast-message";
import { CodeField, Cursor } from "react-native-confirmation-code-field";

const SubText = ({ step, email }) => {
  if (step === 0) {
    return (
      <Text className="text-[10px] text-center text-black/70 my-2">
        No worries! Enter your email and we'll send you a code to reset your
        password.
      </Text>
    );
  }
  if (step === 1) {
    return (
      <Text className="text-[10px] text-center text-black/70 my-2">
        We sent a code to {email}.
      </Text>
    );
  }
  if (step === 2) {
    return (
      <Text className="text-[10px] text-center text-black/70 my-2">
        Must be at least 6 characters long.
      </Text>
    );
  }
};

const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  if (!re.test(email)) throw new Error("Invalid email address.");
};

const ResetPassword = ({ navigation }) => {
  const { forgotPassword, verifyResetPasswordCode, resetPassword } = useUser();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      if (step === 0) {
        if (!email)
          throw new Error("Please enter your email address to reset password.");
        validateEmail(email);
        await forgotPassword(email);
      } else if (step === 1) {
        if (!code) throw new Error("Please enter the code sent to your email.");
        await verifyResetPasswordCode(email, code);
      } else if (step === 2) {
        if (!password) throw new Error("Please enter your new password.");
        if (password.length < 6)
          throw new Error("Password must be at least 6 characters long.");
        await resetPassword(email, code, password);
      }
      setStep(step + 1);
    } catch (error) {
      const message = error.message || "Internal server error.";

      Toast.show({
        type: "error",
        text1: "Error",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="bg-main-1/10 p-4 h-screen">
        <View className="bg-white rounded-lg border border-black/10 px-5 pb-5 h-full">
          <TouchableOpacity
            className="absolute top-4 left-2 p-2"
            onPress={() =>
              step === 0
                ? navigation.goBack()
                : setStep((prev) => (prev - 1 > 0 ? prev - 1 : 0))
            }
          >
            <Image source={ICONS.back} className="h-4 w-4" />
          </TouchableOpacity>
          <View className="bg-main-1/20 h-14 w-14 my-16 mx-auto rounded-lg p-2 border border-black/10">
            <Image
              className="h-full w-full rounded-lg"
              source={[ICONS.fingerprint, ICONS.envelope, ICONS.password][step]}
              resizeMode="contain"
            />
          </View>
          <Text className="text-center font-bold text-lg">
            Forgot Password?
          </Text>
          <SubText step={step} email={email} />
          {step === 0 && (
            <TextInput
              className="px-4 py-2 border border-black/10 rounded-lg bg-main-1/10 text-xs my-4 text-left"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
          )}
          {step === 1 && (
            <CodeField
              value={code}
              onChangeText={setCode}
              cellCount={6}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete={Platform.select({
                android: "sms-otp",
                default: "one-time-code",
              })}
              rootStyle={{
                gap: 10,
                marginVertical: 20,
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
          {step === 2 && (
            <TextInput
              className="px-4 py-2 border border-black/10 rounded-lg bg-main-1/10 text-xs my-4 text-left"
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          )}
          <TouchableOpacity
            className={`rounded-lg py-2 ${
              loading ? "bg-black/20" : "bg-main-1"
            }`}
            disabled={loading}
            onPress={handleResetPassword}
          >
            <Text className="text-center text-white">
              {["Send Code", "Verify Code", "Reset Password"][step]}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="text-center text-main-1 mt-6 flex-row items-center justify-center"
            onPress={navigation.goBack}
          >
            <Image source={ICONS.back} className="h-3 w-3 mr-1" />
            <Text className="text-[10px] font-semibold text-black/70">
              Back to login
            </Text>
          </TouchableOpacity>
          <View className="flex-1 flex-row items-end space-x-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <TouchableOpacity
                key={i}
                className="h-6 flex-1 justify-center"
                onPress={() => setStep(i)}
                disabled={i >= step}
              >
                <View
                  className={`h-2 rounded-full ${
                    i === step ? "bg-main-1" : "bg-black/20"
                  }`}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ResetPassword;
