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
import GoogleLogin from "../components/GoogleLogin";

const Login = () => {
  const navigation = useNavigation();
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error("Error logging in", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        className={`bg-main-1/10 p-4 ${Platform.OS === "ios" ? "flex-1" : ""}`}
        style={{
          height: Platform.OS === "android" ? THEME.screenHeight - 65 : "auto",
        }}
      >
        <View className="bg-white rounded-lg border border-black/10 px-5 pb-5 h-full">
          <Image
            className="h-20 w-20 rounded-lg bg-main-1/20 mx-auto my-16"
            source={ICONS.logo}
            resizeMode="contain"
          />
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
          <View className="flex-row items-center justify-end mt-1">
            <TouchableOpacity
              className="p-2 pr-1"
              onPress={() => navigation.navigate("ResetPassword")}
            >
              <Text className="text-black/70 text-left text-[10px] font-semibold text-main-1">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className={` rounded-lg py-3 mt-2 ${
              loading ? "bg-main-1/50" : "bg-main-1"
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-center text-xs font-semibold">
              Log In
            </Text>
          </TouchableOpacity>
          <View className="flex-row items-center space-x-5">
            <View className="h-[1px] flex-1 bg-main-1" />
            <Text className="text-main-1 text-center text-[10px] my-4">OR</Text>
            <View className="h-[1px] flex-1 bg-main-1" />
          </View>
          <GoogleLogin />
          <View className="flex-1 justify-end">
            <View className="flex-row justify-center items-end space-x-2">
              <Text className="text-[11px]">Don't have an account?</Text>
              <TouchableOpacity
                className=""
                onPress={() => navigation.navigate("Register")}
              >
                <Text className="text-main-1 text-[11px] font-semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;
