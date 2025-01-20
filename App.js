import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import StackNavigation from "./navigation/StackNavigation";
import ModalContext from "./context/ModalContext";
import BottomSwiper from "./components/BottomSwiper";
import UserContext from "./context/UserContext";
import ModalContainer from "./components/ModalContainer";
import ConfirmAppExit from "./components/ConfirmAppExit";

import Toast from "react-native-toast-message";
import { LogBox } from "react-native";
import DataContext from "./context/DataContext";
import { StripeProvider } from "@stripe/stripe-react-native";

LogBox.ignoreAllLogs(true);

const App = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StripeProvider publishableKey="pk_test_51QM8CZCdnYheM7pM1ePz4zzI4mNISvMe5SvNPmMOgQhB21GvnDUXQYfQs8OxaZQPogIhWZPjivkKc3BFcOVFHV6l001Ffub9vw">
            <NavigationContainer>
              <ModalContext>
                <UserContext>
                  <DataContext>
                    <StatusBar style="dark" />
                    <StackNavigation />
                    <BottomSwiper />
                    <ModalContainer />
                    <ConfirmAppExit />
                    <Toast />
                  </DataContext>
                </UserContext>
              </ModalContext>
            </NavigationContainer>
          </StripeProvider>
        </GestureHandlerRootView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;