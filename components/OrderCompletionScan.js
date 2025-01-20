import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useModal } from "../context/ModalContext";
import { ICONS } from "../constants";
import QRCode from "react-native-qrcode-svg"; // Import QRCode component

const OrderCompletionScan = ({ orderId, id }) => {
  const { setShowModal, setModalContent } = useModal();

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  return (
    <View className="p-4 bg-white max-w-[90%] mx-auto rounded">
      <TouchableOpacity
        onPress={closeModal}
        className="absolute top-2 right-2 p-1 z-10"
      >
        <Image source={ICONS.close} className="h-4 w-4" resizeMode="contain" />
      </TouchableOpacity>
      <Text className="font-bold text-lg text-center">{orderId}</Text>
      <Text className="font-bold text-xs text-center py-2">
        Scan the QR code to complete your order
      </Text>
      <View className="h-80 w-80 mx-auto flex items-center justify-center">
        <QRCode value={id} size={250} />
      </View>
    </View>
  );
};

export default OrderCompletionScan;
