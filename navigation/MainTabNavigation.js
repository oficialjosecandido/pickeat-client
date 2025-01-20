import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Image, Keyboard, Pressable, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { ICONS } from "../constants";

import Home from "../screens/Home";
import { useUser } from "../context/UserContext";
import Cart from "../screens/Cart";
import Profile from "../screens/Profile";
import Orders from "../screens/Orders";

const Tab = createBottomTabNavigator();

const TabBarComponent = ({ name, active, onLayout, onPress }) => {
  const { cart } = useUser();
  const tabBarIconStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(active ? 1 : 0.7, { duration: 250 }),
    };
  });

  return (
    <Pressable
      className="h-14 justify-center items-center flex-row items-center gap-1 flex-1"
      onLayout={onLayout}
      onPress={onPress}
    >
      <Animated.View style={tabBarIconStyle}>
        <Image
          className="h-8 w-8"
          resizeMethod="contain"
          source={ICONS[name]}
          style={{ tintColor: active ? "#000000" : "#A0A0A0" }}
        />
        {name === "cart" && cart.length > 0 && (
          <View
            className={`bg-main-1 h-3 w-3 rounded-full absolute bottom-0 right-0 border border-main-1 shadow shadow-main-1`}
            style={{
              elevation: 7,
            }}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

const AnimatedTabBar = ({
  state: { index: activeIndex, routes },
  navigation,
}) => {
  const [tabBarHide, setTabBarHide] = useState(false);

  useEffect(() => {
    // Event listener for the keyboard show event
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setTabBarHide(true);
      }
    );

    // Event listener for the keyboard hide event
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setTabBarHide(false);
      }
    );

    // Cleanup function to remove the listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <View
      className="w-full bg-white border-t-0 py-2 border-t border-gray-200"
      style={{
        display: tabBarHide ? "none" : "flex",
        zIndex: 100,
      }}
    >
      <View className="flex-row px-6 justify-between">
        {routes.map((route, index) => {
          const active = index === activeIndex;

          return (
            <TabBarComponent
              key={route.key}
              name={route.name}
              active={active}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tab.Screen name="menu" component={Home} />
      <Tab.Screen name="orders" component={Orders} />
      <Tab.Screen name="cart" component={Cart} />
      <Tab.Screen name="account" component={Profile} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
