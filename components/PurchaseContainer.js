import {
  View,
  TouchableOpacity,
  Image,
  Keyboard,
  Button,
  Text,
} from "react-native";
import React, { useEffect, useState } from "react";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { ICONS } from "../constants";
import { useModal } from "../context/ModalContext";
import { useStripe } from "@stripe/stripe-react-native";

const PurchaseContainer = ({ cart }) => {
  const { setShowModal, setModalContent } = useModal();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {
    return {
      paymentIntent: "qowprkpqwor",
    };
  };

  const initializePaymentSheet = async () => {
    setLoading(true);

    const { paymentIntent } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      paymentIntentClientSecret: paymentIntent,
      merchantDisplayName: "PickEat",
    });

    if (!error) {
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      alert(`Payment failed: ${error.message}`);
    } else {
      alert("Payment successful!");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="p-4 rounded-lg bg-white border border-black/20 w-[90%] mx-auto">
        <TouchableOpacity
          onPress={closeModal}
          className="p-2 rounded-full absolute -top-3 -right-3 bg-main-1"
        >
          <Image
            style={{ tintColor: "white" }}
            source={ICONS.close}
            className="h-3 w-3"
            resizeMode="container"
          />
        </TouchableOpacity>
        <Text className="text-center font-bold text-lg">Purchase</Text>
      </View>
      {/* <Button onPress={openPaymentSheet} title="Pay Now" disabled={loading} /> */}
    </TouchableWithoutFeedback>
  );
};

export default PurchaseContainer;
