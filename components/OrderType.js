import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { ICONS, IMAGES } from "../constants";
import { useData } from "../context/DataContext";
import Loader from "./Loader";
import { useUser } from "../context/UserContext";
import { useStripe } from "@stripe/stripe-react-native";
import { useModal } from "../context/ModalContext";
import ApplyCoupons from "./ApplyCoupons";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const OrderType = ({ onBack, stadiumId, timeSlot }) => {
  const { getStadiumPickupPoints, currencies } = useData();
  const { cart, clearCart, getPaymentIntent, getMyCoupons, socket } = useUser();
  const { setBottomSheetVisible, setShowModal, setModalContent } = useModal();

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [orderType, setOrderType] = useState(0);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [floor, setFloor] = useState(1);
  const [pickupPoint, setPickupPoint] = useState(null);
  const [sector, setSector] = useState("");
  const [seat, setSeat] = useState("");
  const [loading, setLoading] = useState(true);

  const sendDelayedNotification = async (title, body) => {
    if (Device.isDevice) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: { seconds: 10 },
      });
    } else {
      console.log("Notifications are not supported on simulators.");
    }
  };

  const initializePaymentSheet = async (coupon) => {
    setLoading(true);
    try {
      const deliveryOption = orderType === 0 ? "delivery" : "pickup";
      const deliveryAddress =
        orderType === 0 ? { sector, seat } : { pickupPoint };
      deliveryAddress.floor = floor;

      // Validate cart data before sending
      if (!cart || cart.length === 0) {
        throw new Error("Cart is empty");
      }

      // Validate required fields
      if (!stadiumId) {
        throw new Error("Stadium ID is required");
      }

      if (!timeSlot) {
        throw new Error("Time slot is required");
      }

      const payloadData = {
        cart,
        deliveryOption,
        deliveryAddress,
        timeSlot,
        stadiumId,
        coupon,
        event_type: "purchase"
      };

      // console.log("Payment Intent Payload:", JSON.stringify(payloadData, null, 2));

      const response = await getPaymentIntent(
        cart,
        deliveryOption,
        deliveryAddress,
        timeSlot,
        stadiumId,
        coupon,
        "purchase"  // Add event_type parameter
      );

      if (!response || !response.paymentIntent) {
        throw new Error("Invalid payment intent response from server");
      }

      const { paymentIntent, customerID } = response;

      // Validate payment intent data
      if (!paymentIntent.client_secret) {
        throw new Error("Missing client secret in payment intent");
      }

      const initPaymentSheetData = {
        paymentIntentClientSecret: paymentIntent.client_secret,
        merchantDisplayName: "PickEat",
        allowsDelayedPaymentMethods: true,
      };

      if (customerID) {
        initPaymentSheetData.customerId = customerID;
        if (paymentIntent.customerEphemeralKeySecret) {
          initPaymentSheetData.customerEphemeralKeySecret =
            paymentIntent.customerEphemeralKeySecret;
        }
      }

      console.log("Initializing payment sheet with:", initPaymentSheetData);

      const { error: initError } = await initPaymentSheet(initPaymentSheetData);

      if (initError) {
        throw new Error(`Payment sheet initialization failed: ${initError.message}`);
      }

    } catch (error) {
      console.error("Payment initialization error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Send more specific error notifications based on error type
      let notificationTitle = "Payment Setup Failed";
      let notificationBody = "We couldn't set up the payment system. Please try again.";

      if (error.response?.status === 500) {
        notificationBody = "Our payment system is temporarily unavailable. Please try again in a few minutes.";
      } else if (error.message.includes("Cart is empty")) {
        notificationBody = "Please add items to your cart before proceeding.";
      }

      await sendDelayedNotification(notificationTitle, notificationBody);
      throw error; // Re-throw to handle in the calling function
    } finally {
      setLoading(false);
    }
  };


  const confirmAvailableCoupons = (coupons) => {
    return new Promise((res, rej) => {
      setShowModal(true);
      setModalContent(
        <ApplyCoupons
          coupons={coupons}
          onApply={(coupon) => {
            res(coupon);
            setShowModal(false);
            setModalContent(null);
          }}
          onCancel={() => {
            res();
            setShowModal(false);
            setModalContent(null);
          }}
        />
      );
    });
  };

  const openPaymentSheet = async () => {
    try {
      const coupons = await getMyCoupons();
      let coupon = null;
      if (coupons.length > 0) {
        coupon = await confirmAvailableCoupons(coupons);
      }

      await initializePaymentSheet(coupon);

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        throw new Error(`Payment failed: ${presentError.message}`);
      }

      // Success flow
      await sendDelayedNotification(
        "Order Confirmed!",
        `Your order has been successfully processed and will be ${orderType === 0 ? "delivered" : "ready for pickup"
        } at your selected location.`
      );

      setBottomSheetVisible(false);
      clearCart(false);

    } catch (error) {
      console.error("Payment process error:", {
        message: error.message,
        code: error.code,
        type: error.type
      });

      // Don't show error notification if user cancelled
      if (error.code !== 'Canceled') {
        await sendDelayedNotification(
          "Payment Failed",
          error.message || "We encountered an error processing your payment. Please try again."
        );
      }
    }
  };

  const isDisabled = () => {
    if (orderType === 0) {
      return !sector || !seat;
    } else {
      return !pickupPoint;
    }
  };

  useEffect(() => {
    const fetchPickupPoints = async () => {
      setLoading(true);
      try {
        const points = await getStadiumPickupPoints(stadiumId);
        setPickupPoints(points);
      } catch (error) {
        console.error("Error fetching pickup points:", error);
        await sendDelayedNotification(
          "Location Error",
          "Unable to load pickup points. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPickupPoints();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('purchase', (data) => {
        console.log('Purchase completed:', data);
        sendDelayedNotification(
          "Purchase Complete",
          "Your purchase has been successfully processed!"
        );
      });

      return () => {
        socket.off('purchase');
      };
    }
  }, [socket]);

  return (
    <View className="py-4 px-2 bg-white">
      <View className="flex-row items-center space-x-2">
        <TouchableOpacity
          onPress={onBack}
          className="bg-white/50 p-3 rounded-full"
        >
          <Image source={ICONS.back} className="h-4 w-4" />
        </TouchableOpacity>
        <Text className="text-[16px] font-bold">How do you want to order?</Text>
      </View>

      <View className="flex-row items-center justify-center space-x-4">
        <TouchableOpacity
          onPress={() => setOrderType(0)}
          className={`self-start py-4 px-3 rounded-full shadow-sm w-20 h-20 border border-black/10 my-2 items-center justify-center`}
        >
          <Image
            source={ICONS.delivery}
            className="h-6 w-6 m-auto mb-1"
            style={{
              tintColor: orderType === 0 ? "#ec7d55" : "#000000",
            }}
          />
          <Text
            className={`text-xs font-semibold ${orderType === 0 ? "text-main-1" : "text-black"
              }`}
          >
            Delivery
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOrderType(1)}
          className={`self-start py-4 px-3 rounded-full shadow-sm w-20 h-20 border border-black/10 my-2 items-center justify-center`}
        >
          <Image
            source={ICONS.pickup}
            className="h-6 w-6 m-auto mb-1"
            style={{
              tintColor: orderType === 1 ? "#ec7d55" : "#000000",
            }}
          />
          <Text
            className={`text-xs font-semibold ${orderType === 1 ? "text-main-1" : "text-black"
              }`}
          >
            Pickup
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center space-x-2 justify-center">
        {pickupPoints.map((point, index) => {
          const { floorNumber } = point;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setFloor(floorNumber * 1)}
              className={`py-2 px-4 border self-start border-black/10 my-2 items-center justify-center rounded-lg ${floor === floorNumber * 1 ? "bg-[#ec7d55]" : "bg-white"
                }`}
            >
              <Text
                className={`text-xs font-semibold ${floor === floorNumber * 1 ? "text-white" : "text-black"
                  }`}
              >
                Floor: {floorNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <Loader />
      ) : orderType === 1 ? (
        <>
          <View className="mt-4 h-48 w-64 mx-auto">
            <Image
              resizeMode="contain"
              source={IMAGES.internalStadium}
              className="h-full w-full absolute bottom-0"
            />
            {pickupPoints[floor - 1].pickupPoints.map((point, index) => {
              const { coordinates, label } = point;
              const [x, y] = coordinates;
              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    left: x,
                    top: y,
                    position: "absolute",
                  }}
                  className={`border px-3 ${label === pickupPoint ? "bg-main-1 text-white" : ""
                    }`}
                  onPress={() => setPickupPoint(label)}
                >
                  <Text className="text-white font-bold text-lg">{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View className="py-0">
            <Text className="text-sm font-semibold text-center">
              Pick up points
            </Text>
          </View>
        </>
      ) : (
        <View className="py-4">
          <Text className="text-sm font-semibold text-center">
            Delivery Address
          </Text>
          <TextInput
            value={sector}
            onChangeText={setSector}
            placeholder="Sector"
            className="border border-black/10 rounded-lg p-2 mt-2"
            keyboardType="number-pad"
          />
          <TextInput
            value={seat}
            onChangeText={setSeat}
            placeholder="Seat"
            className="border border-black/10 rounded-lg p-2 mt-2"
            keyboardType="number-pad"
          />
        </View>
      )}
      <TouchableOpacity
        disabled={isDisabled()}
        onPress={openPaymentSheet}
        className={`p-4 rounded-full mb-4 mt-4 ${isDisabled() ? "bg-gray-200" : "bg-main-1"
          }`}
      >
        <Text className="text-center font-semibold text-white">
          {` Purchase | ${currencies[cart[0].currency]}${cart
            .reduce((acc, item) => acc + item.totalPrice, 0)
            .toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderType;