import { View, Text, TouchableOpacity, Image, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import { ICONS } from "../constants";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useModal } from "../context/ModalContext";
import { useUser } from "../context/UserContext";
import { useData } from "../context/DataContext";

const OrderMenu = ({ item }) => {
  const { setBottomSheetVisible, setBottomSheetContent } = useModal();
  const { addToCart } = useUser();
  const { currencies } = useData();

  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(item.price * 1);
  const [allergenics, setAllergenics] = useState(false);
  const [notes, setNotes] = useState("");

  const finish = async () => {
    try {
      setLoading(true);
      await addToCart({
        ...item,
        amount: orderNumber,
        extras: additions.map((index) => item.extras[index]),
        totalPrice: parseFloat(totalPrice),
        notes,
      });
    } catch (error) {
      console.error("Error adding to cart from OrderMenu:", error);
    } finally {
      setLoading(false);
      setBottomSheetVisible(false);
      setBottomSheetContent(null);
    }
  };

  const [orderNumber, setOrderNumber] = useState(1);
  const [additions, setAdditions] = useState([]);

  useEffect(() => {
    const totalAdditions = additions.reduce(
      (acc, index) => acc + item.extras[index].price,
      0
    );
    setTotalPrice(((item.price + totalAdditions) * orderNumber).toFixed(2));
  }, [orderNumber, additions]);

  return (
    <View className="px-2 bg-white border border-black/20 rounded-t-2xl">
      <View className="flex-row items-center justify-between py-4">
        <View className="flex-row items-center space-x-2">
          <Image
            source={{ uri: item.imageUrl }}
            className="h-20 w-20 rounded-full"
            resizeMode="cover"
          />
          <Text className="text-[16px] font-bold">{item.title}</Text>
        </View>
        <View className="flex-row items-center p-1 space-x-2 rounded-full bg-gray-200">
          <TouchableOpacity
            onPress={() => setOrderNumber(orderNumber - 1)}
            disabled={orderNumber === 1}
            style={{
              opacity: orderNumber === 1 ? 0.5 : 1,
            }}
            className="p-2 rounded-full bg-white"
          >
            <Image source={ICONS.minus} className="h-2 w-2 object-contain" />
          </TouchableOpacity>
          <Text>{orderNumber}</Text>
          <TouchableOpacity
            onPress={() => setOrderNumber(orderNumber + 1)}
            className="p-2 rounded-full bg-white"
          >
            <Image source={ICONS.add} className="h-2 w-2 object-contain" />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-black/70 text-thin text-xs">
        {item.description}
      </Text>
      <View className="py-4">
        <Text className="font-bold text-[16px]">Ingredients</Text>
        {item.ingredients.map((ingredient, index) => (
          <Text key={index} className="font-light">
            {`▶ ${ingredient}`}
          </Text>
        ))}
      </View>
      <View className="border-t border-b border-black/10">
        <TouchableOpacity
          onPress={() => setAllergenics((prev) => !prev)}
          className="flex-row items-center space-x-2 py-2"
        >
          <View className="bg-main-1/10 rounded-lg border border-black/10 p-2">
            <Image
              source={ICONS.allergenic}
              className="h-4 w-4 object-contain"
              resizeMode="contain"
            />
          </View>
          <Text className="font-bold text-[16px]">
            Allergics & Nutritional Information
          </Text>
          <View className="flex-1 items-end">
            <Image
              source={ICONS.down}
              className={`h-4 w-4 object-contain ${
                allergenics ? "" : "-rotate-90"
              }`}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
        {allergenics && (
          <View className="py-2">
            <View className="">
              {item.allergics.map((allergenic, index) => (
                <Text key={index} className="font-light">
                  {`▶ ${allergenic}`}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className="py-4">
        <Text className="font-bold text-[16px]">Add Extra Adiitional*</Text>
        {item.extras.map((it, index) => {
          const multipleOptions = it?.multipleOptions ?? true;
          return (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between py-2 px-2"
              onPress={() =>
                setAdditions(
                  multipleOptions
                    ? additions.includes(index)
                      ? additions.filter((it) => it !== index)
                      : [...additions, index]
                    : index
                )
              }
            >
              <View
                className="h-4 w-4 rounded border mr-2 items-center justify-center"
                style={{
                  backgroundColor: additions.includes(index)
                    ? "#ec7d55"
                    : "white",
                }}
              >
                <Image
                  source={ICONS.check}
                  className="h-2 w-2 object-contain"
                  style={{
                    tintColor: additions.includes(index)
                      ? "white"
                      : "transparent",
                  }}
                />
              </View>
              <Text className="font-light flex-1">{it.title}</Text>
              <Text className="font-semibold">
                {currencies[item.currency]}
                {it.price}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View className="py-4">
        <Text className="font-bold text-[16px] mb-1">Add Notes*</Text>
        <BottomSheetTextInput
          style={{
            padding: 10,
            backgroundColor: "rgba(0,0,0,0.1)",
          }}
          placeholder="Add Notes"
          multiline
          value={notes}
          onChangeText={setNotes}
        />
      </View>
      <TouchableOpacity
        onPress={finish}
        className={`p-4 ${
          loading ? "bg-main-1/40" : "bg-main-1"
        } rounded-full mb-4`}
        disabled={loading}
      >
        <Text className="text-center font-semibold text-white">
          Add to Cart | {currencies[item.currency]}
          {totalPrice}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderMenu;
