import { createStackNavigator } from "@react-navigation/stack";
import MainTabNavigator from "./MainTabNavigation";
import Menu from "../screens/Menu";
import Settings from "../screens/Settings";
import Cards from "../screens/Cards";
import Coupons from "../screens/Coupons";
import Login from "../screens/Login";
import Register from "../screens/Register";
import ResetPassword from "../screens/ResetPassword";
import CustomWebView from "../screens/CustomWebView";

const Stack = createStackNavigator();

const StackNavigation = ({ ...props }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Menu" component={Menu} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Cards" component={Cards} />
      <Stack.Screen name="Coupons" component={Coupons} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="Webview" component={CustomWebView} />
    </Stack.Navigator>
  );
};

export default StackNavigation;
