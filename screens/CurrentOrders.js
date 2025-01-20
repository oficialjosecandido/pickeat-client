import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useCallback, useState } from "react";
import { ICONS, IMAGES } from "../constants";
import { useModal } from "../context/ModalContext";
import OrderCompletionScan from "../components/OrderCompletionScan";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import Loader from "../components/Loader";
import moment from "moment";
import { useData } from "../context/DataContext";

const EmptyOrders = () => {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="font-semibold">No current orders found</Text>
    </View>
  );
};

const CurrentOrders = () => {
  const { setShowModal, setModalContent } = useModal();
  const { getOrders } = useUser();
  const { currencies } = useData();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleScanBarcode = (orderId, id) => {
    setShowModal(true);
    setModalContent(<OrderCompletionScan id={id} orderId={orderId} />);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getOrders()
        .then((data) => {
          setOrders(data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }, [])
  );

  if (loading) {
    return <Loader />;
  }

  if (orders.length === 0) {
    return <EmptyOrders />;
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    >
      {orders.map((order, index) => (
        <View
          key={index}
          className="rounded-lg border border-black/10 p-2 bg-main-1/10 mt-4"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold">{`Order: ${order.orderID}`}</Text>
            {order.status === "ready" ? (
              <TouchableOpacity
                onPress={() => handleScanBarcode(order.orderID, order._id)}
              >
                <Image
                  source={ICONS.barcode}
                  className="h-5 w-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center space-x-1">
                <Image
                  source={ICONS.timer}
                  className="h-5 w-5"
                  resizeMode="contain"
                />
                <Text className="text-xs font-semibold">
                  {moment(order.timeSlot, "HH:mm").fromNow()}
                </Text>
              </View>
            )}
          </View>
          {order.items.map((item, index) => (
            <View
              key={index}
              className={`flex-row space-x-3 mt-4 pb-4 ${
                index === order.items.length - 1
                  ? ""
                  : "border-b border-black/10"
              }`}
            >
              <View className="border rounded-lg border-black/10 flex items-center justify-center px-2 py-4 bg-white">
                <Image
                  source={{ uri: item.image }}
                  className="h-20 w-20 rounded-lg"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <Text numberOfLines={2} className="font-semibold">
                  {item.title}
                </Text>
                <Text className="my-1 text-base font-bold text-main-1">
                  {currencies[item.currency]}
                  {item.price}
                </Text>
                <View className="flex-row flex-1">
                  <View className="flex-1">
                    {item.extras.map((extra) => (
                      <Text key={extra._id} className="text-xs text-black/70">
                        • {extra.title}
                      </Text>
                    ))}
                  </View>
                  <Text className="text-xs font-semibold mt-auto">
                    Quantity: {item.quantity}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export default CurrentOrders;
