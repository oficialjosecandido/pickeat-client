import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useModal } from "./ModalContext";
import api from "../api";
import io from "socket.io-client";
import VerifyEmail from "../screens/VerifyEmail";
import Splash from "../screens/Splash";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
////////////////////////////////////////////////////push notification///////////////////////////////////////////////
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";


const socket_url = "https://pickeat-backend.azurewebsites.net/";

WebBrowser.maybeCompleteAuthSession();


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notifications!");
      return;
    }

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "168e5059-2a97-4304-a9cf-8b9eaadcf1d1",
      })
    ).data;

    // Added console.log to print the token
    console.log("Expo Push Token:", token);

    return token;
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const userContext = createContext();
export const useUser = () => useContext(userContext);

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const UserContext = ({ children }) => {
  const { confirmModal, setShowModal, setModalContent } = useModal();

  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: 44.3845,
    longitude: 7.5427,
  });
  const [userLoading, setUserLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [socket, setSocket] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  const getGuestID = async () => {
    let guestID = await AsyncStorage.getItem("guestID");
    if (!guestID) {
      guestID = generateUUID();
      await AsyncStorage.setItem("guestID", guestID);
    }
    return guestID;
  };

  // assing push notification token
  const assingPushNotificationToken = async (token, user) => {
    try {
      const userID = user?.userID || (await getGuestID());
      await api.post("/auth/push-token", { token, userID });
    } catch (error) {
      console.error("Error assigning push notification token", error);
    }
  };

  // Function to ask user for location and update userLocation
  const requestUserLocation = async () => {
    try {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      // Get the user's current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
    } catch (error) {
      console.error("Error requesting location:", error);
    }
  };

  // Authentication
  const confirmEmail = async (email) => {
    setModalContent(
      <VerifyEmail
        email={email}
        verifyEmail={verifyEmail}
        resentVerificationEmail={resentVerificationEmail}
      />
    );
    setShowModal(true);
  };

  const loginWithGoogle = async (email, firstName, lastName, profileImg) => {
    try {
      // Get the Expo push token before login
      const expo_token = await Notifications.getExpoPushTokenAsync({
        projectId: "168e5059-2a97-4304-a9cf-8b9eaadcf1d1",
      }).then((response) => response.data);

      const {
        data: { token, user },
      } = await api.post("/auth/oAuth/google", {
        email,
        firstName,
        lastName,
        profileImg,
        expo_token,
      });

      setUser(user);
      await AsyncStorage.setItem("token", token);
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };


  const login = async (email, password) => {
    try {
      // Get the Expo push token before login
      const expo_token = await Notifications.getExpoPushTokenAsync({
        projectId: "168e5059-2a97-4304-a9cf-8b9eaadcf1d1",
      }).then((response) => response.data);

      const {
        data: { token, user },
      } = await api.post("/auth/login", {
        email,
        password,
        expo_token, // Changed to expo_token
      });

      setUser({
        ...user,
      });
      await AsyncStorage.setItem("token", token);

      // Optionally, set the Expo push token in the context state
      setExpoPushToken(expo_token);
    } catch (error) {
      const errorCode = error.response?.data?.code;
      if (errorCode === 1) return confirmEmail(email);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      await api.post("/auth/register", {
        email,
        password,
        firstName,
        lastName,
      });
      confirmEmail(email);
    } catch (error) {
      console.error("Error registering", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      await api.post("/auth/verify-email", { email, code });
    } catch (error) {
      console.error("Error verifying email", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const resentVerificationEmail = async (email) => {
    try {
      await api.post("/auth/resend-verification-code", { email });
    } catch (error) {
      console.error("Error resending verification email", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const changeEmail = async (email) => {
    try {
      await api.post("/auth/change-email", { email });
    } catch (error) {
      console.error("Error changing email", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const verifyChangeEmail = async (code) => {
    try {
      const {
        data: { email },
      } = await api.post("/auth/verify-change-email", { code });
      setUser((prev) => ({ ...prev, email }));
    } catch (error) {
      console.error("Error verifying change email", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const getCards = async () => {
    try {
      const { data } = await api.get("/auth/cards");
      return data;
    } catch (error) {
      console.error("Error getting cards", error);
      return [];
    }
  };

  const changeNames = async (firstName, lastName) => {
    try {
      await api.post("/auth/change-names", { firstName, lastName });
      setUser((prev) => ({ ...prev, firstName, lastName }));
    } catch (error) {
      console.error("Error changing names", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const changePassword = async (password) => {
    try {
      await api.post("/auth/change-password", { password });
    } catch (error) {
      console.error("Error changing password", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const getMyCoupons = async () => {
    try {
      const { data } = await api.get("/auth/coupons");
      return data;
    } catch (error) {
      console.error("Error getting my coupons", error);
      return [];
    }
  };

  const uploadProfileImage = async (imageResult) => {
    try {
      const formData = new FormData();
      const image = imageResult.assets[0];

      formData.append("image", {
        uri: image.uri,
        name: image.fileName || "profile.jpg",
        type: image.mimeType || "image/jpeg",
      });

      const {
        data: { profileImage },
      } = await api.post("/auth/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser((prev) => ({ ...prev, profileImage }));
    } catch (error) {
      // Handle Axios error
      console.error(error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  // Reset Password
  const forgotPassword = async (email) => {
    try {
      await api.post("/auth/forgot-password", { email });
    } catch (error) {
      console.error("Error sending reset password email", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const verifyResetPasswordCode = async (email, code) => {
    try {
      await api.post("/auth/verify-reset-password-code", { email, code });
    } catch (error) {
      console.error("Error verifying reset password code", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const resetPassword = async (email, password) => {
    try {
      const {
        data: { token, user },
      } = await api.post("/auth/reset-password", { email, password });
      setUser({
        ...user,
      });
      await AsyncStorage.setItem("token", token);
    } catch (error) {
      console.error("Error resetting password", error);
      const message = error.response?.data?.message || "Internal server error.";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setUser(null);
      api.defaults.headers["Authorization"] = null;
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  const verifyUser = async () => {
    setUserLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const { data } = await api.get("/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      setUser(data);
    } catch (error) {
      console.error("Error verifying user", error);
    } finally {
      setUserLoading(false);
    }
  };
  //  Cart
  const saveCartToDB = async (item) => {
    return api.post(`/auth/cart`, { item });
  };

  const removeCartFromDB = async (itemID) => {
    return api.delete(`/auth/cart/${itemID}`);
  };

  const clearCartFromDB = async () => {
    return api.delete(`/auth/cart/clear`);
  };

  const addToCart = async (item) => {
    try {
      if (user?.userID) {
        await saveCartToDB(item);
      } else {
        await AsyncStorage.setItem(`cart`, JSON.stringify([...cart, item]));
      }
      setCart([...cart, item]);
    } catch (error) {
      console.error("Error adding to cart", error);
    }
  };

  const deleteFromCart = async (itemID) => {
    try {
      if (user?.userID) {
        await removeCartFromDB(itemID);
      }

      const storageCart = await AsyncStorage.getItem(`cart`);
      if (storageCart) {
        const isStorageItem = JSON.parse(storageCart).find(
          (it) => it._id === itemID
        );
        if (isStorageItem) {
          const newStorageCart = JSON.parse(storageCart).filter(
            (it) => it._id !== itemID
          );
          await AsyncStorage.setItem(`cart`, JSON.stringify(newStorageCart));
        }
      }

      setCart((prev) => prev.filter((it) => it._id !== itemID));
    } catch (error) {
      console.error("Error deleting from cart", error);
    }
  };

  const clearCart = async (confirm = true) => {
    try {
      if (cart.length === 0) {
        return;
      }
      if (confirm) {
        await confirmModal("Are you sure you want to clear the cart?");
      }
      if (user?.userID) {
        await clearCartFromDB();
      }
      await AsyncStorage.removeItem(`cart`);
      setCart([]);
    } catch (error) {
      console.error("Error clearing cart", error);
    }
  };

  const getCartItems = async () => {
    try {
      const cartItems = await AsyncStorage.getItem(`cart`);
      const cart = [];
      if (cartItems) {
        cart.push(...JSON.parse(cartItems));
      }
      if (user?.userID) {
        const token = await AsyncStorage.getItem("token");
        const { data } = await api.get(`/auth/cart`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        cart.push(...data);
      }
      setCart(cart);
    } catch (error) {
      console.error("Error getting cart items", error);
    }
  };

  const updateCartItem = async (id, amount) => {
    try {
      if (user?.userID) {
        await api.put(`/auth/cart`, { amount, itemID: id });
      } else {
        const storageCart = await AsyncStorage.getItem(`cart`);
        if (storageCart) {
          const newStorageCart = JSON.parse(storageCart).map((it) => {
            if (it._id === id) {
              return {
                ...it,
                amount,
                totalPrice:
                  (it.price +
                    it.extras.reduce((acc, extra) => acc + extra.price, 0)) *
                  amount,
              };
            }
            return it;
          });
          await AsyncStorage.setItem(`cart`, JSON.stringify(newStorageCart));
          setCart(newStorageCart);
        }
      }

      setCart((prev) => {
        return prev.map((it) => {
          if (it._id === id) {
            return {
              ...it,
              amount,
              totalPrice:
                (it.price +
                  it.extras.reduce((acc, extra) => acc + extra.price, 0)) *
                amount,
            };
          }
          return it;
        });
      });
    } catch (error) {
      console.error("Error updating cart item", error);
    }
  };

  // stripe
  const getPaymentIntent = async (
    cart,
    deliveryOption,
    deliveryAddress,
    timeSlot,
    stadiumId,
    coupon,
    event_type
  ) => {
    try {
      const userID = user?.userID || (await getGuestID());
      const token = await AsyncStorage.getItem("token");
      
      // Log the request payload for debugging
      console.log('Payment Intent Request Payload:', {
        cart,
        userID,
        deliveryOption,
        deliveryAddress,
        timeSlot,
        stadiumId,
        coupon,
        event_type
      });
  
      const response = await api.post("/auth/payment-intent", 
        {
          cart,
          userID,
          deliveryOption,
          deliveryAddress,
          timeSlot,
          stadiumId,
          coupon,
          event_type
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      return response.data;
    } catch (error) {
      // Enhanced error logging
      console.error('Payment Intent Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stripeError: error.response?.data?.main_error,
        requestPayload: {
          cart,
          userID: user?.userID,
          deliveryOption,
          deliveryAddress,
          timeSlot,
          stadiumId,
          coupon,
          event_type
        }
      });
  
      // If it's a Stripe error, throw a more specific error
      if (error.response?.data?.main_error) {
        throw {
          message: error.response.data.main_error.message || error.response.data.main_error.raw.message,
          code: error.response.data.main_error.code,
          type: 'STRIPE_ERROR',
          details: error.response.data.main_error
        };
      }
  
      // Otherwise throw the original error
      throw error;
    }
  };

  const setDefaultCard = async (paymentMethodId) => {
    try {
      await api.post("/auth/card/default", { paymentMethodId });
    } catch (error) {
      console.error("Error setting default card", error);
      throw error;
    }
  };

  const removeCard = async (paymentMethodId) => {
    try {
      console.log(paymentMethodId);
      await api.delete(`/auth/card/${paymentMethodId}`);
    } catch (error) {
      console.error("Error removing card", error);
      throw error;
    }
  };

  const getSetupIntent = async () => {
    try {
      const { data } = await api.get("/auth/payment-setup");
      return data;
    } catch (error) {
      console.error("Error getting setup intent", error);
      throw error;
    }
  };

  // orders
  const getOrders = async () => {
    try {
      const userID = user?.userID || (await getGuestID());
      const { data } = await api.post("/auth/orders", {
        userID,
      });
      return data;
    } catch (error) {
      console.error("Error getting orders", error);
      return [];
    }
  };

  const getOrdersHistory = async () => {
    try {
      const userID = user?.userID || (await getGuestID());
      const { data } = await api.post("/auth/order_history", {
        userID,
      });
      return data;
    } catch (error) {
      console.error("Error getting orders history", error);
      return [];
    }
  };

  const provided = {
    // authentication
    user,
    login,
    loginWithGoogle,
    register,
    verifyEmail,
    resentVerificationEmail,
    logout,
    changeEmail,
    verifyChangeEmail,
    changeNames,
    changePassword,
    getMyCoupons,
    uploadProfileImage,
    // reset password
    forgotPassword,
    verifyResetPasswordCode,
    resetPassword,
    // cart
    cart,
    addToCart,
    deleteFromCart,
    clearCart,
    updateCartItem,
    // location
    userLocation,
    // stripe
    getPaymentIntent,
    getCards,
    setDefaultCard,
    removeCard,
    getSetupIntent,
    // orders
    getOrders,
    getOrdersHistory,
    // socket
    socket
  };

  // get user location and verify user
  useEffect(() => {
    verifyUser();
    requestUserLocation();
  }, []);

  // get cart items
  useEffect(() => {
    getCartItems();
  }, [user]);

  //google login
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId:
  //       "344943561927-q49er88fmi4907k38dfbbp80n6e7le8s.apps.googleusercontent.com",
  //   });
  // }, []);

  // Add Google Auth Request state
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    expoClientId: 'YOUR_EXPO_CLIENT_ID', // For Expo Go
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  // push notification

  useEffect(() => {
    if (user) {
      const newSocket = io(socket_url);
      newSocket.on("connect", () => {
        newSocket.emit("assign_user", {
          userID: user.userID,
        });
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    // Listener for foreground notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // console.log("Notification Received: ", notification);

        // Access the custom data here
        const customData = notification.request.content.data;
        // console.log("Custom Data: ", customData);
      });

    // Listener for notification response (when user interacts with the notification)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const customData = response.notification.request.content.data;
        // console.log("Custom Data from Response: ", customData);
        route = customData?.route;
        if (route) {
          navigation.navigate(route, customData);
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (expoPushToken) {
      assingPushNotificationToken(expoPushToken, user);
    }
  }, [expoPushToken, user]);

  if (userLoading) return <Splash />;

  return (
    <userContext.Provider value={provided}>{children}</userContext.Provider>
  );
};

export default UserContext;