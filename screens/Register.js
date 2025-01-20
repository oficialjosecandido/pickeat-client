import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { ICONS, THEME } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import Toast from "react-native-toast-message";

const validateEmail = (email) => {
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!pattern.test(email)) throw "Invalid email.";
};

const validatePassword = (password) => {
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }
};

const validateName = (name) => {
  if (name.length < 2) {
    throw "First name should be at least 2 characters long.";
  }

  if (name.length > 50) {
    throw "First name is too long.";
  }

  if (!/^[a-zA-Z\s-'’]+$/i.test(name)) {
    throw "First name contains invalid characters. Only alphabetic characters.";
  }
};

const validateLastName = (name) => {
  if (name.length < 2) {
    throw "Last name should be at least 2 characters long.";
  }

  if (name.length > 50) {
    throw "Last name is too long.";
  }

  if (!/^[a-zA-Z\s-'’]+$/i.test(name)) {
    throw "Last name contains invalid characters. Only alphabetic characters.";
  }
};

const Register = () => {
  const navigation = useNavigation();
  const { register } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      validateName(firstName);
      validateLastName(lastName);
      validateEmail(email);
      validatePassword(password);
      if (!agreeTerms) throw "Please agree to the terms and conditions.";
      setLoading(true);
      await register(email, password, firstName, lastName);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Account created successfully. Please confirm your email.",
      });
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || error;

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        className={`bg-main-1/10 p-4 ${
          Platform.OS === "android" ? "h-screen" : ""
        }`}
      >
        <View className="bg-white rounded-lg border border-black/10 px-5 pb-5 h-full">
          <Image
            className="h-20 w-20 rounded-lg bg-main-1/20 mx-auto my-16"
            source={ICONS.logo}
            resizeMode="contain"
          />
          <View className="flex-row space-x-4">
            <TextInput
              className="px-4 py-2 border border-black/10 rounded-lg mb-4 bg-main-1/10 text-xs flex-1 text-left"
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              className="px-4 py-2 border border-black/10 rounded-lg mb-4 bg-main-1/10 text-xs flex-1 text-left"
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          <TextInput
            className="px-4 py-2 border border-black/10 rounded-lg mb-4 bg-main-1/10 text-xs text-left"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <View className="flex-row items-center">
            <TextInput
              className="px-4 py-2 border border-black/10 rounded-lg bg-main-1/10 text-xs pr-14 flex-1 text-left"
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              className="py-2 px-4 absolute right-0"
            >
              <Image
                source={showPassword ? ICONS.hide : ICONS.show}
                className="h-5 w-5"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <TouchableOpacity
              className="p-2 pl-1 flex-row items-center space-x-2"
              onPress={() => setAgreeTerms((prev) => !prev)}
            >
              <View
                className={`w-3 h-3 rounded border border-black/40 ${
                  agreeTerms ? "bg-main-1" : "bg-white"
                }`}
              />
              <View className="flex-row items-center space-x-1">
                <Text className="text-black/70 text-start text-[10px]">
                  I agree to the
                </Text>
                <TouchableOpacity onPress={() => {}}>
                  <Text className="text-main-1 text-[10px] font-semibold">
                    Terms & Conditions
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className={`rounded-lg py-3 mt-2 ${
              loading ? "bg-main-1/50" : "bg-main-1"
            }`}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-white text-center text-xs font-semibold">
              Sign Up
            </Text>
          </TouchableOpacity>
          <View className="flex-row items-center space-x-5">
            <View className="h-[1px] flex-1 bg-main-1" />
            <Text className="text-main-1 text-center text-[10px] my-4">OR</Text>
            <View className="h-[1px] flex-1 bg-main-1" />
          </View>
          <TouchableOpacity
            className="bg-main-1/10 border border-black/10 rounded-lg py-3 flex-row items-center justify-center space-x-2 text-sm"
            onPress={() => {}}
          >
            <Image
              source={ICONS.google}
              className="h-4 w-4"
              resizeMode="cover"
            />
            <Text className="text-center text-xs font-semibold">
              Login With Google
            </Text>
          </TouchableOpacity>
          <View className="flex-1 justify-end">
            <View className="flex-row justify-center items-end space-x-2">
              <Text className="text-[11px]">Already have an account?</Text>
              <TouchableOpacity className="" onPress={navigation.goBack}>
                <Text className="text-main-1 text-[11px] font-semibold">
                  Log In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Register;
