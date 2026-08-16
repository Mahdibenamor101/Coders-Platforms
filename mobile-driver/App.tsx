import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./src/navigation/types";
import { getSession } from "./src/storage/session";
import { colors } from "./src/theme";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MissionsScreen } from "./src/screens/MissionsScreen";
import { OrderDetailScreen } from "./src/screens/OrderDetailScreen";
import { DashcamScreen } from "./src/screens/DashcamScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<"Login" | "Missions" | null>(null);

  useEffect(() => {
    getSession().then((session) => setInitialRoute(session ? "Missions" : "Login"));
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Missions" component={MissionsScreen} options={{ title: "Mes tournées" }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Commande" }} />
        <Stack.Screen name="Dashcam" component={DashcamScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
