import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import React, { useState } from "react";
import { ICONS } from "../constants";
import { useModal } from "../context/ModalContext";
import ChangePhoneNumber from "../components/ChangePhoneNumber";
import EditProfile from "../components/EditProfile";
import { useUser } from "../context/UserContext";
import Login from "./Login";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

const Profile = ({ navigation }) => {
  const { setShowModal, setModalContent } = useModal();
  const { user, logout, uploadProfileImage } = useUser();

  const handleUploadProfilePicture = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled) {
        uploadProfileImage(result);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while uploading the image.",
      });
    }
  };

  const handleChangePhoneNumber = () => {
    setShowModal(true);
    setModalContent(<ChangePhoneNumber />);
  };

  // Function to open WhatsApp
  const openWhatsApp = async () => {
    try {
      let phoneNumber = "+393333127386";
      let message = "Salve, vorrei contattare PickEat!";

      let url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
        message
      )}`;

      await Linking.openURL(url);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditProfile = () => {
    setShowModal(true);
    setModalContent(<EditProfile user={user} />);
  };

  if (!user?.userID) return <Login />;
  return (
    <View className="flex-1 bg-white px-4">
      <TouchableOpacity
        onPress={logout}
        className="p-2 absolute top-4 right-2 z-10"
      >
        <Image source={ICONS.logout} className="h-6 w-6" resizeMethod="cover" />
      </TouchableOpacity>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={handleUploadProfilePicture}
          className="mx-auto my-4"
        >
          <Image
            source={{
              uri:
                user?.profileImage ||
                "https://pickeat.blob.core.windows.net/profile-images/profile.jpg",
            }}
            className="h-20 w-20 rounded-full"
            resizeMethod="cover"
          />
        </TouchableOpacity>
        <Text className="text-center text-xl font-semibold">{`${user?.firstName} ${user?.lastName}`}</Text>
        <Text className="text-center text-black/70 text-xs">{user?.email}</Text>
        <TouchableOpacity
          onPress={handleEditProfile}
          className="bg-main-1 self-start mx-auto mt-4 px-4 py-2 rounded-full mb-10"
        >
          <Text className="text-center text-white text-sm">Edit Profile</Text>
        </TouchableOpacity>
        <Text className="text-[10px] mb-2 mx-4">Account & Security</Text>
        <View className="rounded-xl bg-main-1/10 border border-black/20 px-6">
          {/* <TouchableOpacity
            onPress={handleChangePhoneNumber}
            className="py-4 flex-row items-center space-x-2 border-b border-black/20"
          >
            <Image
              className="h-5 w-5"
              source={ICONS.phone}
              resizeMethod="contain"
            />
            <Text numberOfLines={1} className="text-sm flex-1">
              Change Phone Number
            </Text>
            <Image
              className="h-4 w-4"
              source={ICONS.next}
              resizeMethod="contain"
            />
          </TouchableOpacity> */}
          {/* <TouchableOpacity className="py-4 flex-row items-center space-x-2 border-b border-black/20">
            <Image
              className="h-6 w-6"
              source={ICONS.location}
              resizeMethod="contain"
            />
            <Text numberOfLines={1} className="text-sm flex-1">
              My Location
            </Text>
            <Image
              className="h-4 w-4"
              source={ICONS.next}
              resizeMethod="contain"
            />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            className="py-4 flex-row items-center space-x-2 border-b border-black/20"
          >
            <Image
              className="h-6 w-6"
              source={ICONS.settings}
              resizeMethod="contain"
            />
            <Text numberOfLines={1} className="text-sm flex-1">
              Settings
            </Text>
            <Image
              className="h-4 w-4"
              source={ICONS.next}
              resizeMethod="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Cards")}
            className="py-4 flex-row items-center space-x-2"
          >
            <Image
              className="h-6 w-6"
              source={ICONS.creditCard}
              resizeMethod="contain"
            />
            <Text numberOfLines={1} className="text-sm flex-1">
              Cards
            </Text>
            <Image
              className="h-4 w-4"
              source={ICONS.next}
              resizeMethod="contain"
            />
          </TouchableOpacity>
        </View>
        <Text className="text-[10px] mb-2 mx-4 mt-6">Offers & Discounts</Text>
        <View className="rounded-xl bg-main-1/10 border border-black/20 px-6">
          <TouchableOpacity
            onPress={() => navigation.navigate("Coupons")}
            className="py-4 flex-row items-center space-x-2"
          >
            <Image
              className="h-5 w-5"
              source={ICONS.coupon}
              resizeMethod="contain"
            />
            <Text numberOfLines={1} className="text-sm flex-1">
              My Coupons
            </Text>
            <Image
              className="h-4 w-4"
              source={ICONS.next}
              resizeMethod="contain"
            />
          </TouchableOpacity>
        </View>
        <Text className="text-[10px] mb-2 mx-4 mt-6">
          Support & Information
        </Text>
        <View className="rounded-xl bg-main-1/10 border border-black/20 px-6">
          <TouchableOpacity
            onPress={openWhatsApp}
            className="py-4 flex-row items-center space-x-2 border-b border-black/20"
          >
            <Image
              className="h-5 w-5"
              source={ICONS.support}
              resizeMethod="contain"
            />
            <Text numberOfLines={1} className="text-sm flex-1">
              Contact PickEat
            </Text>
            <Image
              className="h-4 w-4"
              source={ICONS.next}
              resizeMethod="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Webview", {
                url: "https://www.iubenda.com/privacy-policy/75231491",
                title: "Terms & Conditions",
              })
            }
            className="py-4 flex-row items-center space-x-2 border-b border-black/20"
          >
            <Image
              className="h-5 w-5"
              source={ICONS.terms}
              resizeMethod="contain"
            />
            <Text numberOfLines={1} className="text-sm flex-1">
              Terms & Conditions
            </Text>
            <Image
              className="h-4 w-4"
              source={ICONS.next}
              resizeMethod="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Webview", {
                url: "https://www.iubenda.com/termini-e-condizioni/75231491",
                title: "Privacy Policy",
              })
            }
            className="py-4 flex-row items-center space-x-2"
          >
            <Image
              className="h-5 w-5"
              source={ICONS.lock}
              resizeMethod="contain"
            />
            <Text numberOfLines={1} className="text-sm flex-1">
              Privacy Policy
            </Text>
            <Image
              className="h-4 w-4"
              source={ICONS.next}
              resizeMethod="contain"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;
