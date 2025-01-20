import { View, Text } from "react-native";
import React from "react";
import ScreenHeader from "../components/ScreenHeader";
import { WebView } from "react-native-webview";

const CustomWebView = ({ navigation, route }) => {
  const { url, title } = route.params;
  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={title} goBack={navigation.goBack} />
      <WebView className="flex-1" source={{ uri: url }} />
    </View>
  );
};

export default CustomWebView;
