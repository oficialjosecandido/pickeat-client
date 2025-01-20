import { Image, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenHeader from "../components/ScreenHeader";
import { ICONS, PAYMENTS } from "../constants";
import { useUser } from "../context/UserContext";
import Loader from "../components/Loader";
import { useModal } from "../context/ModalContext";
import { useStripe } from "@stripe/stripe-react-native";
import Toast from "react-native-toast-message";

const CardSettings = ({ closeModal, paymentMethodId, handleGetCards }) => {
  const { setDefaultCard, removeCard } = useUser();

  const [loading, setLoading] = useState(false);

  const handleSetDefaultCard = async () => {
    try {
      setLoading(true);
      await setDefaultCard(paymentMethodId);
      closeModal();
      await handleGetCards();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCard = async () => {
    try {
      setLoading(true);
      await removeCard(paymentMethodId);
      closeModal();
      await handleGetCards();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <Text className="text-left text-black/70 font-bold border-b pb-4 border-black/10">
        Card Settings
      </Text>
      <TouchableOpacity
        onPress={handleSetDefaultCard}
        className="py-4 border-b border-black/10"
      >
        <Text className="text-center text-xs font-semibold">
          Set as Default
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        disabled={loading}
        onPress={handleRemoveCard}
        className="py-4 bg-red-400"
      >
        <Text className="text-center text-xs font-semibold text-white">
          Remove Card
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const Cards = ({ navigation }) => {
  const { getCards, getSetupIntent } = useUser();
  const { setShowModal, setModalContent } = useModal();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [cards, setCards] = useState([]);

  const initializePaymentSheet = async () => {
    setSetupLoading(true);
    try {
      // Fetch the Setup Intent from your backend
      const { setupIntent } = await getSetupIntent();
      if (!setupIntent) {
        console.error("No Setup Intent returned.");
        return;
      }

      // Initialize the PaymentSheet with the Setup Intent's client secret
      const { error } = await initPaymentSheet({
        customerId: setupIntent.customer,
        customerEphemeralKeySecret: null, // Not needed when using customer ID
        setupIntentClientSecret: setupIntent.client_secret,
        merchantDisplayName: "PickEat",
        allowsDelayedPaymentMethods: true,
      });

      if (error) {
        console.error("Error initializing payment sheet:", error);
      }
    } catch (error) {
      console.error("Error initializing payment sheet", error);
    } finally {
      setSetupLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    await initializePaymentSheet();
    const presentResult = await presentPaymentSheet();
    if (presentResult.error) {
      console.error("Error presenting payment sheet:", presentResult.error);
    } else {
      await handleGetCards();
      Toast.show({
        type: "success",
        text1: "Card Added",
        text2: "Your card has been added successfully.",
      });
    }
  };

  const handleGetCards = async () => {
    try {
      setLoading(true);
      const cards = await getCards();
      setCards(cards);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const handleOpenModal = (methodPaymentId) => {
    setModalContent(
      <CardSettings
        closeModal={closeModal}
        paymentMethodId={methodPaymentId}
        handleGetCards={handleGetCards}
      />
    );
    setShowModal(true);
  };

  useEffect(() => {
    handleGetCards();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Cards" goBack={navigation.goBack} />
      <View className="flex-1 bg-main-1/10 p-4">
        <View className="bg-white p-3 rounded border border-black/10">
          <Text className="font-semibold">My Cards</Text>
          {cards.map((cd, index) => {
            const { brand, isDefault, last4, methodPaymentId } = cd;
            return (
              <View
                key={index}
                className="flex-row items-center justify-between border-b border-black/10 py-2"
              >
                <View className="flex-row items-center space-x-2">
                  <Image
                    source={PAYMENTS[brand]}
                    className="h-6 w-6"
                    resizeMethod="contain"
                  />
                  <Text className="text-sm">**** **** **** {last4}</Text>
                </View>
                <Text className="text-xs text-main-1">
                  {isDefault ? "Default" : ""}
                </Text>
                <TouchableOpacity
                  onPress={() => handleOpenModal(methodPaymentId)}
                  className="p-2 rounded-lg"
                >
                  <Image
                    className="h-4 w-4"
                    source={ICONS.more}
                    resizeMethod="contain"
                  />
                </TouchableOpacity>
              </View>
            );
          })}
          <TouchableOpacity
            onPress={openPaymentSheet}
            disabled={setupLoading}
            className="py-3 bg-main-1/10 flex-row items-center justify-center space-x-2 rounded-lg border border-black/10 mt-4"
          >
            <Image
              className="h-2 w-2"
              source={ICONS.add}
              resizeMethod="contain"
              style={{ tintColor: "#ec7d55" }}
            />
            <Text className="text-center text-xs font-semibold text-main-1">
              {setupLoading ? "loading" : "Add new Card"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Cards;
