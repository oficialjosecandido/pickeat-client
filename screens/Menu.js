import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ICONS, THEME } from "../constants";
import { LinearGradient } from "expo-linear-gradient";
import { useModal } from "../context/ModalContext";
import OrderMenu from "../components/OrderMenu";
import { useUser } from "../context/UserContext";
import SkeletonLoader from "../components/SkeletonLoader";
import { useData } from "../context/DataContext";
import MenuFilter from "../components/MenuFilter";

const splitArrayIntoChunks = (arr, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

const Menu = ({ navigation, route: { params } }) => {
  const stadium = params.stadium;
  const { setBottomSheetVisible, setBottomSheetContent } = useModal();
  const { cart } = useUser();
  const { getMenuItems, currencies } = useData();

  const [filter, setFilter] = useState([]);
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);

  const openFilter = () => {
    setBottomSheetContent(<MenuFilter />);
    setBottomSheetVisible(true);
  };

  const openMenu = (item) => {
    setBottomSheetContent(<OrderMenu item={item} />);
    setBottomSheetVisible(true);
  };

  useEffect(() => {
    const fetchMenu = async () => {
      setMenuLoading(true);
      try {
        const menus = await getMenuItems(stadium._id);
        setMenu(menus);
      } catch (error) {
        console.error(`Error getting menu items: ${error.message}`);
      } finally {
        setMenuLoading(false);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    if (filter.length === 0) {
      setFilteredMenu(menu);
    } else {
      setFilteredMenu(menu.filter((item) => filter.includes(item.resId)));
    }
  }, [filter, menu]);

  return (
    <View className="flex-1 bg-white">
      <View className="h-64 w-full">
        <TouchableOpacity
          onPress={() => {
            setBottomSheetVisible(false);
            setBottomSheetContent(null);
            navigation.goBack();
          }}
          className="bg-white/50 p-3 absolute z-10 rounded-full top-2 left-2"
        >
          <Image source={ICONS.back} className="h-4 w-4" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setBottomSheetVisible(false);
            setBottomSheetContent(null);
            navigation.navigate("cart");
          }}
          className="bg-white/50 p-3 absolute z-10 rounded-full top-2 right-2"
        >
          {cart.length > 0 && (
            <View className="absolute rounded-full bg-main-1 h-5 w-5 flex items-center justify-center top-0 right-0">
              <Text
                numberOfLines={1}
                className="text-[10px] text-white font-bold"
              >
                {cart.length}
              </Text>
            </View>
          )}
          <Image source={ICONS.cart} className="h-4 w-4" />
        </TouchableOpacity>
        <Image
          source={{
            uri: stadium.image,
          }}
          className="w-full h-full object-cover"
        />
        <Image
          className="absolute bottom-0 left-0 right-0 h-64 w-full"
          source={ICONS.wave}
        />
      </View>
      <View className="flex-row px-2 mb-4 items-center space-x-2">
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          className="w-full px-3"
        >
          {(stadium?.restaurants ?? []).map((restaurant, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                onPress={() =>
                  setFilter((prev) =>
                    prev.includes(restaurant._id)
                      ? prev.filter((i) => i !== restaurant._id)
                      : [...prev, restaurant._id]
                  )
                }
                className={`bg-white rounded-full my-2 h-14 w-14 border-2 ${
                  filter.includes(restaurant._id)
                    ? "border-main-1"
                    : "border-black/10"
                }`}
              >
                <Image
                  source={{
                    uri: restaurant.logo,
                  }}
                  className="h-full w-full m-auto rounded-full"
                />
              </TouchableOpacity>
              {index !== 6 && <View className="h-full w-6" />}
            </React.Fragment>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={openFilter} className="p-2">
          <Image source={ICONS.filter} className="h-6 w-6" />
        </TouchableOpacity>
      </View>
      {menuLoading ? (
        <View className="flex-row items-center justify-between flex-wrap px-4">
          <SkeletonLoader height={250} width={THEME.screenWidth / 2.3} />
          <SkeletonLoader height={250} width={THEME.screenWidth / 2.3} />
          <SkeletonLoader
            style={{
              marginTop: 40,
            }}
            height={250}
            width={THEME.screenWidth / 2.3}
          />
          <SkeletonLoader
            style={{
              marginTop: 40,
            }}
            height={250}
            width={THEME.screenWidth / 2.3}
          />
        </View>
      ) : (
        <FlatList
          data={splitArrayIntoChunks(filteredMenu, 2)}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 8 }}
          renderItem={({ item: chunk }) => (
            <View className="w-full flex-row space-x-2 mb-4">
              {chunk.map((item) => (
                <View key={item._id} className="flex-1 rounded-3xl">
                  <Image
                    source={{
                      uri: item.imageUrl,
                    }}
                    className="w-full object-cover h-64 rounded-3xl"
                  />
                  <View className="h-14 w-14 rounded-bl-3xl bg-white absolute right-0 top-0">
                    <Image
                      source={ICONS.cover}
                      className="w-5 h-5 absolute -left-5 top-0"
                    />
                    <Image
                      source={ICONS.cover}
                      className="w-5 h-5 absolute right-0 -bottom-5"
                      style={{
                        transform: [
                          {
                            translateY: -1,
                          },
                        ],
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => openMenu(item)}
                      className="bg-main-1 self-start p-3.5 rounded-full absolute top-0 right-0"
                    >
                      <Image
                        source={ICONS.add}
                        className="h-4 w-4"
                        style={{
                          tintColor: "white",
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    className="absolute bottom-0 left-0 right-0 p-4 rounded-b-3xl"
                  >
                    <Text className="text-white font-bold text-[16px]">
                      {item.title}
                    </Text>
                    <Text className="text-white text-xs font-semibold mt-1">
                      {currencies[item.currency]}
                      {item.price}
                    </Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Menu;
