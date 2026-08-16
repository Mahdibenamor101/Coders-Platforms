import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./src/navigation/types";
import { getSession } from "./src/storage/session";
import { colors } from "./src/theme";
import { LoginScreen } from "./src/screens/LoginScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { TractorsScreen } from "./src/screens/TractorsScreen";
import { TractorFormScreen } from "./src/screens/TractorFormScreen";
import { TrailersScreen } from "./src/screens/TrailersScreen";
import { TrailerFormScreen } from "./src/screens/TrailerFormScreen";
import { DriversScreen } from "./src/screens/DriversScreen";
import { DriverDetailScreen } from "./src/screens/DriverDetailScreen";
import { DriverFormScreen } from "./src/screens/DriverFormScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { OrderDetailScreen } from "./src/screens/OrderDetailScreen";
import { OrderFormScreen } from "./src/screens/OrderFormScreen";
import { TripsScreen } from "./src/screens/TripsScreen";
import { TripDetailScreen } from "./src/screens/TripDetailScreen";
import { TripFormScreen } from "./src/screens/TripFormScreen";
import { LiveMapScreen } from "./src/screens/LiveMapScreen";
import { MaintenanceScreen } from "./src/screens/MaintenanceScreen";
import { MaintenanceFormScreen } from "./src/screens/MaintenanceFormScreen";
import { RecommendationsScreen } from "./src/screens/RecommendationsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<"Login" | "Dashboard" | null>(null);

  useEffect(() => {
    getSession().then((session) => setInitialRoute(session ? "Dashboard" : "Login"));
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
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Tableau de bord", headerBackVisible: false }} />

        <Stack.Screen name="Tractors" component={TractorsScreen} options={{ title: "Tracteurs" }} />
        <Stack.Screen name="TractorForm" component={TractorFormScreen} />

        <Stack.Screen name="Trailers" component={TrailersScreen} options={{ title: "Remorques" }} />
        <Stack.Screen name="TrailerForm" component={TrailerFormScreen} />

        <Stack.Screen name="Drivers" component={DriversScreen} options={{ title: "Chauffeurs" }} />
        <Stack.Screen name="DriverDetail" component={DriverDetailScreen} options={{ title: "Chauffeur" }} />
        <Stack.Screen name="DriverForm" component={DriverFormScreen} />

        <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: "Commandes" }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Commande" }} />
        <Stack.Screen name="OrderForm" component={OrderFormScreen} />

        <Stack.Screen name="Trips" component={TripsScreen} options={{ title: "Tournées" }} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: "Tournée" }} />
        <Stack.Screen name="TripForm" component={TripFormScreen} options={{ title: "Nouvelle tournée" }} />

        <Stack.Screen name="Live" component={LiveMapScreen} options={{ title: "Carte live" }} />

        <Stack.Screen name="Maintenance" component={MaintenanceScreen} options={{ title: "Maintenance" }} />
        <Stack.Screen name="MaintenanceForm" component={MaintenanceFormScreen} options={{ title: "Nouvelle intervention" }} />

        <Stack.Screen name="Recommendations" component={RecommendationsScreen} options={{ title: "Recommandations" }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Paramètres" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
