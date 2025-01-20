import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  Image,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import MapView, { Marker } from "react-native-maps";
import { ICONS } from "../constants";
import { FlatList } from "react-native-gesture-handler";
import { useData } from "../context/DataContext";
import moment from "moment";
import { useUser } from "../context/UserContext";

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseInt(distance);
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const Home = ({ navigation }) => {
  const { getStadium } = useData();
  const { userLocation } = useUser();

  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(false);

  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const flatListRef = useRef(null);

  const handleSnapToIndex = () => {
    bottomSheetRef.current.snapToIndex(0);
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      if (viewableItems.length > 0) {
        const selected = viewableItems[0].index;
        const {
          location: { coordinates },
        } = stadiums[selected];

        const [longitude, latitude] = coordinates;

        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }
    },
    [stadiums]
  );

  useEffect(() => {
    const fetchStadiums = async () => {
      setLoading(true);
      const data = await getStadium(userLocation);
      setStadiums(data);
      setLoading(false);
    };

    fetchStadiums();
  }, [userLocation]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1">
        <MapView
          ref={mapRef}
          className="w-full h-[65%]"
          initialRegion={{
            latitude: 44.3845,
            longitude: 7.5427,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {stadiums.map((marker, index) => {
            const {
              location: { coordinates },
            } = marker;

            return (
              <Marker
                key={marker._id}
                coordinate={{
                  latitude: coordinates[1],
                  longitude: coordinates[0],
                }}
                title={marker.title}
              >
                <View className="rounded-full bg-white h-6 w-6 border-2 border-[#ec7d55] flex items-center justify-center">
                  <Text className="text-xs font-bold text-main-1">
                    {index + 1}
                  </Text>
                </View>
              </Marker>
            );
          })}
        </MapView>
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          enableContentPanningGesture={true}
          enablePanDownToClose={false}
          enableTouchOutsideToClose={false}
          dismissOnPanDown={false}
          snapPoints={["45%"]}
          animateOnExiting={true}
          handleIndicatorStyle={{ backgroundColor: "black" }}
          backgroundStyle={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          animationOutTiming={300}
          onClose={handleSnapToIndex}
        >
          <View className="bg-white px-4 py-2 flex-1">
            <Text className="font-bold text-sm text-left mb-2 mx-1">
              Stadiums near you
            </Text>
            <FlatList
              data={stadiums}
              horizontal
              ref={flatListRef}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              viewabilityConfig={viewabilityConfig}
              ItemSeparatorComponent={() => <View className="h-full w-2" />}
              onViewableItemsChanged={handleViewableItemsChanged}
              renderItem={({ item }) => {
                const now = moment();
                const events = item.events;
                const upcomingEvent = events.find((event) =>
                  moment(event.date).isAfter(now)
                );
                const distance = getDistanceFromLatLonInKm(
                  userLocation.latitude,
                  userLocation.longitude,
                  item.location.coordinates[1],
                  item.location.coordinates[0]
                );
                return (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() =>
                      navigation.navigate("Menu", { stadium: item })
                    }
                    className="relative w-72 rounded-2xl shadow-sm shadow-black bg-white mb-2 mx-1"
                  >
                    <View className="w-72 h-[60%]">
                      <Image
                        source={{
                          uri: item.image,
                        }}
                        className="flex-1 object-cover rounded-t-2xl h-full w-full object-cover"
                      />
                    </View>
                    <View className="p-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-semibold ">
                          {item.title}
                        </Text>
                        <View className="flex-row items-center bg-main-1 px-1">
                          <Text className="text-xs font-semibold text-white">
                            {`${distance} km`}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="p-2 flex-row space-x-2">
                      <Image
                        source={ICONS.calendar}
                        className="w-5 h-5"
                        resizeMode="contain"
                      />
                      <Text className="text-xs text-black/70 font-bold">
                        {upcomingEvent
                          ? upcomingEvent?.title
                          : "Real Madrid vs Barcelona"}
                      </Text>
                    </View>
                    <Text className="text-[10px] absolute bottom-2 right-2">
                      {upcomingEvent
                        ? moment(upcomingEvent?.date).format("MMM DD")
                        : ""}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </BottomSheet>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Home;
