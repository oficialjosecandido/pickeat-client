import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { ICONS } from "../constants";
import OrderDateTime from "../components/OrderDateTime";
import { useModal } from "../context/ModalContext";
import { useData } from "../context/DataContext";

const Cart = ({ navigation }) => {
  const { cart, deleteFromCart, clearCart, updateCartItem } = useUser();
  const { setBottomSheetVisible, setBottomSheetContent } = useModal();
  const { currencies } = useData();

  const [loading, setLoading] = useState(false);

  const handleCreateOrder = () => {
    const isCartHasMultipleStadiums = cart.some(
      (item) => item.stadiumId !== cart[0].stadiumId
    );
    
    if (isCartHasMultipleStadiums) {
      if (Platform.OS === 'android') {
        Alert.alert(
          "Order Error",
          "You can't order from multiple stadiums at once",
          [{ text: "OK" }]
        );
      } else {
        alert("You can't order from multiple stadiums at once");
      }
      return;
    }
    
    const stadiumId = cart[0].stadiumId;
    const restaurants = cart.map((item) => item.resId);
    setBottomSheetContent(
      <OrderDateTime restaurants={restaurants} stadiumId={stadiumId} />
    );
    setBottomSheetVisible(true);
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    
    if (Platform.OS === 'android') {
      Alert.alert(
        "Clear Cart",
        "Are you sure you want to clear the cart?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Clear",
            onPress: () => clearCart(false),
            style: "destructive"
          }
        ]
      );
    } else {
      Alert.alert(
        "Clear Cart",
        "Are you sure you want to clear the cart?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Clear",
            onPress: () => clearCart(false),
            style: "destructive"
          }
        ],
        { cancelable: true }
      );
    }
  };

  const handleDeleteItem = (itemId) => {
    if (Platform.OS === 'android') {
      Alert.alert(
        "Remove Item",
        "Are you sure you want to remove this item?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Remove",
            onPress: () => deleteFromCart(itemId),
            style: "destructive"
          }
        ]
      );
    } else {
      Alert.alert(
        "Remove Item",
        "Are you sure you want to remove this item?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Remove",
            onPress: () => deleteFromCart(itemId),
            style: "destructive"
          }
        ],
        { cancelable: true }
      );
    }
  };
  

  const handleUpdateCartItem = async (id, amount) => {
    try {
      setLoading(true);
      await updateCartItem(id, amount);
    } catch (error) {
      if (Platform.OS === 'android') {
        Alert.alert(
          "Error",
          "Failed to update cart item",
          [{ text: "OK" }]
        );
      } else {
        console.error("Error updating cart item:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl uppercase">My Items ({cart.length})</Text>
        <TouchableOpacity
          className={`px-2 py-1 border border-main-1 ${
            Platform.OS === "ios"
              ? "shadow-sm shadow-black/20"
              : "shadow shadow-black"
          } bg-white rounded-lg`}
          onPress={handleClearCart}
        >
          <Text className="text-sm text-main-1">Clear All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="mt-4 bg-gray-200 rounded-lg p-4">
        {cart.map((item, index) => {
          return (
            <View
              key={index}
              className="rounded-lg border border-black/20 p-2 flex-row space-x-3 bg-white"
              style={{
                marginTop: index === 0 ? 0 : 10,
              }}
            >
              <View className="border rounded-lg border-black/20 flex items-center justify-center px-2 py-4">
                <Image
                  source={{
                    uri: item.imageUrl,
                  }}
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
                  {item.totalPrice}
                </Text>
                {item.extras.map((extra) => (
                  <View
                    key={extra._id}
                    className="flex-row items-center justify-between"
                  >
                    <Text className="text-xs text-black/70">
                      • {extra.title}
                    </Text>
                    <Text className="text-xs font-bold">
                      {currencies[item.currency]}
                      {extra.price.toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View className="flex-row items-end justify-between flex-1 pt-2">
                  <View className="flex-row items-center space-x-2">
                    <TouchableOpacity
                      disabled={loading}
                      onPress={() => {
                        if (item.amount === 1) {
                          handleDeleteItem(item._id);
                        } else {
                          handleUpdateCartItem(item._id, item.amount - 1);
                        }
                      }}
                      className="p-2 rounded-full border border-black/20"
                    >
                      <Image source={ICONS.minus} className="h-2 w-2" />
                    </TouchableOpacity>
                    <Text className="underline">{item.amount}</Text>
                    <TouchableOpacity
                      disabled={loading}
                      onPress={() =>
                        handleUpdateCartItem(item._id, item.amount + 1)
                      }
                      className="p-2 rounded-full border border-black/20"
                    >
                      <Image source={ICONS.add} className="h-2 w-2" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item._id)}
                    className="p-2 rounded-full border border-black/20"
                  >
                    <Image source={ICONS.close} className="h-2 w-2" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <TouchableOpacity
        onPress={handleCreateOrder}
        disabled={!cart.length || loading}
        className={`mt-4 px-4 py-3 ${
          !cart.length ? "bg-gray-400" : "bg-main-1"
        } rounded-lg ${
          Platform.OS === "ios"
            ? "shadow-sm shadow-black/20"
            : "shadow shadow-black"
        }`}
      >
        <Text className="text-white text-center">
          Checkout
          {cart.length > 0
            ? ` | ${currencies[cart[0].currency]}${cart
                .reduce((acc, item) => acc + item.totalPrice, 0)
                .toFixed(2)}`
            : ""}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Cart;