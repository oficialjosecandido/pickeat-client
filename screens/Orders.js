import { View, Text } from "react-native";
import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CurrentOrders from "./CurrentOrders";
import OrdersHistory from "./OrdersHistory";

const Tab = createMaterialTopTabNavigator();

const OrdersTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: "#ec7d55" }, // Change the indicator color
        tabBarLabelStyle: {
          textTransform: "none", // Disable all caps
          fontSize: 14, // Customize the font size
          fontWeight: "bold", // Customize the font weight
        },
        tabBarActiveTintColor: "#ec7d55", // Customize the active tab text color
        tabBarInactiveTintColor: "#999999", // Customize the inactive tab text color
      }}
    >
      <Tab.Screen
        name="CurrentOrders"
        component={CurrentOrders}
        options={{ title: "Current Orders" }} // Customize the tab title
      />
      <Tab.Screen
        name="OrdersHistory"
        component={OrdersHistory}
        options={{ title: "Order History" }} // Customize the tab title
      />
    </Tab.Navigator>
  );
};

const Orders = () => {
  return (
    <View className="flex-1 bg-white px-4">
      <Text className="font-bold text-lg text-center py-2">Orders</Text>
      <OrdersTabs />
    </View>
  );
};

export default Orders;
