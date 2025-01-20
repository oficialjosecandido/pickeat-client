import { Image, Text, TouchableOpacity } from "react-native";
import { ICONS } from "../constants";
import Toast from "react-native-toast-message";
import { useUser } from "../context/UserContext";
import * as Google from 'expo-auth-session/providers/google'; // Add this import

const GoogleLogin = () => {
  const { loginWithGoogle } = useUser();
  
  // Move the Google auth configuration here
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '483628641353-5t2ugdncs0apei9iooh47332rgvvp0ao.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  const handleGoogleSignIn = async () => {
    try {
      const result = await promptAsync();
      
      if (result?.type === 'success') {
        const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
        });
        
        const userInfo = await userInfoResponse.json();
        
        await loginWithGoogle(
          userInfo.email,
          userInfo.given_name,
          userInfo.family_name,
          userInfo.picture
        );
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Google Sign In Failed",
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={handleGoogleSignIn}
      disabled={!request}
      className="bg-main-1/10 border border-black/10 rounded-lg py-3 flex-row items-center justify-center space-x-2 text-sm"
    >
      <Image source={ICONS.google} className="h-4 w-4" resizeMode="cover" />
      <Text className="text-center text-xs font-semibold">
        Login With Google
      </Text>
    </TouchableOpacity>
  );
};

export default GoogleLogin;