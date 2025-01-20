import {
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useState } from "react";
import ScreenHeader from "../components/ScreenHeader";
import { TouchableOpacity } from "react-native";
import { ICONS } from "../constants";
import { useUser } from "../context/UserContext";
import Toast from "react-native-toast-message";

const Settings = ({ navigation }) => {
  const { user, changeNames, changePassword } = useUser();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  const [loading, setLoading] = useState(false);

  const handleSaveName = async () => {
    try {
      setLoading(true);
      if (!firstName || !lastName) {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill all fields",
        });
        return;
      }
      await changeNames(firstName, lastName);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Name changed successfully",
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

  const handleSavePassword = async () => {
    try {
      setLoading(true);
      if (!password || !confirmPassword) {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill all fields",
        });
      }

      if (password !== confirmPassword) {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Passwords do not match",
        });
      }

      await changePassword(password);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Password changed successfully",
      });
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-white">
        <ScreenHeader title="Settings" goBack={navigation.goBack} />
        <View className="py-4 px-6">
          <View className="flex-row py-4 items-center justify-between">
            <Text className="text-lg font-bold">Change Name</Text>
            <TouchableOpacity
              disabled={loading}
              onPress={handleSaveName}
              className="border border-main-1 px-3 py-1 rounded-full bg-main-1/10"
            >
              <Text className="text-main-1">Save</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            className="px-4 py-2 border border-black/10 rounded-lg bg-main-1/10 text-xs"
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            className="px-4 py-2 border border-black/10 rounded-lg bg-main-1/10 text-xs mt-4"
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <View className="h-[2px] w-full bg-main-1/10 my-10" />
        <View className="py-4 px-6">
          <View className="flex-row py-4 items-center justify-between">
            <Text className="text-lg font-bold">Change Password</Text>
            <TouchableOpacity
              disabled={loading}
              onPress={handleSavePassword}
              className="border border-main-1 px-3 py-1 rounded-full bg-main-1/10"
            >
              <Text className="text-main-1">Save</Text>
            </TouchableOpacity>
          </View>
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
          <View className="flex-row items-center mt-4">
            <TextInput
              className="px-4 py-2 border border-black/10 rounded-lg bg-main-1/10 text-xs pr-14 flex-1 text-left"
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              className="py-2 px-4 absolute right-0"
            >
              <Image
                source={showConfirmPassword ? ICONS.hide : ICONS.show}
                className="h-5 w-5"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Settings;
